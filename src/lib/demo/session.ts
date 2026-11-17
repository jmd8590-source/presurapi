// Sesión de la demo: una cookie con el email introducido, SIN verificar
// contraseña ni email real. No es autenticación de verdad — eso llega con
// Supabase Auth cuando exista el proyecto. Se usa solo para enseñar el
// recorrido completo (login → panel) sin backend.
import "server-only";
import { cookies } from "next/headers";

export const DEMO_SESSION_COOKIE = "presurapi_demo_session";

export async function getDemoSessionEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_SESSION_COOKIE)?.value ?? null;
}
