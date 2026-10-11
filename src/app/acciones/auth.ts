"use server";

import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { hashPassword, verifyPassword, dummyHash, sha256Hex, randomToken } from "@/lib/crypto";
import { createSession, destroySession, clientIp, destroyOtherSessions } from "@/lib/session";
import { allow, reset } from "@/lib/ratelimit";
import { sendEmail } from "@/lib/email";
import {
  loginSchema,
  registerSchema,
  emailSchema,
  resetSchema,
  fieldErrors,
  type FieldErrors,
} from "@/lib/validation";

export type AuthActionResult = {
  ok: boolean;
  errors?: FieldErrors;
  generalError?: string;
  successMessage?: string;
};

export async function loginAction(
  _prev: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const ip = await clientIp();

  // Rate limiting por IP: máximo 10 intentos fallidos cada 15 min
  if (!(await allow("login_ip", ip, 10, 15 * 60 * 1000))) {
    return { ok: false, generalError: "auth.err.rate" };
  }

  const emailRaw = formData.get("email");
  const passwordRaw = formData.get("password");

  const parsed = loginSchema.safeParse({ email: emailRaw, password: passwordRaw });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const { email, password } = parsed.data;

  // Rate limiting por email
  if (!(await allow("login_email", email, 5, 15 * 60 * 1000))) {
    return { ok: false, generalError: "auth.err.rate" };
  }

  const db = getDb();
  const [usr] = await db
    .select({
      id: schema.usuario.id,
      email: schema.usuario.email,
      passwordHash: schema.usuario.passwordHash,
      empresaId: schema.usuario.empresaId,
    })
    .from(schema.usuario)
    .where(eq(schema.usuario.email, email))
    .limit(1);

  let valid = false;
  if (usr) {
    valid = await verifyPassword(password, usr.passwordHash);
  } else {
    // Mitigación de timing attack para evitar enumeración de emails
    await dummyHash();
  }

  if (!valid || !usr) {
    return { ok: false, generalError: "auth.err.invalid" };
  }

  // Éxito: limpiar limitador
  await reset("login_email", email);
  await reset("login_ip", ip);

  await createSession(usr.id);

  // Comprobar si completó el onboarding
  const [emp] = await db
    .select({ onboardingHecho: schema.empresa.onboardingHecho })
    .from(schema.empresa)
    .where(eq(schema.empresa.id, usr.empresaId))
    .limit(1);

  if (!emp || !emp.onboardingHecho) {
    redirect("/bienvenida");
  }

  redirect("/panel");
}

export async function registerAction(
  _prev: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const ip = await clientIp();

  // Rate limit de registros: máx 5 por hora por IP
  if (!(await allow("register_ip", ip, 5, 60 * 60 * 1000))) {
    return { ok: false, generalError: "auth.err.rate" };
  }

  const parsed = registerSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    password2: formData.get("password2"),
    acepto: formData.get("acepto"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const { nombre, email, password } = parsed.data;

  const db = getDb();
  const [existing] = await db
    .select({ id: schema.usuario.id })
    .from(schema.usuario)
    .where(eq(schema.usuario.email, email))
    .limit(1);

  if (existing) {
    return { ok: false, generalError: "auth.err.emailTaken" };
  }

  const passwordHash = await hashPassword(password);
  const empresaId = crypto.randomUUID();
  const usuarioId = crypto.randomUUID();
  const now = new Date();

  // Crear empresa y usuario en D1
  await db.insert(schema.empresa).values({
    id: empresaId,
    nombre: "",
    onboardingHecho: false,
    creadoEn: now,
  });

  await db.insert(schema.usuario).values({
    id: usuarioId,
    empresaId,
    nombre,
    email,
    passwordHash,
    creadoEn: now,
  });

  await createSession(usuarioId);
  redirect("/bienvenida");
}

export async function forgotPasswordAction(
  _prev: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const ip = await clientIp();
  if (!(await allow("forgot_ip", ip, 5, 15 * 60 * 1000))) {
    return { ok: false, generalError: "auth.err.rate" };
  }

  const emailRaw = formData.get("email");
  const parsed = emailSchema.safeParse(emailRaw);
  if (!parsed.success) {
    return { ok: false, errors: { email: parsed.error.issues[0]?.message || "val.email" } };
  }

  const email = parsed.data;
  const db = getDb();
  const [usr] = await db
    .select({ id: schema.usuario.id })
    .from(schema.usuario)
    .where(eq(schema.usuario.email, email))
    .limit(1);

  if (usr) {
    const rawToken = randomToken(32);
    const hashedToken = await sha256Hex(rawToken);
    const expiraEn = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de validez

    // Eliminar tokens anteriores del usuario
    await db.delete(schema.tokenReset).where(eq(schema.tokenReset.usuarioId, usr.id));

    await db.insert(schema.tokenReset).values({
      id: hashedToken,
      usuarioId: usr.id,
      expiraEn,
    });

    const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/restablecer/${rawToken}`;
    await sendEmail({
      to: email,
      subject: "Recupera tu contraseña · Presurapi",
      text: `Hola,\n\nHas solicitado restablecer tu contraseña en Presurapi. Haz clic en el siguiente enlace para crear una nueva contraseña:\n\n${resetUrl}\n\nEste enlace expirará en 1 hora. Si no has solicitado esto, puedes ignorar este mensaje de forma segura.\n\n— El equipo de Presurapi`,
    });
  }

  // Siempre responder con el mismo mensaje genérico para no filtrar si el email existe
  return { ok: true, successMessage: "auth.forgot.sent" };
}

export async function resetPasswordAction(
  tokenRaw: string,
  _prev: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = resetSchema.safeParse({
    password: formData.get("password"),
    password2: formData.get("password2"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const hashedToken = await sha256Hex(tokenRaw);
  const db = getDb();
  const [row] = await db
    .select({
      id: schema.tokenReset.id,
      usuarioId: schema.tokenReset.usuarioId,
      expiraEn: schema.tokenReset.expiraEn,
    })
    .from(schema.tokenReset)
    .where(
      and(
        eq(schema.tokenReset.id, hashedToken),
        gt(schema.tokenReset.expiraEn, new Date())
      )
    )
    .limit(1);

  if (!row) {
    return { ok: false, generalError: "auth.reset.invalid" };
  }

  const newHash = await hashPassword(parsed.data.password);
  await db
    .update(schema.usuario)
    .set({ passwordHash: newHash })
    .where(eq(schema.usuario.id, row.usuarioId));

  // Borrar token usado y cerrar otras sesiones por seguridad
  await db.delete(schema.tokenReset).where(eq(schema.tokenReset.id, hashedToken));
  await destroyOtherSessions(row.usuarioId);

  redirect("/entrar?reset=1");
}

export async function logoutAction() {
  await destroySession();
  redirect("/entrar");
}
