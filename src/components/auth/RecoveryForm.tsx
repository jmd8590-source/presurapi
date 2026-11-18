"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { solicitarRecuperacion, type EstadoRecuperacion } from "@/app/acciones/auth";

const estadoInicial: EstadoRecuperacion = { error: null, enviado: false };

export default function RecoveryForm() {
  const { t } = useLocale();
  const [estado, accion, enviando] = useActionState(solicitarRecuperacion, estadoInicial);

  if (estado.enviado) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-5 text-center">
        <p role="status" className="text-sm leading-relaxed text-(--color-ink-muted)">
          {t("auth.forgotSent")}
        </p>
        <Link
          href="/entrar"
          className="self-center rounded-sm border border-(--color-border-strong) px-5 py-2.5 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
        >
          {t("auth.loginLink")}
        </Link>
      </div>
    );
  }

  return (
    <form action={accion} className="flex w-full max-w-sm flex-col gap-5">
      <p className="text-sm leading-relaxed text-(--color-ink-muted)">{t("auth.forgotBody")}</p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-(--color-ink)">
          {t("auth.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-brass)"
        />
      </div>

      {estado.error && (
        <p role="alert" className="text-sm text-(--color-danger)">
          {t("auth.errorInvalid")}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-sm bg-(--color-brass) px-5 py-2.5 text-sm font-semibold text-(--color-brass-contrast) transition-colors hover:bg-(--color-brass-hover) disabled:opacity-60"
      >
        {t("auth.forgotSubmit")}
      </button>

      <Link
        href="/entrar"
        className="self-center text-sm text-(--color-ink-muted) hover:text-(--color-brass)"
      >
        {t("auth.loginLink")}
      </Link>
    </form>
  );
}
