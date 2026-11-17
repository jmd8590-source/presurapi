"use client";

import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function RecuperarPage() {
  const { t } = useLocale();

  return (
    <AuthShell titleKey="auth.forgotTitle">
      <div className="flex w-full max-w-sm flex-col gap-5 text-center">
        <p className="text-sm leading-relaxed text-(--color-ink-muted)">{t("auth.forgotBody")}</p>
        <Link
          href="/entrar"
          className="self-center rounded-sm border border-(--color-border-strong) px-5 py-2.5 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
        >
          {t("auth.loginLink")}
        </Link>
      </div>
    </AuthShell>
  );
}
