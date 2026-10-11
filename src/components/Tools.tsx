"use client";

import { useEffect, useRef, useState } from "react";
import { SCALES, usePrefs } from "./PrefsProvider";
import { IconAccess, IconHelp, IconMoon, IconSun } from "./Icons";
import { Tour } from "./Tour";

function A11yPanel() {
  const { t, scale, setScale, contrast, setContrast, reduceMotion, setReduceMotion } = usePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const idx = Math.max(0, SCALES.indexOf(scale));
  return (
    <div className="pop-wrap" ref={ref}>
      <button
        type="button"
        className="icon-btn"
        aria-label={t("tools.a11y")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-tour="a11y"
      >
        <IconAccess />
      </button>
      {open && (
        <div className="popover" role="dialog" aria-label={t("a11y.title")}>
          <h2 style={{ fontSize: "1.05rem" }}>{t("a11y.title")}</h2>
          <div className="field">
            <span id="a11y-size" style={{ fontWeight: 600 }}>{t("a11y.textSize")}</span>
            <div className="row" role="group" aria-labelledby="a11y-size">
              <button type="button" className="btn btn-secondary" aria-label={t("a11y.smaller")} disabled={idx === 0} onClick={() => setScale(SCALES[idx - 1])}>A−</button>
              <span className="num" aria-live="polite">{Math.round(scale * 100)} %</span>
              <button type="button" className="btn btn-secondary" aria-label={t("a11y.bigger")} disabled={idx === SCALES.length - 1} onClick={() => setScale(SCALES[idx + 1])}>A+</button>
              <button type="button" className="btn btn-ghost" onClick={() => setScale(1)}>{t("a11y.reset")}</button>
            </div>
          </div>
          <label className="check" style={{ marginBottom: 12 }}>
            <input type="checkbox" checked={contrast} onChange={(e) => setContrast(e.target.checked)} />
            <span>{t("a11y.contrast")}</span>
          </label>
          <label className="check">
            <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />
            <span>{t("a11y.motion")}</span>
          </label>
        </div>
      )}
    </div>
  );
}

export function LangToggle() {
  const { t, lang, setLang } = usePrefs();
  return (
    <div className="seg" role="group" aria-label={t("tools.language")} data-tour="lang">
      <button type="button" aria-pressed={lang === "es"} lang="es" onClick={() => setLang("es")}>ES</button>
      <button type="button" aria-pressed={lang === "en"} lang="en" onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

export function ThemeToggle() {
  const { t, theme, toggleTheme } = usePrefs();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={dark ? t("tools.switchToLight") : t("tools.switchToDark")}
      aria-pressed={dark}
      data-tour="theme"
    >
      {dark ? <IconSun /> : <IconMoon />}
    </button>
  );
}

/** Herramientas de la esquina superior derecha. `withTour` solo dentro de la app. */
export function Tools({ withTour = false }: { withTour?: boolean }) {
  const { t } = usePrefs();
  const [tour, setTour] = useState(false);
  return (
    <div className="topbar-tools">
      {withTour && (
        <button type="button" className="icon-btn" aria-label={t("tools.tour")} title={t("tools.tour")} onClick={() => setTour(true)} data-tour="tour">
          <IconHelp />
        </button>
      )}
      <A11yPanel />
      <LangToggle />
      <ThemeToggle />
      {tour && <Tour onClose={() => setTour(false)} />}
    </div>
  );
}
