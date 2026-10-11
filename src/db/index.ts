import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export { schema };
export type Db = ReturnType<typeof getDb>;

/** Acceso a D1. No lo uses directamente en páginas: pasa por src/lib/data.ts (aislamiento por empresa). */
export function getDb() {
  return drizzle(getCloudflareContext().env.DB, { schema });
}

export function getEnv() {
  return getCloudflareContext().env;
}
