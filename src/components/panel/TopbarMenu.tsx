"use client";

// Menú compacto para el Topbar en móvil: agrupa Tour, idioma, tema y cerrar
// sesión detrás de un botón, porque en una pantalla de 375px esos cuatro
// controles en fila no caben (en algunos casos llegaban a tapar por completo
// el botón de "Cerrar sesión", quedando inalcanzable). En escritorio (md+)
// el Topbar los sigue mostrando todos en fila, sin este menú.
import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { locales } from "@/lib/i18n";
import { cerrarSesion } from "@/app/acciones/auth";

export default function TopbarMenu({ onAbrirTour }: { onAbrirTour: () => void }) {
  const { t, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [abierto, setAbierto] = useState(false);
  const menuId = useId();
  const botonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function onPointerDown(e: PointerEvent) {
      const objetivo = e.target as Node;
      if (panelRef.current?.contains(objetivo) || botonRef.current?.contains(objetivo)) return;
      setAbierto(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAbierto(false);
        botonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto]);

  const isDark = theme === "dark";

  return (
    <div className="relative md:hidden">
      <button
        ref={botonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={abierto}
        aria-controls={menuId}
        aria-label={t("panel.menu")}
        onClick={() => setAbierto((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-sm border border-(--color-border-strong) bg-(--color-surface) text-(--color-ink) hover:border-(--color-brass) focus-visible:outline-2 focus-visible:outline-(--color-focus-ring)"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {abierto && (
        <div
          id={menuId}
          ref={panelRef}
          role="menu"
          aria-label={t("panel.menu")}
          className="absolute top-full right-0 z-50 mt-2 flex w-56 flex-col gap-1 rounded-sm border border-(--color-border) bg-(--color-surface-raised) p-2 shadow-[0_4px_16px_rgba(33,29,23,0.18)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAbierto(false);
              onAbrirTour();
            }}
            className="rounded-sm px-3 py-2.5 text-left text-sm font-medium text-(--color-ink) hover:bg-(--color-surface)"
          >
            {t("panel.tour")}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => setLocale(locale === "es" ? "en" : "es")}
            className="flex items-center justify-between rounded-sm px-3 py-2.5 text-left text-sm font-medium text-(--color-ink) hover:bg-(--color-surface)"
          >
            <span>{t("language.label")}</span>
            <span className="flex gap-1">
              {locales.map((code) => (
                <span
                  key={code}
                  className="rounded-[2px] px-1.5 py-0.5 text-xs uppercase"
                  style={{
                    background: code === locale ? "var(--color-brass)" : "transparent",
                    color: code === locale ? "var(--color-brass-contrast)" : "var(--color-ink-muted)",
                  }}
                >
                  {code}
                </span>
              ))}
            </span>
          </button>

          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={isDark}
            onClick={toggleTheme}
            className="flex items-center justify-between rounded-sm px-3 py-2.5 text-left text-sm font-medium text-(--color-ink) hover:bg-(--color-surface)"
          >
            <span>{isDark ? t("theme.toggleToLight") : t("theme.toggleToDark")}</span>
            <span
              aria-hidden="true"
              className="inline-block h-4 w-4 rounded-full border border-current"
              style={{ background: isDark ? "var(--color-ink)" : "var(--color-brass)" }}
            />
          </button>

          <hr className="my-1 border-(--color-border)" />

          <form action={cerrarSesion}>
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded-sm px-3 py-2.5 text-left text-sm font-medium text-(--color-danger) hover:bg-(--color-surface)"
            >
              {t("panel.logout")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
