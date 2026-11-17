// Consentimiento de cookies (RGPD): "necesarias" siempre activas (sesión de
// demo, tema, idioma, el propio consentimiento). Ninguna cookie de
// analítica/marketing existe todavía en la app, así que no se ofrece esa
// categoría — no tiene sentido pedir consentimiento para algo que no se usa.
// Si en el futuro se añade analítica, se declara aquí como una categoría más.
export const CONSENT_COOKIE = "presurapi_cookie_consent";

export type ConsentoPreferencias = boolean;
export type Consentimiento = { preferencias: ConsentoPreferencias } | null;

export function leerConsentimientoDesdeCookieString(cookieString: string): Consentimiento {
  const match = cookieString.match(/(?:^|; )presurapi_cookie_consent=([^;]*)/);
  if (!match) return null;
  try {
    const valor = JSON.parse(decodeURIComponent(match[1]));
    if (typeof valor?.preferencias === "boolean") return { preferencias: valor.preferencias };
  } catch {
    // cookie corrupta o de un formato antiguo: se trata como "sin decidir"
  }
  return null;
}

export function leerConsentimiento(): Consentimiento {
  if (typeof document === "undefined") return null;
  return leerConsentimientoDesdeCookieString(document.cookie);
}

export function guardarConsentimiento(preferencias: ConsentoPreferencias) {
  if (typeof document === "undefined") return;
  const valor = encodeURIComponent(JSON.stringify({ preferencias }));
  document.cookie = `${CONSENT_COOKIE}=${valor}; path=/; max-age=31536000; samesite=lax`;
}

export function tienePermisoDePreferencias(): boolean {
  return leerConsentimiento()?.preferencias === true;
}
