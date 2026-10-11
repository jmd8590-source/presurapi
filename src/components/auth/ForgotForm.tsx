"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/acciones/auth";
import { useT } from "@/components/PrefsProvider";

export function ForgotForm() {
  const { t } = useT();
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

  return (
    <form action={formAction} className="stack" noValidate>
      {state?.successMessage && (
        <div className="alert alert-ok" role="status">
          {t(state.successMessage as any)}
        </div>
      )}

      {state?.generalError && (
        <div className="alert alert-error" role="alert">
          {t(state.generalError as any)}
        </div>
      )}

      <div className="field">
        <label htmlFor="email">{t("auth.email")}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          aria-invalid={Boolean(state?.errors?.email)}
          aria-describedby={state?.errors?.email ? "email-error" : undefined}
        />
        {state?.errors?.email && (
          <span id="email-error" className="field-error">
            {t(state.errors.email as any)}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? t("common.loading") : t("auth.forgot.submit")}
      </button>

      <div className="auth-links">
        <Link href="/entrar" style={{ fontWeight: 600 }}>
          ← {t("common.back")}
        </Link>
      </div>
    </form>
  );
}
