import type es from "./es";

type Dictionary = typeof es;

type Join<K extends string, P extends string> = P extends "" ? K : `${K}.${P}`;

type Paths<T> = T extends string
  ? ""
  : {
      [K in keyof T & string]: Join<K, Paths<T[K]>>;
    }[keyof T & string];

export type TranslationKey = Paths<Dictionary>;

export function resolvePath(dict: Dictionary, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, segment) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[segment] : undefined,
      dict,
    );
  return typeof value === "string" ? value : path;
}
