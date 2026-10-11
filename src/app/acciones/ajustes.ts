"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, getEnv, schema } from "@/db";
import { requireSession, currentToken, destroyOtherSessions, destroySession } from "@/lib/session";
import { verifyPassword, hashPassword } from "@/lib/crypto";
import { exportarTodo, eliminarEmpresa } from "@/lib/data";
import { cambioPasswordSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

export type AjustesResult = {
  ok: boolean;
  errors?: FieldErrors;
  generalError?: string;
  successMessage?: string;
};

export async function cambiarPasswordAction(
  _prev: AjustesResult | null,
  formData: FormData
): Promise<AjustesResult> {
  const session = await requireSession();
  const parsed = cambioPasswordSchema.safeParse({
    actual: formData.get("actual"),
    password: formData.get("password"),
    password2: formData.get("password2"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const db = getDb();
  const [usr] = await db
    .select({ passwordHash: schema.usuario.passwordHash })
    .from(schema.usuario)
    .where(eq(schema.usuario.id, session.usuario.id))
    .limit(1);

  if (!usr || !(await verifyPassword(parsed.data.actual, usr.passwordHash))) {
    return { ok: false, errors: { actual: "settings.err.currentPassword" } };
  }

  const newHash = await hashPassword(parsed.data.password);
  await db
    .update(schema.usuario)
    .set({ passwordHash: newHash })
    .where(eq(schema.usuario.id, session.usuario.id));

  const token = await currentToken();
  await destroyOtherSessions(session.usuario.id, token);

  return { ok: true, successMessage: "settings.passwordChanged" };
}

export async function exportarDatosAction() {
  const session = await requireSession();
  const datos = await exportarTodo(session.empresa.id, session.usuario.id);
  return datos;
}

export async function eliminarCuentaAction(
  _prev: AjustesResult | null,
  formData: FormData
): Promise<AjustesResult> {
  const session = await requireSession();
  const confirmacion = formData.get("confirmacion");

  if (confirmacion !== "ELIMINAR") {
    return { ok: false, generalError: "settings.deleteConfirm" };
  }

  const logoKey = await eliminarEmpresa(session.empresa.id);

  // Limpiar logo de R2 si existía
  if (logoKey) {
    try {
      const env = getEnv();
      if (env.LOGOS) {
        await env.LOGOS.delete(logoKey);
      }
    } catch {
      /* ignorar */
    }
  }

  await destroySession();
  redirect("/entrar");
}
