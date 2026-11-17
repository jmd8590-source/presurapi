"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { cerrarSesionDemo } from "@/app/acciones/demo-auth";

export default function Topbar() {
  const { t } = useLocale();

  return (
    <header className="flex items-center justify-between gap-3 border-b border-(--color-border) px-4 py-3 sm:px-6">
      <Link href="/panel" className="font-display text-lg italic font-semibold text-(--color-ink)">
        {t("common.appName")}
      </Link>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
        <form action={cerrarSesionDemo}>
          <button
            type="submit"
            className="rounded-sm border border-(--color-border-strong) px-3 py-2 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
          >
            {t("panel.logout")}
          </button>
        </form>
      </div>
    </header>
  );
}
