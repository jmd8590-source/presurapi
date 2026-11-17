"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { tienePermisoDePreferencias } from "@/lib/cookies/consent";

export type Theme = "light" | "dark";
const THEME_COOKIE = "presurapi_theme";

function readStoredTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )presurapi_theme=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  if (value === "dark" || value === "light") return value;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return null;
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Arranca igual que el servidor ("light") para que la hidratación no choque; el
  // inline script de layout.tsx ya corrigió el atributo data-theme (y por tanto los
  // colores) antes del primer pintado. Este estado solo gobierna el propio botón.
  const [theme, setThemeState] = useState<Theme>("light");

  const applyTheme = useCallback((next: Theme) => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", next);
    // Solo se persiste en cookie con consentimiento de cookies de
    // preferencia; sin él, el tema sigue funcionando pero no sobrevive a un
    // cierre de pestaña (ver src/lib/cookies/consent.ts).
    if (tienePermisoDePreferencias()) {
      document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    }
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      applyTheme(next);
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  // Corrige el estado de React a partir de la cookie/preferencia del sistema antes
  // de que el navegador pinte (useLayoutEffect, no useEffect), sin provocar el error
  // de hidratación: el primer render del cliente ya coincidió con el del servidor.
  useLayoutEffect(() => {
    const stored = readStoredTheme();
    if (stored && stored !== theme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export { THEME_COOKIE };
