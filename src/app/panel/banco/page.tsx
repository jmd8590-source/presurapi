"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAppwriteStore } from "@/lib/appwrite/store";
import { MATERIALES } from "@/lib/demo/catalog";

export default function BancoPreciosPage() {
  const { locale, t } = useLocale();
  const { db, listo, fijarPrecioMaterial, quitarPrecioMaterial } = useAppwriteStore();
  const [edicion, setEdicion] = useState<Record<string, string>>({});

  if (!listo) return null;

  const formatoFecha = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
    dateStyle: "medium",
  });

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
    </div>
  );
}
