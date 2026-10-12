import { NextResponse } from "next/server";
import { getDb, getEnv } from "@/db";
import { presupuesto, cliente, empresa, envioEmail, firma } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { pdfDe } from "@/lib/presupuesto-doc";
import { sendEmail } from "@/lib/email";
import { getPresupuestoCompleto, registrarEnvio } from "@/lib/data";

export const dynamic = "force-dynamic";

function baseUrl(): string {
  return (getEnv().APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Tarea programada (Cron) de seguimiento de presupuestos.
 * Puede ser invocada por Cloudflare Workers Cron Triggers o un servicio HTTP programado.
 */
export async function GET(request: Request) {
  const env = getEnv();
  const authHeader = request.headers.get("authorization");
  const cronSecret = env.CRON_SECRET;

  if (cronSecret) {
    const bearer = authHeader?.replace(/^Bearer\s+/i, "");
    const url = new URL(request.url);
    const queryKey = url.searchParams.get("key");
    if (bearer !== cronSecret && queryKey !== cronSecret) {
      return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 401 });
    }
  }

  const db = getDb();
  const ahora = Date.now();
  const tresDiasAtras = new Date(ahora - 3 * 86_400_000);

  // Buscar presupuestos en estado 'enviado' emitidos hace más de 3 días
  const candidatos = await db
    .select({
      id: presupuesto.id,
      empresaId: presupuesto.empresaId,
      codigo: presupuesto.codigo,
      titulo: presupuesto.titulo,
      validezDias: presupuesto.validezDias,
      fechaEmision: presupuesto.fechaEmision,
      tokenPublico: presupuesto.tokenPublico,
      clienteEmail: cliente.email,
      clienteNombre: cliente.nombre,
      empresaNombre: empresa.nombre,
      empresaTelefono: empresa.telefono,
      empresaEmail: empresa.emailContacto,
    })
    .from(presupuesto)
    .innerJoin(cliente, eq(cliente.id, presupuesto.clienteId))
    .innerJoin(empresa, eq(empresa.id, presupuesto.empresaId))
    .where(and(eq(presupuesto.estado, "enviado"), sql`${presupuesto.fechaEmision} <= ${tresDiasAtras}`))
    .limit(50);

  let procesados = 0;
  let enviados = 0;

  for (const c of candidatos) {
    procesados++;
    // Verificar que no haya caducado
    const caducaMs = new Date(c.fechaEmision).getTime() + c.validezDias * 86_400_000;
    if (ahora >= caducaMs) continue;

    // Verificar si ya tiene respuesta o firma
    const [f] = await db
      .select({ id: firma.id })
      .from(firma)
      .where(eq(firma.presupuestoId, c.id))
      .limit(1);
    if (f) continue;

    // Verificar si ya se envió un recordatorio en los últimos 4 días
    const cuatroDiasAtras = new Date(ahora - 4 * 86_400_000);
    const enviosRecientes = await db
      .select({ id: envioEmail.id })
      .from(envioEmail)
      .where(and(eq(envioEmail.presupuestoId, c.id), sql`${envioEmail.creadoEn} >= ${cuatroDiasAtras}`))
      .limit(1);
    if (enviosRecientes.length > 0) continue;

    const destinatario = c.clienteEmail?.trim();
    if (!destinatario) continue;

    try {
      const pCompleto = await getPresupuestoCompleto(c.empresaId, c.id);
      if (!pCompleto) continue;

      const pdf = await pdfDe(
        {
          nombre: c.empresaNombre,
          cif: "",
          telefono: c.empresaTelefono,
          emailContacto: c.empresaEmail,
          direccion: "",
          cp: "",
          poblacion: "",
          provincia: "",
          piePdf: "",
        },
        pCompleto
      );

      const enlace = `${baseUrl()}/p/${c.tokenPublico}`;
      const asunto = `Recordatorio: Presupuesto ${c.codigo} - ${c.titulo}`;
      const cuerpo = [
        `Hola ${c.clienteNombre},`,
        "",
        `Le escribimos desde ${c.empresaNombre} para recordarle que tiene pendiente de revisar su presupuesto "${c.titulo}" (${c.codigo}).`,
        "",
        "Puede revisarlo y aceptarlo con su firma digital desde este enlace:",
        enlace,
        "",
        `El presupuesto es válido durante ${c.validezDias} días desde su emisión. También tiene una copia adjunta en PDF.`,
        "",
        "Un saludo cordial,",
        c.empresaNombre,
      ].join("\n");

      const ok = await sendEmail({
        to: destinatario,
        subject: asunto,
        text: cuerpo,
        fromName: c.empresaNombre,
        replyTo: c.empresaEmail || undefined,
        attachments: [{ filename: `${c.codigo}.pdf`, content: pdf }],
      });

      await registrarEnvio(c.empresaId, c.id, destinatario, asunto, ok);
      if (ok) enviados++;
    } catch (err) {
      console.error(`Error en cron seguimiento para presupuesto ${c.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, procesados, enviados });
}

export async function POST(request: Request) {
  return GET(request);
}
