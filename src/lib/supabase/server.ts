import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// TODO(Fase 2, pendiente de proyecto Supabase real): parametrizar con
// `Database` generado por `generate_typescript_types` en cuanto exista el
// proyecto, para autocompletado y tipos de fila por tabla.

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll llamado desde un Server Component: se ignora porque el
            // proxy (src/proxy.ts, Fase 3) refresca la sesión en cada petición.
          }
        },
      },
    },
  );
}
