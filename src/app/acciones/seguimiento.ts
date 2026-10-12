"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { getEnv } from "@/db";
import { sendEmail } from "@/lib/email";
import { allow } from "@/lib/ratelimit";
import { pdfDe } from "@/lib/presupuesto-doc";
import { getEmpresa, getPresupuestoCompleto, registrarEnvio } from "@/lib/data";

export type RecordatorioResultado =
  | { ok: true; email: string }
  | { ok: false; error: "no_encontrado" | "sin_email" | "limite" | "fallo" };

function baseUrl(): string {
  return (getEnv().APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Envía un correo de recordatorio amable al cliente sobre un presupuesto pendiente.
 */
export async function enviarRecordatorioPresupuestoAccion(id: string): Promise<RecordatorioResultado> {
  const ses = await requireSession();
  const empresaId = ses.empresa.id;

  const [p, empresa] = await Promise.all([getPresupuestoCompleto(empresaId, id), getEmpresa(empresaId)]);
  if (!p || !empresa) return { ok: false, error: "no_encontrado" };
  const destinatario = p.cliente.email.trim();
  if (!destinatario) return { ok: false, error: "sin_email" };
  if (!(await allow("recordatorio_presupuesto", empresaId, 30, 60 * 60_000))) return { ok: false, error: "limite" };

  const enlace = `${baseUrl()}/p/${p.tokenPublico}`;
  const pdf = await pdfDe(empresa, p);

  const asunto = `Recordatorio: Presupuesto ${p.codigo} - ${p.titulo}`;
  const cuerpo = [
    `Hola ${p.cliente.nombre},`,
    "",
    `Le escribimos desde ${empresa.nombre} para recordarle que tiene pendiente de revisar su presupuesto "${p.titulo}" (${p.codigo}).`,
    "",
    "Puede consultarlo, ver las opciones detalladas y aceptarlo con su firma digital desde este enlace:",
    enlace,
    "",
    `Este presupuesto es válido durante ${p.validezDias} días desde su emisión. También le adjuntamos una copia en PDF.`,
    "",
    "Si desea que adaptemos cualquier partida o tiene alguna pregunta, puede responder directamente a este mensaje.",
    "",
    "Un saludo cordial,",
    empresa.nombre,
    [empresa.telefono, empresa.emailContacto].filter(Boolean).join(" - "),
  ].join("\n");

  const ok = await sendEmail({
    to: destinatario,
    subject: asunto,
    text: cuerpo,
    fromName: empresa.nombre,
    replyTo: empresa.emailContacto || ses.usuario.email,
    attachments: [{ filename: `${p.codigo}.pdf`, content: pdf }],
  });

  await registrarEnvio(empresaId, id, destinatario, asunto, ok);
  if (!ok) return { ok: false, error: "fallo" };

  revalidatePath("/panel");
  revalidatePath("/panel/presupuestos");
  return { ok: true, email: destinatario };
}
