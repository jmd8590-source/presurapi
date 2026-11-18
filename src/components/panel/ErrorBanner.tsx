"use client";

// Aviso visible cuando una lectura o escritura contra Appwrite falla: el
// store ya revierte el cambio optimista en memoria, esto solo informa al
// usuario en vez de fallar en silencio.
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAppwriteStore } from "@/lib/appwrite/store";

export default function ErrorBanner() {
  const { t } = useLocale();
  const { error, limpiarError } = useAppwriteStore();

  if (!error) return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 border-b border-(--color-danger) bg-(--color-surface) px-4 py-2 text-sm text-(--color-danger) sm:px-6"
    >
      <span>{t(error === "load" ? "panel.errorLoad" : "panel.errorSave")}</span>
      <button
        type="button"
        onClick={limpiarError}
        aria-label={t("panel.dismiss")}
        className="shrink-0 text-xs font-medium underline hover:no-underline"
      >
        {t("panel.dismiss")}
      </button>
    </div>
  );
}
