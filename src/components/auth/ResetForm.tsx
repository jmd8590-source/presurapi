"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/app/acciones/auth";
import { useT } from "@/components/PrefsProvider";
import { IconEye, IconEyeOff } from "@/components/Icons";

export function ResetForm({ token }: { token: string }) {
  const { t } = useT();
  const boundAction = resetPasswordAction.bind(null, token);
  const [state, formAction, isPending] = useActionState(boundAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="stack" noValidate>
      {state?.generalError && (
        <div className="alert alert-error" role="alert">
          {t(state.generalError as any)}
        </div>
      )}

      <div className="field">
        <label htmlFor="password">{t("auth.passwordNew")}</label>
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

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? t("common.loading") : t("auth.reset.submit")}
      </button>

      <div className="auth-links">
        <Link href="/entrar" style={{ fontWeight: 600 }}>
          ← {t("common.back")}
        </Link>
      </div>
    </form>
  );
}
