"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { iniciarSesionDemo, type EstadoAccionDemo } from "@/app/acciones/demo-auth";

const estadoInicial: EstadoAccionDemo = { error: null };

export default function LoginForm() {
  const { t } = useLocale();
  const [estado, accion, enviando] = useActionState(iniciarSesionDemo, estadoInicial);

  return (
    <form action={accion} className="flex w-full max-w-sm flex-col gap-5">
      <div
        role="status"
        className="rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-4 py-3 text-xs leading-relaxed text-(--color-ink-muted)"
      >
        {t("auth.demoNotice")}
      </div>

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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-(--color-ink)">
          {t("auth.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {t("auth.submitLogin")}
      </button>

      <div className="flex flex-col gap-2 text-sm text-(--color-ink-muted)">
        <Link href="/recuperar" className="hover:text-(--color-brass)">
          {t("auth.forgotPassword")}
        </Link>
        <p>
          {t("auth.noAccount")}{" "}
          <Link href="/registro" className="font-medium text-(--color-brass) hover:underline">
            {t("auth.registerLink")}
          </Link>
        </p>
      </div>
    </form>
  );
}
