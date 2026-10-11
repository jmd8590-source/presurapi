import { es, type Key } from "./es";
import { en } from "./en";

export type Lang = "es" | "en";
export const LANGS: Lang[] = ["es", "en"];
export const DEFAULT_LANG: Lang = "es";
export const LANG_COOKIE = "pr_lang";

export const dictionaries: Record<Lang, Record<Key, string>> = { es, en };
export type { Key };

export function isLang(value: unknown): value is Lang {
  return value === "es" || value === "en";
}

/** Traduce una clave y sustituye variables {nombre}. */
export function translate(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let text: string = dictionaries[lang][key] ?? dictionaries[DEFAULT_LANG][key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

/** Elige idioma a partir de la cabecera Accept-Language (por defecto, español). */
export function langFromHeader(header: string | null | undefined): Lang {
  if (!header) return DEFAULT_LANG;
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("en") ? "en" : DEFAULT_LANG;
}
