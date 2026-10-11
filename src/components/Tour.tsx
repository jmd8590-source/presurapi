"use client";

import { useEffect, useRef, useState } from "react";
import type { Key } from "@/lib/i18n";
import { usePrefs } from "./PrefsProvider";

const STEPS: { title: Key; text: Key }[] = [
  { title: "tour.s1.title", text: "tour.s1.text" },
  { title: "tour.s2.title", text: "tour.s2.text" },
  { title: "tour.s3.title", text: "tour.s3.text" },
  { title: "tour.s4.title", text: "tour.s4.text" },
  { title: "tour.s5.title", text: "tour.s5.text" },
  { title: "tour.s6.title", text: "tour.s6.text" },
];

/** Tour guiado accesible: diálogo modal con foco atrapado y cierre con Escape. */
export function Tour({ onClose }: { onClose: () => void }) {
  const { t } = usePrefs();
  const [i, setI] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const last = i === STEPS.length - 1;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    cardRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && cardRef.current) {
        const items = cardRef.current.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (!items.length) return;
        const first = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="tour-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tour-card rise" role="dialog" aria-modal="true" aria-labelledby="tour-title" ref={cardRef}>
        <p className="muted num" style={{ marginBottom: 4 }}>
          {t("tour.title")} · {t("tour.step", { n: i + 1, total: STEPS.length })}
        </p>
        <h2 id="tour-title">{t(STEPS[i].title)}</h2>
        <p aria-live="polite">{t(STEPS[i].text)}</p>
        <div className="row" style={{ justifyContent: "space-between", marginTop: 16 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>{t("common.close")}</button>
          <div className="row">
            <button type="button" className="btn btn-secondary" disabled={i === 0} onClick={() => setI(i - 1)}>{t("common.back")}</button>
            <button type="button" className="btn btn-primary" onClick={() => (last ? onClose() : setI(i + 1))}>
              {last ? t("common.finish") : t("common.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
