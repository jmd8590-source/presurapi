"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n/paths";

const PASOS: { title: TranslationKey; body: TranslationKey }[] = [
  { title: "panel.tourStep1Title", body: "panel.tourStep1Body" },
  { title: "panel.tourStep2Title", body: "panel.tourStep2Body" },
  { title: "panel.tourStep3Title", body: "panel.tourStep3Body" },
  { title: "panel.tourStep4Title", body: "panel.tourStep4Body" },
  { title: "panel.tourStep5Title", body: "panel.tourStep5Body" },
  { title: "panel.tourStep6Title", body: "panel.tourStep6Body" },
];

export default function GuidedTour() {
  const { t } = useLocale();
  const [abierto, setAbierto] = useState(false);
  const [paso, setPaso] = useState(0);
  const tituloId = useId();
  const dialogoRef = useRef<HTMLDivElement>(null);
  const botonAbrirRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    dialogoRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") cerrar();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [abierto]);

  function abrir() {
    setPaso(0);
    setAbierto(true);
  }

  function cerrar() {
    setAbierto(false);
    botonAbrirRef.current?.focus();
  }

  const esUltimo = paso === PASOS.length - 1;

  return (
    <>
      <button
        ref={botonAbrirRef}
        type="button"
        onClick={abrir}
        className="rounded-sm border border-(--color-border-strong) px-3 py-2 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
      >
        {t("panel.tour")}
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={cerrar}
        >
          <div
            ref={dialogoRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-sm border border-(--color-border) bg-(--color-surface) p-6 outline-none"
          >
            <p className="text-xs font-medium tracking-wide text-(--color-brass) uppercase">
              {t("panel.tourTitle")} · {paso + 1}/{PASOS.length}
            </p>
            <h2 id={tituloId} className="mt-2 font-display text-xl font-semibold text-(--color-ink)">
              {t(PASOS[paso].title)}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-(--color-ink-muted)">
              {t(PASOS[paso].body)}
            </p>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={cerrar}
                className="text-sm font-medium text-(--color-ink-muted) hover:text-(--color-brass)"
              >
                {t("panel.tourClose")}
              </button>
              <div className="flex gap-2">
                {paso > 0 && (
                  <button
                    type="button"
                    onClick={() => setPaso((p) => p - 1)}
                    className="rounded-sm border border-(--color-border-strong) px-4 py-2 text-sm font-medium text-(--color-ink)"
                  >
                    {t("panel.tourBack")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => (esUltimo ? cerrar() : setPaso((p) => p + 1))}
                  className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
                >
                  {esUltimo ? t("panel.tourFinish") : t("panel.tourNext")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
