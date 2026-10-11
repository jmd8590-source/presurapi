"use client";

import type { Key } from "@/lib/i18n";
import { useT } from "./PrefsProvider";

/** Texto traducido. Se usa también en páginas de servidor para que el idioma cambie al instante. */
export function T({ k, vars }: { k: Key; vars?: Record<string, string | number> }) {
  const { t } = useT();
  return <>{t(k, vars)}</>;
}
