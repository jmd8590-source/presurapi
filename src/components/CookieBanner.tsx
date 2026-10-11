"use client";

import Link from "next/link";
import { usePrefs } from "./PrefsProvider";

export function CookieBanner() {
  const { t, consent, setConsent } = usePrefs();
  if (consent !== null) return null;
  return (
    <div className="cookie-banner rise" role="region" aria-labelledby="cookie-title">
      <h2 id="cookie-title" style={{ fontSize: "1.1rem" }}>{t("cookies.title")}</h2>
      <p>
        {t("cookies.text")}{" "}
        <Link href="/cookies">{t("cookies.more")}</Link>
      </p>
      <div className="row">
        <button type="button" className="btn btn-primary" onClick={() => setConsent("all")}>{t("cookies.accept")}</button>
        <button type="button" className="btn btn-secondary" onClick={() => setConsent("necessary")}>{t("cookies.reject")}</button>
      </div>
    </div>
  );
}
