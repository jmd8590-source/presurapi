"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANG_COOKIE, translate, type Key, type Lang } from "@/lib/i18n";

export type Theme = "light" | "dark";
export type Consent = "all" | "necessary" | null;
type Prefs = { theme?: Theme; scale?: number; contrast?: boolean; motion?: boolean; lang?: Lang };

const PREFS_KEY = "pr_prefs";
export const CONSENT_COOKIE = "pr_consent";
export const SCALES = [0.9, 1, 1.15, 1.3, 1.5];

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
  theme: Theme;
  toggleTheme: () => void;
  scale: number;
  setScale: (s: number) => void;
  contrast: boolean;
  setContrast: (v: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  consent: Consent;
  setConsent: (c: "all" | "necessary") => void;
};

const PrefsContext = createContext<Ctx | null>(null);

function readCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function writeCookie(name: string, value: string, days: number) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${days * 86400}; Path=/; SameSite=Lax${secure}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY) ?? sessionStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as Prefs) : {};
  } catch {
    return {};
  }
}

export function PrefsProvider({ initialLang, children }: { initialLang: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setTheme] = useState<Theme>("light");
  const [scale, setScaleState] = useState(1);
  const [contrast, setContrastState] = useState(false);
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [consent, setConsentState] = useState<Consent>(null);

  // Estado inicial real: lo leemos del navegador tras la hidratación.
  useEffect(() => {
    const stored = loadPrefs();
    const root = document.documentElement;
    setTheme((root.getAttribute("data-theme") as Theme) || "light");
    setScaleState(stored.scale ?? 1);
    setContrastState(Boolean(stored.contrast));
    setReduceMotionState(Boolean(stored.motion));
    const c = readCookie(CONSENT_COOKIE);
    setConsentState(c === "all" || c === "necessary" ? c : null);
    if (stored.lang && stored.lang !== initialLang && readCookie(LANG_COOKIE) == null) {
      setLangState(stored.lang);
    }
  }, [initialLang]);

  // Se aplican al instante al <html>.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.style.setProperty("--text-scale", String(scale));
  }, [scale]);
  useEffect(() => {
    if (contrast) document.documentElement.setAttribute("data-contrast", "high");
    else document.documentElement.removeAttribute("data-contrast");
  }, [contrast]);
  useEffect(() => {
    if (reduceMotion) document.documentElement.setAttribute("data-motion", "reduce");
    else document.documentElement.removeAttribute("data-motion");
  }, [reduceMotion]);

  const persist = useCallback(
    (patch: Prefs, accepted: Consent) => {
      const merged = { ...loadPrefs(), ...patch };
      const json = JSON.stringify(merged);
      try {
        if (accepted === "all") {
          localStorage.setItem(PREFS_KEY, json);
          sessionStorage.removeItem(PREFS_KEY);
          if (patch.lang) writeCookie(LANG_COOKIE, patch.lang, 365);
        } else {
          sessionStorage.setItem(PREFS_KEY, json);
        }
      } catch {
        /* almacenamiento bloqueado: se mantiene solo en memoria */
      }
    },
    [],
  );

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      persist({ lang: l }, consent);
    },
    [consent, persist],
  );
  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    persist({ theme: next }, consent);
  }, [theme, consent, persist]);
  const setScale = useCallback(
    (s: number) => {
      setScaleState(s);
      persist({ scale: s }, consent);
    },
    [consent, persist],
  );
  const setContrast = useCallback(
    (v: boolean) => {
      setContrastState(v);
      persist({ contrast: v }, consent);
    },
    [consent, persist],
  );
  const setReduceMotion = useCallback(
    (v: boolean) => {
      setReduceMotionState(v);
      persist({ motion: v }, consent);
    },
    [consent, persist],
  );

  const setConsent = useCallback(
    (c: "all" | "necessary") => {
      writeCookie(CONSENT_COOKIE, c, 180);
      setConsentState(c);
      const current: Prefs = { theme, scale, contrast, motion: reduceMotion, lang };
      if (c === "all") {
        persist(current, "all");
      } else {
        // Rechazadas: se borra lo que hubiera guardado de forma persistente.
        try {
          localStorage.removeItem(PREFS_KEY);
        } catch {
          /* nada */
        }
        deleteCookie(LANG_COOKIE);
        persist(current, "necessary");
      }
    },
    [theme, scale, contrast, reduceMotion, lang, persist],
  );

  const t = useCallback(
    (key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t, theme, toggleTheme, scale, setScale, contrast, setContrast, reduceMotion, setReduceMotion, consent, setConsent }),
    [lang, setLang, t, theme, toggleTheme, scale, setScale, contrast, setContrast, reduceMotion, setReduceMotion, consent, setConsent],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): Ctx {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs debe usarse dentro de PrefsProvider");
  return ctx;
}

export function useT() {
  const { t, lang } = usePrefs();
  return { t, lang };
}
