"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { NAV_ITEMS } from "./nav-items";
import { NAV_ICONS } from "./nav-icons";

// En móvil solo caben las secciones principales; "banco" se deja para el
// menú de escritorio y para dentro del asistente de presupuesto.
const ITEMS_MOVIL = NAV_ITEMS.filter((item) => item.href !== "/panel/banco");

export default function BottomNav() {
  const { t } = useLocale();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Alto real (incluye el padding de safe-area-inset-bottom) para que
    // CookieBanner pueda colocarse justo encima en vez de taparlo o quedar
    // tapado por él — ver globals.css y CookieBanner.tsx.
    const el = navRef.current;
    if (!el) return;
    const fijarAltura = () =>
      document.documentElement.style.setProperty("--bottom-nav-space", `${el.offsetHeight}px`);
    fijarAltura();
    const observer = new ResizeObserver(fijarAltura);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty("--bottom-nav-space", "0px");
    };
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label={t("common.appName")}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-(--color-border) bg-(--color-paper) md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ITEMS_MOVIL.map((item) => {
        const activo = item.href === "/panel" ? pathname === "/panel" : pathname.startsWith(item.href);
        const Icono = NAV_ICONS[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? "page" : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium"
            style={{ color: activo ? "var(--color-brass)" : "var(--color-ink-muted)" }}
          >
            {Icono && <Icono className="h-5 w-5" />}
            <span className="max-w-full truncate px-0.5">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
