"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/acciones/auth";
import { useT } from "@/components/PrefsProvider";
import { IconEye, IconEyeOff } from "@/components/Icons";

export function LoginForm({ resetSuccess }: { resetSuccess?: boolean }) {
  const { t } = useT();
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="stack" noValidate>
      {resetSuccess && (
        <div className="alert alert-ok" role="status">
          {t("auth.reset.done")}
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

      <div className="field">
        <label htmlFor="password">{t("auth.password")}</label>
        <div className="row" style={{ gap: 6, width: "100%" }}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="input"
            style={{ flex: 1 }}
            aria-invalid={Boolean(state?.errors?.password)}
            aria-describedby={state?.errors?.password ? "password-error" : undefined}
          />
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t("auth.hide") : t("auth.show")}
          >
            {showPassword ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>
        {state?.errors?.password && (
          <span id="password-error" className="field-error">
            {t(state.errors.password as any)}
          </span>
        )}
      </div>

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Link href="/recuperar" style={{ fontSize: "0.9rem" }}>
          {t("auth.forgot")}
        </Link>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? t("common.loading") : t("auth.login.submit")}
      </button>

      <div className="auth-links">
        <span>{t("auth.noAccount")}</span>
        <Link href="/registro" style={{ fontWeight: 600 }}>
          {t("auth.signup")}
        </Link>
      </div>
    </form>
  );
}
