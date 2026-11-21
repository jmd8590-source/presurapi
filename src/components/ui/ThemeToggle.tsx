"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";

// Solo icono (con texto accesible oculto visualmente): con el texto visible
// completo ("Cambiar a modo oscuro"/"Switch to light mode") el botón no
// cabía junto al resto de controles de cabecera en móvil.
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const isDark = theme === "dark";
  const etiqueta = isDark ? t("theme.toggleToLight") : t("theme.toggleToDark");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      title={etiqueta}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-(--color-border-strong) bg-(--color-surface) text-(--color-ink) transition-colors hover:border-(--color-brass) focus-visible:outline-2 focus-visible:outline-(--color-focus-ring)"
    >
      <span className="sr-only">{etiqueta}</span>
      {isDark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 14.5a8.5 8.5 0 1 1-9-11 7 7 0 0 0 9 11Z" />
        </svg>
      )}
    </button>
  );
}
