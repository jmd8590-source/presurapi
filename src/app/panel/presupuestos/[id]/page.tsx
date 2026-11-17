"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useDemoStore } from "@/lib/demo/store";
import { TRABAJOS } from "@/lib/demo/catalog";
import type { EstadoPresupuesto } from "@/lib/demo/types";

const inputClase =
  "rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-brass)";

const estadoLabelKey: Record<EstadoPresupuesto, "presupuestos.statusBorrador" | "presupuestos.statusEnviado" | "presupuestos.statusAceptado" | "presupuestos.statusRechazado"> = {
  borrador: "presupuestos.statusBorrador",
  enviado: "presupuestos.statusEnviado",
  aceptado: "presupuestos.statusAceptado",
  rechazado: "presupuestos.statusRechazado",
};

function NuevaPartida({ capituloId }: { capituloId: string }) {
  const { t } = useLocale();
  const { agregarPartidaDesdeTrabajo } = useDemoStore();
  const [trabajoSlug, setTrabajoSlug] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [medicion, setMedicion] = useState("");

  const trabajo = TRABAJOS.find((t) => t.slug === trabajoSlug);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valor = Number(medicion);
    if (!trabajoSlug || !valor || valor <= 0) return;
    agregarPartidaDesdeTrabajo(
      capituloId,
      trabajoSlug,
      descripcion.trim() || (trabajo?.nombre ?? ""),
      valor,
    );
    setTrabajoSlug("");
    setDescripcion("");
    setMedicion("");
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-(--color-ink-muted)">{t("presupuestos.chooseJob")}</label>
        <select
          required
          className={`${inputClase} min-w-[220px]`}
          value={trabajoSlug}
          onChange={(e) => {
            setTrabajoSlug(e.target.value);
            const t = TRABAJOS.find((x) => x.slug === e.target.value);
            if (t) setDescripcion(t.nombre);
          }}
        >
          <option value="" disabled>
            {t("presupuestos.chooseJob")}
          </option>
          {TRABAJOS.map((trabajo) => (
            <option key={trabajo.slug} value={trabajo.slug}>
              {trabajo.nombre} ({trabajo.unidad})
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-(--color-ink-muted)">{t("presupuestos.description")}</label>
        <input
          className={inputClase}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-(--color-ink-muted)">
          {t("presupuestos.measurement")} {trabajo ? `(${trabajo.unidad})` : ""}
        </label>
        <input
          required
          type="number"
          min={0.01}
          step="0.01"
          className={`${inputClase} w-28`}
          value={medicion}
          onChange={(e) => setMedicion(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="rounded-sm bg-(--color-brass) px-4 py-2.5 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
      >
        {t("presupuestos.addLineConfirm")}
      </button>
    </form>
  );
}

export default function PresupuestoPage() {
  const params = useParams<{ id: string }>();
  const { t } = useLocale();
  const {
    db,
    listo,
    crearCapitulo,
    eliminarCapitulo,
    eliminarPartida,
    cambiarEstadoPresupuesto,
    actualizarNotasPresupuesto,
  } = useDemoStore();
  const [nuevoCapitulo, setNuevoCapitulo] = useState("");

  if (!listo) return null;

  const presupuesto = db.presupuestos.find((p) => p.id === params.id);
  if (!presupuesto) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/panel/presupuestos" className="text-sm text-(--color-brass) hover:underline">
          {t("presupuestos.back")}
        </Link>
      </div>
    );
  }

  const obra = db.obras.find((o) => o.id === presupuesto.obra_id);
  const cliente = obra ? db.clientes.find((c) => c.id === obra.cliente_id) : undefined;
  const capitulos = db.capitulos
    .filter((c) => c.presupuesto_id === presupuesto.id)
    .sort((a, b) => a.posicion - b.posicion);

  function onCrearCapitulo(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoCapitulo.trim()) return;
    crearCapitulo(presupuesto!.id, nuevoCapitulo.trim());
    setNuevoCapitulo("");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/panel/presupuestos" className="text-sm text-(--color-brass) hover:underline">
        ← {t("presupuestos.back")}
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-(--color-ink)">
            {t("presupuestos.number")} {presupuesto.numero} · {obra?.nombre}
          </h1>
          <p className="text-sm text-(--color-ink-muted)">{cliente?.nombre}</p>
        </div>
        <select
          className={inputClase}
          value={presupuesto.estado}
          onChange={(e) =>
            cambiarEstadoPresupuesto(presupuesto.id, e.target.value as EstadoPresupuesto)
          }
        >
          {(Object.keys(estadoLabelKey) as EstadoPresupuesto[]).map((estado) => (
            <option key={estado} value={estado}>
              {t(estadoLabelKey[estado])}
            </option>
          ))}
        </select>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-ink-muted) uppercase">
          {t("presupuestos.chapters")}
        </h2>

        <div className="mt-3 flex flex-col gap-4">
          {capitulos.map((capitulo) => {
            const partidas = db.partidas
              .filter((p) => p.capitulo_id === capitulo.id)
              .sort((a, b) => a.posicion - b.posicion);

            return (
              <div
                key={capitulo.id}
                className="rounded-sm border border-(--color-border) bg-(--color-surface) p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg italic font-semibold text-(--color-ink)">
                    {capitulo.nombre}
                  </h3>
                  <button
                    type="button"
                    onClick={() => eliminarCapitulo(capitulo.id)}
                    className="text-xs font-medium text-(--color-ink-muted) hover:text-(--color-danger)"
                  >
                    {t("presupuestos.removeChapter")}
                  </button>
                </div>

                {partidas.length === 0 ? (
                  <p className="mt-2 text-sm text-(--color-ink-muted)">{t("presupuestos.noLines")}</p>
                ) : (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-(--color-border) text-left text-xs text-(--color-ink-faint) uppercase">
                          <th className="py-1.5 pr-2 font-medium">{t("presupuestos.description")}</th>
                          <th className="py-1.5 pr-2 text-right font-medium">
                            {t("presupuestos.measurement")}
                          </th>
                          <th className="py-1.5 pr-2 text-right font-medium">
                            {t("presupuestos.unitPrice")}
                          </th>
                          <th className="py-1.5 pr-2 text-right font-medium">
                            {t("presupuestos.amount")}
                          </th>
                          <th className="py-1.5" />
                        </tr>
                      </thead>
                      <tbody>
                        {partidas.map((partida) => (
                          <tr key={partida.id} className="border-b border-(--color-border)">
                            <td className="py-2 pr-2 text-(--color-ink)">{partida.descripcion}</td>
                            <td className="py-2 pr-2 text-right font-mono-nums text-(--color-ink)">
                              {partida.medicion} {partida.unidad}
                            </td>
                            <td className="py-2 pr-2 text-right font-mono-nums text-(--color-ink)">
                              {partida.precio_unitario.toFixed(2)} €
                            </td>
                            <td className="py-2 pr-2 text-right font-mono-nums font-semibold text-(--color-ink)">
                              {partida.importe.toFixed(2)} €
                            </td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => eliminarPartida(partida.id)}
                                className="text-xs font-medium text-(--color-ink-muted) hover:text-(--color-danger)"
                              >
                                {t("presupuestos.removeLine")}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <NuevaPartida capituloId={capitulo.id} />
              </div>
            );
          })}
        </div>

        <form onSubmit={onCrearCapitulo} className="mt-4 flex items-center gap-2">
          <input
            placeholder={t("presupuestos.chapterName")}
            className={inputClase}
            value={nuevoCapitulo}
            onChange={(e) => setNuevoCapitulo(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-sm border border-(--color-border-strong) px-4 py-2.5 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
          >
            {t("presupuestos.addChapter")}
          </button>
        </form>
      </section>

      <section className="mt-10 rounded-sm border border-(--color-border) bg-(--color-surface) p-5">
        <h2 className="text-sm font-semibold tracking-wide text-(--color-ink-muted) uppercase">
          {t("presupuestos.summary")}
        </h2>
        <dl className="mt-3 flex flex-col gap-1.5 text-sm">
          {[
            [t("presupuestos.subtotalMaterials"), presupuesto.subtotal_materiales],
            [t("presupuestos.subtotalLabor"), presupuesto.subtotal_mano_obra],
            [
              `${t("presupuestos.overheads")} (${presupuesto.gastos_generales_pct}%)`,
              presupuesto.gastos_generales_importe,
            ],
            [
              `${t("presupuestos.profit")} (${presupuesto.beneficio_industrial_pct}%)`,
              presupuesto.beneficio_industrial_importe,
            ],
            [t("presupuestos.base"), presupuesto.base_imponible],
            [`${t("presupuestos.vat")} (${presupuesto.iva_pct}%)`, presupuesto.iva_importe],
          ].map(([label, valor]) => (
            <div key={label as string} className="flex justify-between text-(--color-ink-muted)">
              <dt>{label}</dt>
              <dd className="font-mono-nums">{(valor as number).toFixed(2)} €</dd>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-(--color-border) pt-2 text-base font-semibold text-(--color-brass)">
            <dt>{t("presupuestos.total")}</dt>
            <dd className="font-mono-nums">{presupuesto.total.toFixed(2)} €</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6">
        <label htmlFor="notas" className="text-sm font-medium text-(--color-ink)">
          {t("presupuestos.notes")}
        </label>
        <textarea
          id="notas"
          rows={3}
          className={`${inputClase} mt-1.5 w-full`}
          value={presupuesto.notas}
          onChange={(e) => actualizarNotasPresupuesto(presupuesto.id, e.target.value)}
        />
      </section>
    </div>
  );
}
