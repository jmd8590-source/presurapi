"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAppwriteStore } from "@/lib/appwrite/store";
import { MATERIALES } from "@/lib/demo/catalog";
import Campo from "@/components/ui/Campo";
import type { UnidadMaterial } from "@/lib/demo/types";
import type { TranslationKey } from "@/lib/i18n/paths";

const UNIDADES: UnidadMaterial[] = ["m2", "ml", "ud", "kg", "l", "saco", "h"];
const UNIDAD_LABEL: Record<UnidadMaterial, TranslationKey> = {
  m2: "banco.unitM2",
  ml: "banco.unitMl",
  ud: "banco.unitUd",
  kg: "banco.unitKg",
  l: "banco.unitL",
  saco: "banco.unitSaco",
  h: "banco.unitH",
};

const inputClase =
  "rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-brass)";

export default function BancoPreciosPage() {
  const { locale, t } = useLocale();
  const {
    db,
    listo,
    fijarPrecioMaterial,
    quitarPrecioMaterial,
    crearMaterialPropio,
    eliminarMaterialPropio,
  } = useAppwriteStore();
  const [edicion, setEdicion] = useState<Record<string, string>>({});
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState<{ nombre: string; unidad: UnidadMaterial; precio: string }>({
    nombre: "",
    unidad: "ud",
    precio: "",
  });

  if (!listo) return null;

  const formatoFecha = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
    dateStyle: "medium",
  });

  function onSubmitMaterial(e: React.FormEvent) {
    e.preventDefault();
    const precio = Number(form.precio);
    if (!form.nombre.trim() || !form.precio || Number.isNaN(precio) || precio < 0) return;
    crearMaterialPropio({ nombre: form.nombre.trim(), unidad: form.unidad, precio });
    setForm({ nombre: "", unidad: "ud", precio: "" });
    setAbierto(false);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">{t("banco.title")}</h1>
      <p className="mt-2 max-w-xl text-sm text-(--color-ink-muted)">{t("banco.intro")}</p>

      <ul className="mt-6 flex flex-col gap-2">
        {MATERIALES.map((material) => {
          const propio = db.precios_usuario.find((p) => p.material_nombre === material.nombre);
          const enEdicion = edicion[material.nombre];

          return (
            <li
              key={material.nombre}
              className="rounded-sm border border-(--color-border) bg-(--color-surface) px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-(--color-ink)">{material.nombre}</p>
                  <p className="mt-0.5 text-xs text-(--color-ink-faint)">
                    {t("banco.source")}: {material.fuente} · {t("banco.updated")}:{" "}
                    {formatoFecha.format(new Date(material.fecha_actualizacion))}
                  </p>
                  <p className="mt-1 text-xs text-(--color-ink-muted)">
                    {t("banco.referencePrice")}:{" "}
                    <span className="font-mono-nums">
                      {material.precio_referencia.toFixed(2)} €
                    </span>
                    /{material.unidad}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {propio && (
                    <p className="font-mono-nums text-sm font-semibold text-(--color-brass)">
                      {t("banco.yourPrice")}: {propio.precio.toFixed(2)} €/{material.unidad}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      aria-label={`${t("banco.yourPrice")}: ${material.nombre}`}
                      placeholder={material.precio_referencia.toFixed(2)}
                      value={enEdicion ?? ""}
                      onChange={(e) =>
                        setEdicion((prev) => ({ ...prev, [material.nombre]: e.target.value }))
                      }
                      className="w-24 rounded-sm border border-(--color-border-strong) bg-(--color-paper) px-2 py-1.5 text-sm text-(--color-ink)"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const valor = Number(enEdicion);
                        if (!enEdicion || Number.isNaN(valor)) return;
                        fijarPrecioMaterial(material.nombre, valor);
                        setEdicion((prev) => ({ ...prev, [material.nombre]: "" }));
                      }}
                      className="rounded-sm border border-(--color-border-strong) px-3 py-1.5 text-xs font-medium text-(--color-ink) hover:border-(--color-brass)"
                    >
                      {t("banco.setPrice")}
                    </button>
                    {propio && (
                      <button
                        type="button"
                        onClick={() => quitarPrecioMaterial(material.nombre)}
                        className="text-xs font-medium text-(--color-ink-muted) hover:text-(--color-brass)"
                      >
                        {t("banco.resetPrice")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-(--color-ink-muted) uppercase">
            {t("banco.myMaterials")}
          </h2>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
          >
            {t("banco.addMaterial")}
          </button>
        </div>
        <p className="mt-2 max-w-xl text-sm text-(--color-ink-muted)">{t("banco.myMaterialsIntro")}</p>

        {abierto && (
          <form
            onSubmit={onSubmitMaterial}
            className="mt-4 flex flex-col gap-3 rounded-sm border border-(--color-border) bg-(--color-surface) p-4"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Campo label={t("banco.materialName")}>
                  <input
                    required
                    className={inputClase}
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </Campo>
              </div>
              <Campo label={t("banco.materialUnit")}>
                <select
                  className={inputClase}
                  value={form.unidad}
                  onChange={(e) => setForm({ ...form, unidad: e.target.value as UnidadMaterial })}
                >
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>
                      {t(UNIDAD_LABEL[u])}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label={t("banco.materialPrice")}>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClase}
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                />
              </Campo>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
              >
                {t("banco.saveMaterial")}
              </button>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-sm border border-(--color-border-strong) px-4 py-2 text-sm font-medium text-(--color-ink)"
              >
                {t("clientes.cancel")}
              </button>
            </div>
          </form>
        )}

        <ul className="mt-4 flex flex-col gap-2">
          {db.materiales_propios.length === 0 && (
            <p className="text-sm text-(--color-ink-muted)">{t("banco.noOwnMaterials")}</p>
          )}
          {db.materiales_propios.map((material) => (
            <li
              key={material.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-(--color-border) bg-(--color-surface) px-4 py-3"
            >
              <p className="text-sm font-medium text-(--color-ink)">{material.nombre}</p>
              <div className="flex items-center gap-3">
                <span className="font-mono-nums text-sm font-semibold text-(--color-brass)">
                  {material.precio.toFixed(2)} €/{t(UNIDAD_LABEL[material.unidad])}
                </span>
                <button
                  type="button"
                  onClick={() => eliminarMaterialPropio(material.id)}
                  className="text-xs font-medium text-(--color-ink-muted) hover:text-(--color-danger)"
                >
                  {t("banco.removeMaterial")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
