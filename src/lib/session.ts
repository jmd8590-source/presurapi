import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { getDb, getEnv, schema } from "@/db";
import { randomToken, sha256Hex } from "./crypto";

const SESSION_DAYS = 30;
const DAY = 86_400_000;

function secureCookies(): boolean {
  return (getEnv().APP_URL ?? "").startsWith("https://");
}
/** `__Host-` fija la cookie al dominio exacto y exige Secure + Path=/. Solo con HTTPS. */
function cookieName(): string {
  return secureCookies() ? "__Host-pr_session" : "pr_session";
}

export async function createSession(usuarioId: string) {
  const token = randomToken(32);
  const now = Date.now();
  await getDb()
    .insert(schema.sesion)
    .values({ id: await sha256Hex(token), usuarioId, creadoEn: new Date(now), expiraEn: new Date(now + SESSION_DAYS * DAY) });
  (await cookies()).set(cookieName(), token, {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(cookieName())?.value;
  if (token) {
    await getDb().delete(schema.sesion).where(eq(schema.sesion.id, await sha256Hex(token)));
  }
  jar.delete(cookieName());
}

/** Cierra todas las sesiones de un usuario menos (opcionalmente) la actual. */
export async function destroyOtherSessions(usuarioId: string, keepToken?: string) {
  const db = getDb();
  const keep = keepToken ? await sha256Hex(keepToken) : null;
  const rows = await db.select({ id: schema.sesion.id }).from(schema.sesion).where(eq(schema.sesion.usuarioId, usuarioId));
  for (const r of rows) if (r.id !== keep) await db.delete(schema.sesion).where(eq(schema.sesion.id, r.id));
}

export async function currentToken(): Promise<string | undefined> {
  return (await cookies()).get(cookieName())?.value;
}

export type Session = {
  usuario: { id: string; email: string; nombre: string };
  empresa: typeof schema.empresa.$inferSelect;
};

/** Sesión actual (memorizada por petición) o null. */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = await currentToken();
  if (!token) return null;
  const db = getDb();
  const rows = await db
    .select({
      uId: schema.usuario.id,
      uEmail: schema.usuario.email,
      uNombre: schema.usuario.nombre,
      empresa: schema.empresa,
    })
    .from(schema.sesion)
    .innerJoin(schema.usuario, eq(schema.sesion.usuarioId, schema.usuario.id))
    .innerJoin(schema.empresa, eq(schema.usuario.empresaId, schema.empresa.id))
    .where(and(eq(schema.sesion.id, await sha256Hex(token)), gt(schema.sesion.expiraEn, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return { usuario: { id: row.uId, email: row.uEmail, nombre: row.uNombre }, empresa: row.empresa };
});

/** Exige sesión. Se llama al principio de cada página privada Y de cada Server Action. */
export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/entrar");
  return s;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}
