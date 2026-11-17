"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useDemoStore } from "@/lib/demo/store";

const inputClase =
  "rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-brass)";

const estadoLabelKey = {
  borrador: "presupuestos.statusBorrador",
  enviado: "presupuestos.statusEnviado",
  aceptado: "presupuestos.statusAceptado",
  rechazado: "presupuestos.statusRechazado",
} as const;

export default function PresupuestosPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { db, listo, crearPresupuesto } = useDemoStore();
  const [obraSeleccionada, setObraSeleccionada] = useState("");

  if (!listo) return null;

  const obrasActivas = db.obras.filter((o) => o.estado === "activa");
  const nombreObra = (id: string) => db.obras.find((o) => o.id === id)?.nombre ?? "—";

  function onCrear(e: React.FormEvent) {
    e.preventDefault();
    if (!obraSeleccionada) return;
    const presupuesto = crearPresupuesto(obraSeleccionada);
    router.push(`/panel/presupuestos/${presupuesto.id}`);
  }

  const presupuestos = [...db.presupuestos].sort((a, b) => b.numero - a.numero);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">
        {t("presupuestos.title")}
      </h1>

      {obrasActivas.length === 0 ? (
        <p className="mt-2 text-sm text-(--color-ink-muted)">
          {t("presupuestos.needsObraFirst")}{" "}
          <Link href="/panel/obras" className="text-(--color-brass) hover:underline">
            {t("obras.add")}
          </Link>
        </p>
      ) : (
        <form onSubmit={onCrear} className="mt-4 flex flex-wrap items-center gap-2">
          <select
            required
            className={inputClase}
            value={obraSeleccionada}
            onChange={(e) => setObraSeleccionada(e.target.value)}
          >
            <option value="" disabled>
              {t("obras.title")}
            </option>
            {obrasActivas.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
          >
            {t("presupuestos.add")}
          </button>
        </form>
      )}

      <ul className="mt-6 flex flex-col gap-2">
        {presupuestos.length === 0 && (
          <p className="text-sm text-(--color-ink-muted)">{t("presupuestos.empty")}</p>
        )}
        {presupuestos.map((p) => (
          <li key={p.id}>
            <Link
              href={`/panel/presupuestos/${p.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-(--color-border) bg-(--color-surface) px-4 py-3 transition-colors hover:border-(--color-brass)"
            >
              <div>
                <p className="text-sm font-medium text-(--color-ink)">
                  {t("presupuestos.number")} {p.numero} · {nombreObra(p.obra_id)}
                </p>
                <p className="text-xs text-(--color-ink-muted)">{t(estadoLabelKey[p.estado])}</p>
              </div>
              <span className="font-mono-nums text-sm font-semibold text-(--color-brass)">
                {p.total.toFixed(2)} €
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
