"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

export default function LegalPage({
  titleEs,
  titleEn,
  updatedEs,
  updatedEn,
  sectionsEs,
  sectionsEn,
  noticeEs,
  noticeEn,
}: {
  titleEs: string;
  titleEn: string;
  updatedEs: string;
  updatedEn: string;
  sectionsEs: LegalSection[];
  sectionsEn: LegalSection[];
  noticeEs?: ReactNode;
  noticeEn?: ReactNode;
}) {
  const { locale } = useLocale();
  const title = locale === "en" ? titleEn : titleEs;
  const updated = locale === "en" ? updatedEn : updatedEs;
  const sections = locale === "en" ? sectionsEn : sectionsEs;
  const notice = locale === "en" ? noticeEn : noticeEs;
  const back = locale === "en" ? "Back to home" : "Volver al inicio";

  return (
    <main id="main-content" className="mx-auto max-w-2xl flex-1 px-4 py-14 sm:px-6">
      <Link href="/" className="text-sm text-(--color-brass) hover:underline">
        ← {back}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-(--color-ink)">{title}</h1>
      <p className="mt-1 text-xs text-(--color-ink-faint)">{updated}</p>

      {notice && (
        <div className="mt-6 rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-4 py-3 text-sm text-(--color-ink-muted)">
          {notice}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-lg font-semibold text-(--color-ink)">
              {section.heading}
            </h2>
            <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-(--color-ink-muted)">
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
