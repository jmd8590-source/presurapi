"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/ui/LanguageToggle";
import Logo from "@/components/ui/Logo";

export default function Home() {
  const { t } = useLocale();

  return (
    <>
      <header className="border-b border-(--color-border) bg-(--color-paper)">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <span className="flex items-center gap-2 font-display text-2xl italic font-semibold text-(--color-ink)">
            <Logo className="h-8 w-8" />
            {t("common.appName")}
          </span>

          <nav aria-label={t("common.appName")} className="flex flex-wrap items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/entrar"
              className="rounded-sm px-3 py-2 text-sm font-medium text-(--color-ink) hover:text-(--color-brass)"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/registro"
              className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) transition-colors hover:bg-(--color-brass-hover)"
            >
              {t("nav.register")}
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-(--color-brass) uppercase">
              {t("home.eyebrow")}
            </p>
            <h1 className="mt-4 text-3xl leading-tight font-semibold text-(--color-ink) sm:text-4xl lg:text-5xl">
              {t("home.title")}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-(--color-ink-muted) sm:text-lg">
              {t("home.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/registro"
                className="rounded-sm bg-(--color-brass) px-5 py-3 text-sm font-semibold text-(--color-brass-contrast) transition-colors hover:bg-(--color-brass-hover)"
              >
                {t("home.cta")}
              </Link>
              <a
                href="#como-funciona"
                className="rounded-sm border border-(--color-border-strong) px-5 py-3 text-sm font-medium text-(--color-ink) transition-colors hover:border-(--color-brass)"
              >
                {t("home.ctaSecondary")}
              </a>
            </div>
          </div>

          <div
            className="rounded-sm border border-(--color-border) bg-(--color-surface) p-6 shadow-[0_1px_2px_rgba(33,29,23,0.08)] sm:p-8"
            aria-hidden="true"
          >
            <p className="font-display text-3xl italic font-semibold text-(--color-ink)">
              {t("common.appName")}
            </p>
            <p className="mt-1 text-sm text-(--color-ink-muted)">{t("common.tagline")}</p>

            <div className="mt-6 rounded-sm border border-(--color-border) bg-(--color-surface-raised) p-5">
              <div className="flex items-center justify-between border-b border-(--color-border) pb-2 text-[10px] font-medium tracking-[0.12em] text-(--color-ink-faint) uppercase">
                <span>{t("home.sampleChapter")}</span>
                <span>Importe</span>
              </div>
              <div className="flex items-center justify-between border-b border-(--color-border) py-3 text-sm text-(--color-ink)">
                <span>{t("home.sampleLine")}</span>
                <span className="font-mono-nums">980,00 €</span>
              </div>
              <div className="flex items-center justify-between border-b border-(--color-border) py-3 text-sm text-(--color-ink)">
                <span>{t("home.sampleLine2")}</span>
                <span className="font-mono-nums">742,50 €</span>
              </div>
              <div className="flex items-center justify-between pt-3 text-base font-semibold text-(--color-brass)">
                <span>{t("home.sampleTotal")}</span>
                <span className="font-mono-nums">2.083,23 €</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-(--color-border) bg-(--color-paper)">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-(--color-ink-muted) sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © 2026 {t("common.appName")} — {t("footer.rights")}
          </span>
          <nav className="flex gap-4" aria-label="Legal">
            <Link href="/aviso-legal" className="hover:text-(--color-brass)">
              {t("footer.legal")}
            </Link>
            <Link href="/privacidad" className="hover:text-(--color-brass)">
              {t("footer.privacy")}
            </Link>
            <Link href="/cookies" className="hover:text-(--color-brass)">
              {t("footer.cookies")}
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
