"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { restablecerContrasena, type EstadoAccion } from "@/app/acciones/auth";

const estadoInicial: EstadoAccion = { error: null };

export default function ResetPasswordForm() {
  const { t } = useLocale();
  const params = useSearchParams();
  const userId = params.get("userId");
  const secret = params.get("secret");
  const [estado, accion, enviando] = useActionState(restablecerContrasena, estadoInicial);
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const noCoinciden = confirmacion.length > 0 && password !== confirmacion;

  if (!userId || !secret) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-5 text-center">
        <p role="alert" className="text-sm text-(--color-danger)">
          {t("auth.resetInvalidLink")}
        </p>
        <Link
          href="/recuperar"
          className="self-center rounded-sm border border-(--color-border-strong) px-5 py-2.5 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
        >
          {t("auth.forgotTitle")}
        </Link>
      </div>
    );
  }

  return (
    <form action={accion} className="flex w-full max-w-sm flex-col gap-5">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="secret" value={secret} />

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

      {estado.error === "expired" && (
        <p role="alert" className="text-sm text-(--color-danger)">
          {t("auth.resetInvalidLink")}
        </p>
      )}
      {estado.error && estado.error !== "expired" && (
        <p role="alert" className="text-sm text-(--color-danger)">
          {t("auth.errorInvalid")}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || noCoinciden || password.length === 0}
        className="rounded-sm bg-(--color-brass) px-5 py-2.5 text-sm font-semibold text-(--color-brass-contrast) transition-colors hover:bg-(--color-brass-hover) disabled:opacity-60"
      >
        {t("auth.resetSubmit")}
      </button>
    </form>
  );
}
