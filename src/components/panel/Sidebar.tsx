"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { NAV_ITEMS } from "./nav-items";
import { NAV_ICONS } from "./nav-icons";

export default function Sidebar() {
  const { t } = useLocale();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("common.appName")}
      className="hidden w-56 shrink-0 flex-col gap-1 border-r border-(--color-border) px-3 py-6 md:flex"
    >
      {NAV_ITEMS.map((item) => {
        const activo = item.href === "/panel" ? pathname === "/panel" : pathname.startsWith(item.href);
        const Icono = NAV_ICONS[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? "page" : undefined}
            className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors"
            style={{
              background: activo ? "var(--color-surface)" : "transparent",
              color: activo ? "var(--color-brass)" : "var(--color-ink-muted)",
            }}
          >
            {Icono && <Icono className="h-4.5 w-4.5 shrink-0" />}
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
