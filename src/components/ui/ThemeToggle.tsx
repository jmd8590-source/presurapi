"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      className="inline-flex h-10 items-center gap-2 rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-3 text-sm font-medium text-(--color-ink) transition-colors hover:border-(--color-brass) focus-visible:outline-2 focus-visible:outline-(--color-focus-ring)"
    >
      <span
        aria-hidden="true"
        className="relative inline-block h-4 w-4 rounded-full border border-current"
        style={{
          background: isDark ? "var(--color-ink)" : "var(--color-brass)",
        }}
      />
      <span>{isDark ? t("theme.toggleToLight") : t("theme.toggleToDark")}</span>
    </button>
  );
}
