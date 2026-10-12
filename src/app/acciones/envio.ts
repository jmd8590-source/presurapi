"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { getEnv } from "@/db";
import { sendEmail } from "@/lib/email";
import { allow } from "@/lib/ratelimit";
import { pdfDe } from "@/lib/presupuesto-doc";
import { formatearEuros, calcularTotales } from "@/lib/calculo";
import { getEmpresa, getPresupuestoCompleto, marcarEnviado, registrarEnvio } from "@/lib/data";

export type EnvioResultado = { ok: true; enlace: string; email: string } | { ok: false; error: "no_encontrado" | "sin_email" | "limite" | "fallo" };

function baseUrl(): string {
  return (getEnv().APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Enlace público del presupuesto (el token es el secreto). */
function enlacePublico(token: string): string {
  return `${baseUrl()}/p/${token}`;
}

/**
 * Envía el presupuesto al cliente por email con el PDF adjunto.
 * Las respuestas del cliente van al correo de contacto de la empresa (Reply-To).
 */
export async function enviarPresupuestoAccion(id: string): Promise<EnvioResultado> {
  const ses = await requireSession();
  const empresaId = ses.empresa.id;

  const [p, empresa] = await Promise.all([getPresupuestoCompleto(empresaId, id), getEmpresa(empresaId)]);
  if (!p || !empresa) return { ok: false, error: "no_encontrado" };
  const destinatario = p.cliente.email.trim();
  if (!destinatario) return { ok: false, error: "sin_email" };
  if (!(await allow("envio_presupuesto", empresaId, 30, 60 * 60_000))) return { ok: false, error: "limite" };

  const enlace = enlacePublico(p.tokenPublico);
  const pdf = await pdfDe(empresa, p);
  const principal = p.opciones.find((o) => o.esSeleccionada) ?? p.opciones[0];
  const total = principal
    ? calcularTotales(principal.lineas, { ivaPct: p.ivaPct, retencionPct: p.retencionPct, descuentoPct: p.descuentoPct }).totalPresupuesto
    : 0;

  const asunto = `Presupuesto ${p.codigo} - ${p.titulo}`;
  const cuerpo = [
    `Hola ${p.cliente.nombre},`,
    "",
    `Le enviamos el presupuesto "${p.titulo}" (${p.codigo}).`,
    p.opciones.length > 1 ? `Incluye ${p.opciones.length} opciones para que pueda elegir la que mejor se adapte.` : `Importe total: ${formatearEuros(total)} (IVA incluido).`,
    "",
    "Puede revisarlo, aceptarlo con su firma o pedirnos cambios desde este enlace:",
    enlace,
    "",
    `El presupuesto es válido durante ${p.validezDias} días. También lo encontrará adjunto en PDF.`,
    "",
    "Un saludo,",
    empresa.nombre,
    [empresa.telefono, empresa.emailContacto].filter(Boolean).join(" - "),
  ]
    .filter((l) => l !== undefined)
    .join("\n");

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

  await marcarEnviado(empresaId, id);
  revalidatePath("/panel/presupuestos");
  revalidatePath("/panel");
  return { ok: true, enlace, email: destinatario };
}

/** Devuelve el enlace público para copiarlo (p. ej. para enviarlo por WhatsApp). */
export async function enlacePresupuestoAccion(id: string): Promise<{ ok: true; enlace: string } | { ok: false }> {
  const ses = await requireSession();
  const p = await getPresupuestoCompleto(ses.empresa.id, id);
  if (!p) return { ok: false };
  await marcarEnviado(ses.empresa.id, id);
  revalidatePath("/panel/presupuestos");
  return { ok: true, enlace: enlacePublico(p.tokenPublico) };
}
