import "server-only";
import { cookies, headers } from "next/headers";
import { LANG_COOKIE, isLang, langFromHeader, translate, type Key, type Lang } from "./index";

export async function getLang(): Promise<Lang> {
  const stored = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(stored)) return stored;
  return langFromHeader((await headers()).get("accept-language"));
}

/** Traductor para componentes de servidor. */
export async function getT() {
  const lang = await getLang();
  return {
    lang,
    t: (key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars),
  };
}
