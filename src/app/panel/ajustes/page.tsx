"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAppwriteStore } from "@/lib/appwrite/store";
import { PRECIO_HORA_OFICIAL_DEFECTO, PRECIO_HORA_PEON_DEFECTO } from "@/lib/demo/calculo";
import { borrarCuentaCompleta } from "@/app/acciones/auth";
import Campo from "@/components/ui/Campo";

const inputClase =
  "rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-brass)";

type FormPerfil = {
  nombre_empresa: string;
  nif_empresa: string;
  direccion_empresa: string;
  telefono_empresa: string;
  email_empresa: string;
  precio_hora_oficial: number | null;
  precio_hora_peon: number | null;
  gastos_generales_pct: number;
  beneficio_industrial_pct: number;
  iva_pct: number;
};

const FORM_VACIO: FormPerfil = {
  nombre_empresa: "",
  nif_empresa: "",
  direccion_empresa: "",
  telefono_empresa: "",
  email_empresa: "",
  precio_hora_oficial: null,
  precio_hora_peon: null,
  gastos_generales_pct: 13,
  beneficio_industrial_pct: 6,
  iva_pct: 21,
};

export default function AjustesPage() {
  const { t } = useLocale();
  const { db, listo, actualizarPerfil } = useAppwriteStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [guardado, setGuardado] = useState(false);
  const [borrando, setBorrando] = useState(false);
  // Se edita en local y solo se guarda al pulsar "Guardar cambios" (antes se
  // guardaba en Appwrite en cada pulsación de tecla). Se inicializa una sola
  // vez, justo cuando los datos reales terminan de cargar: en vez de un
  // efecto, se ajusta durante el render (patrón recomendado por React para
  // "adjusting state when a prop changes"), comparando con el `listo`
  // anterior en lugar de disparar un setState dentro de un useEffect.
  const [form, setForm] = useState<FormPerfil>(FORM_VACIO);
  const [listoAnterior, setListoAnterior] = useState(listo);

  if (listo && !listoAnterior) {
    setListoAnterior(listo);
    setForm({
      nombre_empresa: db.perfil.nombre_empresa,
      nif_empresa: db.perfil.nif_empresa,
      direccion_empresa: db.perfil.direccion_empresa,
      telefono_empresa: db.perfil.telefono_empresa,
      email_empresa: db.perfil.email_empresa,
      precio_hora_oficial: db.perfil.precio_hora_oficial,
      precio_hora_peon: db.perfil.precio_hora_peon,
      gastos_generales_pct: db.perfil.gastos_generales_pct,
      beneficio_industrial_pct: db.perfil.beneficio_industrial_pct,
      iva_pct: db.perfil.iva_pct,
    });
  }

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
    setBorrando(true);
    await borrarCuentaCompleta();
  }

  function marcarGuardado() {
    setGuardado(true);
    window.setTimeout(() => setGuardado(false), 1500);
  }

  function onGuardar(e: React.FormEvent) {
    e.preventDefault();
    actualizarPerfil(form);
    marcarGuardado();
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

      <form onSubmit={onGuardar}>
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
                value={form.nombre_empresa}
                onChange={(e) => setForm({ ...form, nombre_empresa: e.target.value })}
              />
            </Campo>
            <Campo label={t("ajustes.taxId")}>
              <input
                className={inputClase}
                value={form.nif_empresa}
                onChange={(e) => setForm({ ...form, nif_empresa: e.target.value })}
              />
            </Campo>
            <Campo label={t("ajustes.address")}>
              <input
                className={inputClase}
                value={form.direccion_empresa}
                onChange={(e) => setForm({ ...form, direccion_empresa: e.target.value })}
              />
            </Campo>
            <Campo label={t("ajustes.phone")}>
              <input
                className={inputClase}
                value={form.telefono_empresa}
                onChange={(e) => setForm({ ...form, telefono_empresa: e.target.value })}
              />
            </Campo>
            <Campo label={t("ajustes.companyEmail")}>
              <input
                type="email"
                className={inputClase}
                value={form.email_empresa}
                onChange={(e) => setForm({ ...form, email_empresa: e.target.value })}
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
                value={form.precio_hora_oficial ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    precio_hora_oficial: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
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
                value={form.precio_hora_peon ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    precio_hora_peon: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
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
                value={form.gastos_generales_pct}
                onChange={(e) => setForm({ ...form, gastos_generales_pct: Number(e.target.value) })}
              />
            </Campo>
            <Campo label={t("ajustes.profitPct")}>
              <input
                type="number"
                min={0}
                max={100}
                step="0.5"
                className={inputClase}
                value={form.beneficio_industrial_pct}
                onChange={(e) =>
                  setForm({ ...form, beneficio_industrial_pct: Number(e.target.value) })
                }
              />
            </Campo>
            <Campo label={t("ajustes.vatPct")}>
              <input
                type="number"
                min={0}
                max={100}
                step="0.5"
                className={inputClase}
                value={form.iva_pct}
                onChange={(e) => setForm({ ...form, iva_pct: Number(e.target.value) })}
              />
            </Campo>
          </div>
        </section>

        <button
          type="submit"
          className="mt-6 rounded-sm bg-(--color-brass) px-5 py-2.5 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
        >
          {t("ajustes.save")}
        </button>
      </form>

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
            disabled={borrando}
            className="rounded-sm border border-(--color-danger) px-4 py-2.5 text-sm font-medium text-(--color-danger) disabled:opacity-60"
          >
            {t("ajustes.deleteAccount")}
          </button>
        </div>
      </section>
    </div>
  );
}
