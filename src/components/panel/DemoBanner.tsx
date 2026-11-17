"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function DemoBanner() {
  const { t } = useLocale();

  return (
    <div
      role="status"
      className="border-b border-(--color-border) bg-(--color-surface) px-4 py-2 text-center text-xs text-(--color-ink-muted) sm:px-6"
    >
      {t("panel.demoBanner")}
    </div>
  );
}
