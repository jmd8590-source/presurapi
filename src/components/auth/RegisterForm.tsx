"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { registrar, type EstadoAccion } from "@/app/acciones/auth";

const estadoInicial: EstadoAccion = { error: null };

const mensajeError = {
  invalid: "auth.errorInvalid",
  mismatch: "auth.errorPasswordMismatch",
  exists: "auth.errorExists",
} as const;

export default function RegisterForm() {
  const { t } = useLocale();
  const [estado, accion, enviando] = useActionState(registrar, estadoInicial);
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const noCoinciden = confirmacion.length > 0 && password !== confirmacion;

  return (
    <form action={accion} className="flex w-full max-w-sm flex-col gap-5">
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-brass)"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password_confirm" className="text-sm font-medium text-(--color-ink)">
          {t("auth.passwordConfirm")}
        </label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          aria-invalid={noCoinciden}
          className="rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-brass) aria-invalid:border-(--color-danger)"
        />
        {noCoinciden && (
          <p role="alert" className="text-xs text-(--color-danger)">
            {t("auth.errorPasswordMismatch")}
          </p>
        )}
      </div>

      {estado.error && (
        <p role="alert" className="text-sm text-(--color-danger)">
          {t(mensajeError[estado.error as keyof typeof mensajeError] ?? "auth.errorInvalid")}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || noCoinciden || password.length === 0}
        className="rounded-sm bg-(--color-brass) px-5 py-2.5 text-sm font-semibold text-(--color-brass-contrast) transition-colors hover:bg-(--color-brass-hover) disabled:opacity-60"
      >
        {t("auth.submitRegister")}
      </button>

      <p className="text-sm text-(--color-ink-muted)">
        {t("auth.hasAccount")}{" "}
        <Link href="/entrar" className="font-medium text-(--color-brass) hover:underline">
          {t("auth.loginLink")}
        </Link>
      </p>
    </form>
  );
}
