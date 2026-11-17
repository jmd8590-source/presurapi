import { createBrowserClient } from "@supabase/ssr";
// TODO(Fase 2, pendiente de proyecto Supabase real): parametrizar con
// `Database` generado por `generate_typescript_types` en cuanto exista el
// proyecto, para autocompletado y tipos de fila por tabla.

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
