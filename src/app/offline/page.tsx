import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sin conexión" };

// Página que el service worker sirve cuando no hay red y la página pedida
// no estaba en caché (ver public/sw.js). Nunca se navega aquí directamente
// con conexión.
export default function OfflinePage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">Sin conexión</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-(--color-ink-muted)">
        No hay conexión a internet y esta página todavía no se había cargado antes. Presurapi
        necesita conexión para leer y guardar tus datos.
      </p>
      <Link
        href="/panel"
        className="mt-6 rounded-sm bg-(--color-brass) px-5 py-2.5 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
      >
        Reintentar
      </Link>
    </main>
  );
}
