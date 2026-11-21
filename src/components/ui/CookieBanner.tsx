"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { guardarConsentimiento, leerConsentimiento } from "@/lib/cookies/consent";

export default function CookieBanner() {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  const [configurando, setConfigurando] = useState(false);
  const [preferencias, setPreferencias] = useState(false);

  useEffect(() => {
    // Solo se decide una vez, tras montar (necesita document.cookie, que no
    // existe en el servidor); no mostrarlo nunca de más es más importante
    // que evitar un parpadeo de un frame.
    if (!leerConsentimiento()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function decidir(preferenciasAceptadas: boolean) {
    guardarConsentimiento(preferenciasAceptadas);
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label={t("cookiesBanner.policyLink")}
      className="fixed inset-x-0 z-50 border-t border-(--color-border) bg-(--color-surface) px-4 py-4 sm:px-6"
      style={{
        // Encima del menú inferior del panel cuando existe (BottomNav.tsx
        // fija --bottom-nav-space al montar), para no taparlo ni que te tape
        // a ti; en el resto de páginas esa variable vale 0 y se pega abajo.
        bottom: "var(--bottom-nav-space, 0px)",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        <p className="text-sm text-(--color-ink)">
          {t("cookiesBanner.message")}{" "}
          <Link href="/cookies" className="text-(--color-brass) hover:underline">
            {t("cookiesBanner.policyLink")}
          </Link>
        </p>

        {configurando && (
          <div className="flex flex-col gap-2 rounded-sm border border-(--color-border) bg-(--color-paper) p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-(--color-ink)">
                  {t("cookiesBanner.necessary")}
                </p>
                <p className="text-xs text-(--color-ink-muted)">
                  {t("cookiesBanner.necessaryDesc")}
                </p>
              </div>
              <input type="checkbox" checked disabled aria-label={t("cookiesBanner.necessary")} />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-(--color-ink)">
                  {t("cookiesBanner.preferences")}
                </p>
                <p className="text-xs text-(--color-ink-muted)">
                  {t("cookiesBanner.preferencesDesc")}
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferencias}
                onChange={(e) => setPreferencias(e.target.checked)}
                aria-label={t("cookiesBanner.preferences")}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {configurando ? (
            <button
              type="button"
              onClick={() => decidir(preferencias)}
              className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
            >
              {t("cookiesBanner.save")}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => decidir(true)}
                className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
              >
                {t("cookiesBanner.acceptAll")}
              </button>
              <button
                type="button"
                onClick={() => decidir(false)}
                className="rounded-sm border border-(--color-border-strong) px-4 py-2 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
              >
                {t("cookiesBanner.reject")}
              </button>
              <button
                type="button"
                onClick={() => setConfigurando(true)}
                className="rounded-sm px-4 py-2 text-sm font-medium text-(--color-ink-muted) hover:text-(--color-brass)"
              >
                {t("cookiesBanner.configure")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
