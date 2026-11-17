"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function SkipLink() {
  const { locale } = useLocale();
  const label = locale === "en" ? "Skip to main content" : "Saltar al contenido principal";

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:bg-(--color-brass) focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-(--color-brass-contrast)"
    >
      {label}
    </a>
  );
}
