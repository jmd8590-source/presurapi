"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { NAV_ITEMS } from "./nav-items";

// En móvil solo caben las secciones principales; "banco" se deja para el
// menú de escritorio y para dentro del asistente de presupuesto.
const ITEMS_MOVIL = NAV_ITEMS.filter((item) => item.href !== "/panel/banco");

export default function BottomNav() {
  const { t } = useLocale();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("common.appName")}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-(--color-border) bg-(--color-paper) md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ITEMS_MOVIL.map((item) => {
        const activo = item.href === "/panel" ? pathname === "/panel" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? "page" : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium"
            style={{ color: activo ? "var(--color-brass)" : "var(--color-ink-muted)" }}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
