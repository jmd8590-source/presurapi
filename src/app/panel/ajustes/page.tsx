"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useDemoStore } from "@/lib/demo/store";
import { PRECIO_HORA_OFICIAL_DEFECTO, PRECIO_HORA_PEON_DEFECTO } from "@/lib/demo/calculo";
import { cerrarSesionDemo } from "@/app/acciones/demo-auth";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-(--color-ink)">{label}</span>
      {children}
    </label>
  );
}

const inputClase =
  "rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-brass)";

export default function AjustesPage() {
  const { t } = useLocale();
  const { db, listo, actualizarPerfil, borrarTodosLosDatos } = useDemoStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [guardado, setGuardado] = useState(false);

  if (!listo) return null;
  const { perfil } = db;

  function onExportar() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "presurapi-mis-datos.json";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }

  async function onBorrarCuenta() {
    if (!window.confirm(t("ajustes.deleteAccountConfirm"))) return;
    borrarTodosLosDatos();
    await cerrarSesionDemo();
  }

  function marcarGuardado() {
    setGuardado(true);
    window.setTimeout(() => setGuardado(false), 1500);
  }

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      actualizarPerfil({ logo_data_url: String(reader.result) });
      marcarGuardado();
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">
        {t("panel.nav.ajustes")}
      </h1>

      {guardado && (
        <p role="status" className="mt-2 text-sm text-(--color-success)">
          {t("ajustes.saved")}
        </p>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-ink-muted) uppercase">
          {t("ajustes.companyDetails")}
        </h2>
        <div className="mt-3 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {perfil.logo_data_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={perfil.logo_data_url}
                alt=""
                className="h-16 w-16 rounded-sm border border-(--color-border) object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-dashed border-(--color-border-strong) text-center text-[10px] text-(--color-ink-faint)">
                {t("ajustes.logo")}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-sm border border-(--color-border-strong) px-3 py-2 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
              >
                {t("ajustes.uploadLogo")}
              </button>
              {perfil.logo_data_url && (
                <button
                  type="button"
                  onClick={() => actualizarPerfil({ logo_data_url: null })}
                  className="rounded-sm px-3 py-2 text-sm font-medium text-(--color-danger)"
                >
                  {t("ajustes.removeLogo")}
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={onLogoChange}
            />
          </div>

          <Campo label={t("ajustes.companyName")}>
            <input
              className={inputClase}
              value={perfil.nombre_empresa}
              onChange={(e) => actualizarPerfil({ nombre_empresa: e.target.value })}
              onBlur={marcarGuardado}
            />
          </Campo>
          <Campo label={t("ajustes.taxId")}>
            <input
              className={inputClase}
              value={perfil.nif_empresa}
              onChange={(e) => actualizarPerfil({ nif_empresa: e.target.value })}
              onBlur={marcarGuardado}
            />
          </Campo>
          <Campo label={t("ajustes.address")}>
            <input
              className={inputClase}
              value={perfil.direccion_empresa}
              onChange={(e) => actualizarPerfil({ direccion_empresa: e.target.value })}
              onBlur={marcarGuardado}
            />
          </Campo>
          <Campo label={t("ajustes.phone")}>
            <input
              className={inputClase}
              value={perfil.telefono_empresa}
              onChange={(e) => actualizarPerfil({ telefono_empresa: e.target.value })}
              onBlur={marcarGuardado}
            />
          </Campo>
          <Campo label={t("ajustes.companyEmail")}>
            <input
              type="email"
              className={inputClase}
              value={perfil.email_empresa}
              onChange={(e) => actualizarPerfil({ email_empresa: e.target.value })}
              onBlur={marcarGuardado}
            />
          </Campo>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-ink-muted) uppercase">
          {t("ajustes.rates")}
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Campo label={t("ajustes.foremanRate")}>
            <input
              type="number"
              min={0}
              step="0.5"
              placeholder={String(PRECIO_HORA_OFICIAL_DEFECTO)}
              className={inputClase}
              value={perfil.precio_hora_oficial ?? ""}
              onChange={(e) =>
                actualizarPerfil({
                  precio_hora_oficial: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              onBlur={marcarGuardado}
            />
            <span className="text-xs text-(--color-ink-faint)">
              {t("ajustes.defaultRatePrefix")} {PRECIO_HORA_OFICIAL_DEFECTO} €/h
            </span>
          </Campo>
          <Campo label={t("ajustes.labourerRate")}>
            <input
              type="number"
              min={0}
              step="0.5"
              placeholder={String(PRECIO_HORA_PEON_DEFECTO)}
              className={inputClase}
              value={perfil.precio_hora_peon ?? ""}
              onChange={(e) =>
                actualizarPerfil({
                  precio_hora_peon: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              onBlur={marcarGuardado}
            />
            <span className="text-xs text-(--color-ink-faint)">
              {t("ajustes.defaultRatePrefix")} {PRECIO_HORA_PEON_DEFECTO} €/h
            </span>
          </Campo>
          <Campo label={t("ajustes.overheadPct")}>
            <input
              type="number"
              min={0}
              max={100}
              step="0.5"
              className={inputClase}
              value={perfil.gastos_generales_pct}
              onChange={(e) => actualizarPerfil({ gastos_generales_pct: Number(e.target.value) })}
              onBlur={marcarGuardado}
            />
          </Campo>
          <Campo label={t("ajustes.profitPct")}>
            <input
              type="number"
              min={0}
              max={100}
              step="0.5"
              className={inputClase}
              value={perfil.beneficio_industrial_pct}
              onChange={(e) =>
                actualizarPerfil({ beneficio_industrial_pct: Number(e.target.value) })
              }
              onBlur={marcarGuardado}
            />
          </Campo>
          <Campo label={t("ajustes.vatPct")}>
            <input
              type="number"
              min={0}
              max={100}
              step="0.5"
              className={inputClase}
              value={perfil.iva_pct}
              onChange={(e) => actualizarPerfil({ iva_pct: Number(e.target.value) })}
              onBlur={marcarGuardado}
            />
          </Campo>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-ink-muted) uppercase">
          {t("ajustes.dataSection")}
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onExportar}
            className="rounded-sm border border-(--color-border-strong) px-4 py-2.5 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
          >
            {t("ajustes.exportData")}
          </button>
          <button
            type="button"
            onClick={onBorrarCuenta}
            className="rounded-sm border border-(--color-danger) px-4 py-2.5 text-sm font-medium text-(--color-danger)"
          >
            {t("ajustes.deleteAccount")}
          </button>
        </div>
      </section>
    </div>
  );
}
