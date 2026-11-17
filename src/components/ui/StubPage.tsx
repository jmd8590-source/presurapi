"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function StubPage({
  titleEs,
  titleEn,
  bodyEs,
  bodyEn,
}: {
  titleEs: string;
  titleEn: string;
  bodyEs: string;
  bodyEn: string;
}) {
  const { locale } = useLocale();
  const title = locale === "en" ? titleEn : titleEs;
  const body = locale === "en" ? bodyEn : bodyEs;
  const back = locale === "en" ? "Back to home" : "Volver al inicio";

  return (
    <main id="main-content" className="mx-auto flex max-w-2xl flex-1 flex-col justify-center px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl italic font-semibold text-(--color-ink)">{title}</h1>
      <p className="mt-4 text-base leading-relaxed text-(--color-ink-muted)">{body}</p>
      <Link
        href="/"
        className="mt-8 inline-block w-fit rounded-sm border border-(--color-border-strong) px-4 py-2 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
      >
        {back}
      </Link>
    </main>
  );
}
