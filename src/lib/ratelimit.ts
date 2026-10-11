import { and, eq, gt, lt, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { sha256Hex } from "./crypto";

/**
 * Limita intentos por ventana. Devuelve true si se permite (y lo registra).
 * La clave se guarda hasheada para no almacenar IPs ni correos en claro.
 */
export async function allow(tipo: string, clave: string, max: number, windowMs: number): Promise<boolean> {
  const db = getDb();
  const hashed = await sha256Hex(`${tipo}:${clave.toLowerCase()}`);
  const since = new Date(Date.now() - windowMs);
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(schema.intentoAcceso)
    .where(and(eq(schema.intentoAcceso.tipo, tipo), eq(schema.intentoAcceso.clave, hashed), gt(schema.intentoAcceso.ts, since)));
  if ((row?.n ?? 0) >= max) return false;
  await db.insert(schema.intentoAcceso).values({ clave: hashed, tipo, ts: new Date() });
  // Limpieza ocasional de registros viejos (≈2 % de las peticiones).
  if (Math.random() < 0.02) {
    await db.delete(schema.intentoAcceso).where(lt(schema.intentoAcceso.ts, new Date(Date.now() - 86_400_000)));
  }
  return true;
}

/** Borra los intentos de una clave (p. ej. tras un acceso correcto). */
export async function reset(tipo: string, clave: string) {
  const hashed = await sha256Hex(`${tipo}:${clave.toLowerCase()}`);
  await getDb()
    .delete(schema.intentoAcceso)
    .where(and(eq(schema.intentoAcceso.tipo, tipo), eq(schema.intentoAcceso.clave, hashed)));
}
