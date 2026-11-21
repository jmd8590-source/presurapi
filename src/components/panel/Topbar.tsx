"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { cerrarSesion } from "@/app/acciones/auth";
import GuidedTour, { GuidedTourDialog } from "@/components/panel/GuidedTour";
import TopbarMenu from "@/components/panel/TopbarMenu";

export default function Topbar() {
  const { t } = useLocale();
  const [tourAbierto, setTourAbierto] = useState(false);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-(--color-border) px-4 py-3 sm:px-6">
      <Link href="/panel" className="font-display text-lg italic font-semibold text-(--color-ink)">
        {t("common.appName")}
      </Link>

      {/* Escritorio (md+): todos los controles en fila, como antes. */}
      <div className="hidden items-center gap-2 md:flex">
        <GuidedTour />
        <LanguageToggle />
        <ThemeToggle />
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="rounded-sm border border-(--color-border-strong) px-3 py-2 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
          >
            {t("panel.logout")}
          </button>
        </form>
      </div>

      {/* Móvil: un único botón de menú (ver TopbarMenu) para que nada quede
          fuera de pantalla ni tape el cierre de sesión. */}
      <TopbarMenu onAbrirTour={() => setTourAbierto(true)} />
      <GuidedTourDialog abierto={tourAbierto} onCerrar={() => setTourAbierto(false)} />
    </header>
  );
}
