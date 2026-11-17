"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/ui/LanguageToggle";

export default function AuthShell({
  titleKey,
  children,
}: {
  titleKey: "auth.loginTitle" | "auth.registerTitle" | "auth.forgotTitle";
  children: ReactNode;
}) {
  const { t } = useLocale();

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-display text-xl italic font-semibold text-(--color-ink)">
          {t("common.appName")}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <h1 className="mb-8 text-center font-display text-2xl font-semibold text-(--color-ink) sm:text-3xl">
          {t(titleKey)}
        </h1>
        {children}
      </div>
    </main>
  );
}
