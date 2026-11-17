"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { locales } from "@/lib/i18n";

export default function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className="inline-flex h-10 items-center rounded-sm border border-(--color-border-strong) bg-(--color-surface) p-0.5 text-sm font-medium"
    >
      {locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => setLocale(code)}
            className="rounded-[2px] px-2.5 py-1.5 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-(--color-focus-ring)"
            style={{
              background: active ? "var(--color-brass)" : "transparent",
              color: active ? "var(--color-brass-contrast)" : "var(--color-ink-muted)",
            }}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
