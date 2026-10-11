"use client";

import { useActionState, useState } from "react";
import { updateEmpresaSettingsAction } from "@/app/acciones/empresa";
import { cambiarPasswordAction, exportarDatosAction, eliminarCuentaAction } from "@/app/acciones/ajustes";
import { useT } from "@/components/PrefsProvider";
import { IconEye, IconEyeOff } from "@/components/Icons";

export function AjustesView({ empresa }: { empresa: any }) {
  const { t } = useT();

  // Estados de acciones
  const [empresaState, empresaAction, empresaPending] = useActionState(updateEmpresaSettingsAction, null);
  const [passState, passAction, passPending] = useActionState(cambiarPasswordAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState(eliminarCuentaAction, null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportarDatosAction();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `presurapi-datos-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Error al exportar datos");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="stack" style={{ maxWidth: 760 }}>
      <h1>{t("settings.title")}</h1>

      {/* SECCIÓN 1: MI EMPRESA */}
      <div className="card">
        <h2 style={{ fontSize: "1.25rem", marginBottom: 16 }}>{t("settings.company")}</h2>

        {empresaState?.ok && (
          <div className="alert alert-ok" role="status">
            {t("settings.saved")}
          </div>
        )}

        <form action={empresaAction} className="stack" encType="multipart/form-data" noValidate>
          <div className="field">
            <label htmlFor="nombre">{t("onb.company")}</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              defaultValue={empresa.nombre}
              className="input"
            />
          </div>

          <div className="field">
            <label htmlFor="cif">{t("onb.cif")}</label>
            <input
              id="cif"
              name="cif"
              type="text"
              required
              defaultValue={empresa.cif}
              className="input"
            />
          </div>

          <div className="field">
            <label htmlFor="direccion">{t("onb.address")}</label>
            <input
              id="direccion"
              name="direccion"
              type="text"
              required
              defaultValue={empresa.direccion}
              className="input"
            />
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="cp">{t("onb.postal")}</label>
              <input
                id="cp"
                name="cp"
                type="text"
                defaultValue={empresa.cp}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor="poblacion">{t("onb.city")}</label>
              <input
                id="poblacion"
                name="poblacion"
                type="text"
                defaultValue={empresa.poblacion}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="provincia">{t("onb.province")}</label>
              <input
                id="provincia"
                name="provincia"
                type="text"
                defaultValue={empresa.provincia}
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor="telefono">{t("onb.phone")}</label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                defaultValue={empresa.telefono}
                className="input"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="emailContacto">{t("onb.contactEmail")}</label>
            <input
              id="emailContacto"
              name="emailContacto"
              type="email"
              defaultValue={empresa.emailContacto}
              className="input"
            />
          </div>

          <div className="field">
            <label htmlFor="logo">{t("onb.logo")}</label>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="input"
              style={{ padding: "8px" }}
            />
            <span className="hint">{t("onb.logoHint")}</span>
          </div>

          <div className="field">
            <label htmlFor="ivaPct">{t("onb.vat")}</label>
            <input
              id="ivaPct"
              name="ivaPct"
              type="number"
              min="0"
              max="100"
              step="0.5"
              defaultValue={empresa.ivaPct}
              className="input"
              style={{ maxWidth: 140 }}
            />
          </div>

          <div className="field">
            <label htmlFor="condiciones">{t("onb.terms")}</label>
            <textarea
              id="condiciones"
              name="condiciones"
              rows={4}
              defaultValue={empresa.condiciones}
              className="textarea"
            />
          </div>

          <div className="field">
            <label htmlFor="piePdf">{t("onb.footer")}</label>
            <input
              id="piePdf"
              name="piePdf"
              type="text"
              defaultValue={empresa.piePdf}
              className="input"
            />
          </div>

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={empresaPending}
              aria-busy={empresaPending}
            >
              {empresaPending ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN 2: CAMBIAR CONTRASEÑA */}
      <div className="card">
        <h2 style={{ fontSize: "1.25rem", marginBottom: 16 }}>{t("settings.password")}</h2>

        {passState?.successMessage && (
          <div className="alert alert-ok" role="status">
            {t(passState.successMessage as any)}
          </div>
        )}

        <form action={passAction} className="stack" noValidate>
          <div className="field">
            <label htmlFor="actual">{t("settings.currentPassword")}</label>
            <div className="row" style={{ gap: 6, width: "100%" }}>
              <input
                id="actual"
                name="actual"
                type={showCurrent ? "text" : "password"}
                required
                className="input"
                style={{ flex: 1 }}
                aria-invalid={Boolean(passState?.errors?.actual)}
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? t("auth.hide") : t("auth.show")}
              >
                {showCurrent ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {passState?.errors?.actual && (
              <span className="field-error">{t(passState.errors.actual as any)}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="new-pass">{t("auth.passwordNew")}</label>
            <div className="row" style={{ gap: 6, width: "100%" }}>
              <input
                id="new-pass"
                name="password"
                type={showNew ? "text" : "password"}
                required
                className="input"
                style={{ flex: 1 }}
                aria-invalid={Boolean(passState?.errors?.password)}
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? t("auth.hide") : t("auth.show")}
              >
                {showNew ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            <span className="hint">{t("auth.passwordHint")}</span>
            {passState?.errors?.password && (
              <span className="field-error">{t(passState.errors.password as any)}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="new-pass2">{t("auth.passwordConfirm")}</label>
            <input
              id="new-pass2"
              name="password2"
              type={showNew ? "text" : "password"}
              required
              className="input"
              aria-invalid={Boolean(passState?.errors?.password2)}
            />
            {passState?.errors?.password2 && (
              <span className="field-error">{t(passState.errors.password2 as any)}</span>
            )}
          </div>

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={passPending}
              aria-busy={passPending}
            >
              {passPending ? t("common.saving") : t("settings.password")}
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN 3: PRIVACIDAD Y RGPD */}
      <div className="card">
        <h2 style={{ fontSize: "1.25rem", marginBottom: 8 }}>{t("settings.privacy")}</h2>
        <p className="muted" style={{ fontSize: "0.95rem" }}>
          {t("settings.privacyText")}
        </p>

        <div className="row" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExport}
            disabled={exporting}
            aria-busy={exporting}
          >
            {exporting ? t("common.loading") : t("settings.export")} 📥
          </button>
        </div>

        <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid var(--border)" }} />

        <div className="field">
          <label style={{ color: "var(--danger)" }}>{t("settings.deleteAccount")}</label>
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            {t("settings.deleteConfirm")}
          </p>
        </div>

        {deleteState?.generalError && (
          <div className="alert alert-error" role="alert">
            {t(deleteState.generalError as any)}
          </div>
        )}

        <form action={deleteAction} className="stack" noValidate>
          <div className="field" style={{ maxWidth: 300 }}>
            <input
              name="confirmacion"
              type="text"
              placeholder={t("settings.deleteWord")}
              required
              className="input"
            />
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={deletePending}
              aria-busy={deletePending}
            >
              {deletePending ? t("common.loading") : t("settings.deleteAccount")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
