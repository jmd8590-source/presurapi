"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/acciones/auth";
import { useT } from "@/components/PrefsProvider";
import { IconEye, IconEyeOff } from "@/components/Icons";

export function RegisterForm() {
  const { t } = useT();
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="stack" noValidate>
      {state?.generalError && (
        <div className="alert alert-error" role="alert">
          {t(state.generalError as any)}
        </div>
      )}

      <div className="field">
        <label htmlFor="nombre">{t("auth.name")}</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          required
          className="input"
          aria-invalid={Boolean(state?.errors?.nombre)}
          aria-describedby={state?.errors?.nombre ? "nombre-error" : undefined}
        />
        {state?.errors?.nombre && (
          <span id="nombre-error" className="field-error">
            {t(state.errors.nombre as any)}
          </span>
        )}
      </div>

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
            autoComplete="new-password"
            required
            className="input"
            style={{ flex: 1 }}
            aria-invalid={Boolean(state?.errors?.password)}
            aria-describedby={state?.errors?.password ? "password-error" : "password-hint"}
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
        <span id="password-hint" className="hint">
          {t("auth.passwordHint")}
        </span>
        {state?.errors?.password && (
          <span id="password-error" className="field-error">
            {t(state.errors.password as any)}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="password2">{t("auth.passwordConfirm")}</label>
        <input
          id="password2"
          name="password2"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          className="input"
          aria-invalid={Boolean(state?.errors?.password2)}
          aria-describedby={state?.errors?.password2 ? "password2-error" : undefined}
        />
        {state?.errors?.password2 && (
          <span id="password2-error" className="field-error">
            {t(state.errors.password2 as any)}
          </span>
        )}
      </div>

      <div className="field">
        <label className="check">
          <input
            type="checkbox"
            name="acepto"
            required
            aria-invalid={Boolean(state?.errors?.acepto)}
            aria-describedby={state?.errors?.acepto ? "acepto-error" : undefined}
          />
          <span>
            {t("auth.acceptTerms")}{" "}
            <Link href="/privacidad" target="_blank">
              {t("cookies.more")}
            </Link>
          </span>
        </label>
        {state?.errors?.acepto && (
          <span id="acepto-error" className="field-error">
            {t(state.errors.acepto as any)}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? t("common.loading") : t("auth.register.submit")}
      </button>

      <div className="auth-links">
        <span>{t("auth.haveAccount")}</span>
        <Link href="/entrar" style={{ fontWeight: 600 }}>
          {t("auth.goLogin")}
        </Link>
      </div>
    </form>
  );
}
