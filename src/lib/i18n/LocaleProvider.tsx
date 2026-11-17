"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultLocale, dictionaries, isLocale, type Locale } from "./index";
import { resolvePath, type TranslationKey } from "./paths";

const LOCALE_COOKIE = "presurapi_locale";

function readStoredLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )presurapi_locale=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  return isLocale(value) ? value : null;
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // El servidor (shell estático) siempre renderiza en español; una preferencia
  // guardada distinta se aplica justo después de montar (ver useEffect más abajo).
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof document !== "undefined") {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
    }
  }, []);

  // No hay forma de traducir todo el árbol antes del pintado sin un script por nodo,
  // así que aceptamos un cambio breve tras montar en vez de arriesgar un error de
  // hidratación en cada texto de la página.
  useEffect(() => {
    const stored = readStoredLocale();
    if (stored && stored !== locale) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
      document.documentElement.lang = stored;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = useCallback(
    (key: TranslationKey) => resolvePath(dictionaries[locale], key),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export { LOCALE_COOKIE };
