"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { CONSENT_COOKIE } from "@/lib/cookies/consent";

const FILAS = [
  {
    nombre: "presurapi_session",
    tipoEs: "Necesaria",
    tipoEn: "Necessary",
    finEs: "Mantiene tu sesión iniciada (autenticación con Appwrite).",
    finEn: "Keeps you signed in (Appwrite authentication).",
    duracion: "Hasta que cierres sesión o caduque / Until you sign out or it expires",
  },
  {
    nombre: "presurapi_cookie_consent",
    tipoEs: "Necesaria",
    tipoEn: "Necessary",
    finEs: "Recuerda tu elección sobre cookies.",
    finEn: "Remembers your cookie choice.",
    duracion: "1 año / 1 year",
  },
  {
    nombre: "presurapi_theme",
    tipoEs: "Preferencia",
    tipoEn: "Preference",
    finEs: "Recuerda el modo claro/oscuro elegido.",
    finEn: "Remembers your chosen light/dark mode.",
    duracion: "1 año / 1 year",
  },
  {
    nombre: "presurapi_locale",
    tipoEs: "Preferencia",
    tipoEn: "Preference",
    finEs: "Recuerda el idioma elegido.",
    finEn: "Remembers your chosen language.",
    duracion: "1 año / 1 year",
  },
];

export default function CookiesPageContent() {
  const { locale } = useLocale();
  const es = locale !== "en";

  function reabrirPreferencias() {
    document.cookie = `${CONSENT_COOKIE}=; path=/; max-age=0`;
    window.location.reload();
  }

  return (
    <main id="main-content" className="mx-auto max-w-2xl flex-1 px-4 py-14 sm:px-6">
      <Link href="/" className="text-sm text-(--color-brass) hover:underline">
        ← {es ? "Volver al inicio" : "Back to home"}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-(--color-ink)">
        {es ? "Política de cookies" : "Cookie policy"}
      </h1>
      <p className="mt-1 text-xs text-(--color-ink-faint)">
        {es ? "Última actualización: 17 de noviembre de 2026" : "Last updated: 17 November 2026"}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-(--color-ink-muted)">
        {es
          ? "No usamos cookies de analítica ni de publicidad. Estas son todas las cookies que usa Presurapi:"
          : "We don't use analytics or advertising cookies. These are every cookie Presurapi uses:"}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-(--color-border) text-xs text-(--color-ink-faint) uppercase">
              <th className="py-2 pr-3 font-medium">{es ? "Cookie" : "Cookie"}</th>
              <th className="py-2 pr-3 font-medium">{es ? "Tipo" : "Type"}</th>
              <th className="py-2 pr-3 font-medium">{es ? "Finalidad" : "Purpose"}</th>
              <th className="py-2 font-medium">{es ? "Duración" : "Duration"}</th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map((fila) => (
              <tr key={fila.nombre} className="border-b border-(--color-border) align-top">
                <td className="py-2 pr-3 font-mono-nums text-(--color-ink)">{fila.nombre}</td>
                <td className="py-2 pr-3 text-(--color-ink-muted)">
                  {es ? fila.tipoEs : fila.tipoEn}
                </td>
                <td className="py-2 pr-3 text-(--color-ink-muted)">
                  {es ? fila.finEs : fila.finEn}
                </td>
                <td className="py-2 text-(--color-ink-muted)">{fila.duracion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-(--color-ink-muted)">
        {es
          ? "También puedes bloquear o borrar las cookies desde los ajustes de tu navegador en cualquier momento; ten en cuenta que bloquear la cookie necesaria de sesión impedirá que puedas iniciar sesión."
          : "You can also block or delete cookies from your browser settings at any time; note that blocking the necessary session cookie will prevent you from signing in."}
      </p>

      <button
        type="button"
        onClick={reabrirPreferencias}
        className="mt-6 rounded-sm border border-(--color-border-strong) px-4 py-2.5 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
      >
        {es ? "Cambiar mis preferencias de cookies" : "Change my cookie preferences"}
      </button>
    </main>
  );
}
