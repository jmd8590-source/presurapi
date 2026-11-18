"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { iniciarSesion, type EstadoAccion } from "@/app/acciones/auth";

const estadoInicial: EstadoAccion = { error: null };

const mensajeError = {
  invalid: "auth.errorInvalid",
  mismatch: "auth.errorPasswordMismatch",
  exists: "auth.errorExists",
} as const;

export default function LoginForm() {
  const { t } = useLocale();
  const [estado, accion, enviando] = useActionState(iniciarSesion, estadoInicial);
  const params = useSearchParams();
  const recuperada = params.get("recuperada") === "1";

  return (
    <form action={accion} className="flex w-full max-w-sm flex-col gap-5">
      {recuperada && (
        <p
          role="status"
          className="rounded-sm border border-(--color-success) bg-(--color-surface) px-4 py-3 text-sm text-(--color-success)"
        >
          {t("auth.recoveredNotice")}
        </p>
      )}

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
          {t(mensajeError[estado.error as keyof typeof mensajeError] ?? "auth.errorInvalid")}
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
