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

// El diálogo es un componente controlado aparte (en vez de llevar también su
// propio botón de apertura) porque en móvil lo abre una entrada del menú del
// Topbar (ver TopbarMenu.tsx), no un botón "Tour" propio: en pantallas
// estrechas no cabe un botón más en la cabecera.
export function GuidedTourDialog({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { t } = useLocale();
  const [paso, setPaso] = useState(0);
  const tituloId = useId();
  const dialogoRef = useRef<HTMLDivElement>(null);

  // Reinicia al primer paso cada vez que se abre: ajuste de estado durante
  // el render en respuesta a un cambio de prop (patrón recomendado por
  // React), no dentro de un efecto, para no disparar un render en cascada.
  const [abiertoPrevio, setAbiertoPrevio] = useState(abierto);
  if (abierto !== abiertoPrevio) {
    setAbiertoPrevio(abierto);
    if (abierto) setPaso(0);
  }

  useEffect(() => {
    if (!abierto) return;
    dialogoRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  if (!abierto) return null;

  const esUltimo = paso === PASOS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCerrar}>
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
        <p className="mt-2 text-sm leading-relaxed text-(--color-ink-muted)">{t(PASOS[paso].body)}</p>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onCerrar}
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
              onClick={() => (esUltimo ? onCerrar() : setPaso((p) => p + 1))}
              className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
            >
              {esUltimo ? t("panel.tourFinish") : t("panel.tourNext")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Botón "Tour" + diálogo, para el Topbar de escritorio (md+), que sí tiene
// sitio para un botón propio.
export default function GuidedTour() {
  const { t } = useLocale();
  const [abierto, setAbierto] = useState(false);
  const botonAbrirRef = useRef<HTMLButtonElement>(null);

  function cerrar() {
    setAbierto(false);
    botonAbrirRef.current?.focus();
  }

  return (
    <>
      <button
        ref={botonAbrirRef}
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-sm border border-(--color-border-strong) px-3 py-2 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
      >
        {t("panel.tour")}
      </button>
      <GuidedTourDialog abierto={abierto} onCerrar={cerrar} />
    </>
  );
}
