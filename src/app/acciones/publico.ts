"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { clientIp } from "@/lib/session";
import { headers } from "next/headers";
import { sha256Hex } from "@/lib/crypto";
import { allow } from "@/lib/ratelimit";
import { sendEmail } from "@/lib/email";
import { getEmpresa, getPresupuestoPublico, registrarRespuestaCliente } from "@/lib/data";

export type RespuestaResultado = { ok: true } | { ok: false; error: "invalido" | "limite" | "no_disponible" | "caducado" | "fallo" };

const esquema = z.object({
  accion: z.enum(["aceptado", "cambios"]),
  opcionId: z.string().max(64).default(""),
  opcionalesIds: z.array(z.string().max(64)).max(200).default([]),
  nombre: z.string().trim().min(2).max(120),
  comentario: z.string().trim().max(1500).default(""),
  firmaPng: z.string().max(300_000).default(""),
});

/**
 * Respuesta del cliente final desde el enlace público: aceptar con firma o pedir cambios.
 * No hay sesión: la protección es el token secreto, el límite de intentos y la validación estricta.
 */
export async function responderPresupuestoAccion(token: string, datos: unknown): Promise<RespuestaResultado> {
  if (!/^[a-f0-9]{64}$/.test(token)) return { ok: false, error: "no_disponible" };
  const parsed = esquema.safeParse(datos);
  if (!parsed.success) return { ok: false, error: "invalido" };
  const d = parsed.data;
  if (d.accion === "cambios" && !d.comentario) return { ok: false, error: "invalido" };
  if (d.accion === "aceptado" && (!d.opcionId || !d.firmaPng)) return { ok: false, error: "invalido" };

  const ip = await clientIp();
  if (!(await allow("respuesta_presupuesto", ip, 15, 10 * 60_000))) return { ok: false, error: "limite" };

  const ua = (await headers()).get("user-agent") ?? "";
  const res = await registrarRespuestaCliente(token, {
    accion: d.accion,
    opcionId: d.opcionId,
    opcionalesIds: d.opcionalesIds,
    nombre: d.nombre,
    comentario: d.comentario,
    firmaPng: d.firmaPng,
    ipHash: await sha256Hex(ip),
    userAgent: ua,
  });
  if (!res.ok) {
    if (res.error === "caducado") return { ok: false, error: "caducado" };
    if (res.error === "datos") return { ok: false, error: "invalido" };
    return { ok: false, error: "no_disponible" };
  }

  // Aviso al albañil. Si el correo falla, la respuesta del cliente ya está guardada.
  const [p, empresa] = await Promise.all([getPresupuestoPublico(token), getEmpresa(res.empresaId)]);
  if (p && empresa?.emailContacto) {
    const aceptado = d.accion === "aceptado";
    const opcion = p.opciones.find((o) => o.id === d.opcionId);
    await sendEmail({
      to: empresa.emailContacto,
      subject: `${aceptado ? "Presupuesto ACEPTADO" : "Cambios solicitados"}: ${p.codigo} - ${p.cliente.nombre}`,
      text: [
        aceptado
          ? `${d.nombre} ha aceptado el presupuesto ${p.codigo} "${p.titulo}"${opcion && p.opciones.length > 1 ? ` (opción ${opcion.nombre})` : ""}.`
          : `${d.nombre} solicita cambios en el presupuesto ${p.codigo} "${p.titulo}":`,
        d.comentario ? `\n${d.comentario}` : "",
        "\nPuedes verlo en tu panel de Presurapi.",
      ].join("\n"),
      fromName: "Presurapi",
    });
  }

  revalidatePath("/panel/presupuestos");
  revalidatePath("/panel");
  return { ok: true };
}
