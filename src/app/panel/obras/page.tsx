"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAppwriteStore } from "@/lib/appwrite/store";
import Campo from "@/components/ui/Campo";

const inputClase =
  "rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-brass)";

export default function ObrasPage() {
  const { t } = useLocale();
  const { db, listo, crearObra, cambiarEstadoObra } = useAppwriteStore();
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState<{
    cliente_id: string;
    nombre: string;
    direccion: string;
    descripcion: string;
    tipo_obra: "nueva" | "reforma";
  }>({ cliente_id: "", nombre: "", direccion: "", descripcion: "", tipo_obra: "nueva" });

  if (!listo) return null;

  const clientesActivos = db.clientes.filter((c) => c.estado === "activo");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.cliente_id) return;
    crearObra(form);
    setForm({ cliente_id: "", nombre: "", direccion: "", descripcion: "", tipo_obra: "nueva" });
    setAbierto(false);
  }

  const obras = [...db.obras].sort((a, b) => a.nombre.localeCompare(b.nombre));
  const nombreCliente = (id: string) => db.clientes.find((c) => c.id === id)?.nombre ?? "—";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-(--color-ink)">
          {t("obras.title")}
        </h1>
        <button
          type="button"
          disabled={clientesActivos.length === 0}
          onClick={() => setAbierto((v) => !v)}
          className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover) disabled:opacity-50"
        >
          {t("obras.add")}
        </button>
      </div>

      {clientesActivos.length === 0 && (
        <p className="mt-2 text-sm text-(--color-ink-muted)">
          {t("obras.needsClientFirst")}{" "}
          <Link href="/panel/clientes" className="text-(--color-brass) hover:underline">
            {t("clientes.add")}
          </Link>
        </p>
      )}

      {abierto && (
        <form
          onSubmit={onSubmit}
          className="mt-4 flex flex-col gap-3 rounded-sm border border-(--color-border) bg-(--color-surface) p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label={t("obras.client")}>
              <select
                required
                className={inputClase}
                value={form.cliente_id}
                onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
              >
                <option value="" disabled>
                  {t("obras.client")}
                </option>
                {clientesActivos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label={t("obras.name")}>
              <input
                required
                className={inputClase}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </Campo>
            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-medium text-(--color-ink)">{t("obras.type")}</legend>
              <div className="mt-1.5 flex gap-4">
                <label className="flex items-center gap-1.5 text-sm text-(--color-ink)">
                  <input
                    type="radio"
                    name="tipo_obra"
                    value="nueva"
                    checked={form.tipo_obra === "nueva"}
                    onChange={() => setForm({ ...form, tipo_obra: "nueva" })}
                  />
                  {t("obras.typeNew")}
                </label>
                <label className="flex items-center gap-1.5 text-sm text-(--color-ink)">
                  <input
                    type="radio"
                    name="tipo_obra"
                    value="reforma"
                    checked={form.tipo_obra === "reforma"}
                    onChange={() => setForm({ ...form, tipo_obra: "reforma" })}
                  />
                  {t("obras.typeRenovation")}
                </label>
              </div>
            </fieldset>
            <div className="sm:col-span-2">
              <Campo label={t("obras.address")}>
                <input
                  className={inputClase}
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                />
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <Campo label={t("obras.description")}>
                <textarea
                  rows={2}
                  className={inputClase}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </Campo>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
            >
              {t("obras.save")}
            </button>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="rounded-sm border border-(--color-border-strong) px-4 py-2 text-sm font-medium text-(--color-ink)"
            >
              {t("obras.cancel")}
            </button>
          </div>
        </form>
      )}

      <ul className="mt-6 flex flex-col gap-2">
        {obras.length === 0 && <p className="text-sm text-(--color-ink-muted)">{t("obras.empty")}</p>}
        {obras.map((obra) => (
          <li
            key={obra.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-(--color-border) bg-(--color-surface) px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-(--color-ink)">
                {obra.nombre}
                <span
                  className="ml-2 rounded-[2px] px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase"
                  style={{
                    background: "var(--color-paper)",
                    color: "var(--color-ink-muted)",
                    border: "1px solid var(--color-border-strong)",
                  }}
                >
                  {obra.tipo_obra === "reforma" ? t("obras.typeRenovation") : t("obras.typeNew")}
                </span>
                {obra.estado === "archivada" && (
                  <span className="ml-2 text-xs text-(--color-ink-faint)">
                    ({t("obras.archived")})
                  </span>
                )}
              </p>
              <p className="text-xs text-(--color-ink-muted)">
                {nombreCliente(obra.cliente_id)}
                {obra.direccion ? ` · ${obra.direccion}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                cambiarEstadoObra(obra.id, obra.estado === "activa" ? "archivada" : "activa")
              }
              className="text-xs font-medium text-(--color-ink-muted) hover:text-(--color-brass)"
            >
              {obra.estado === "activa" ? t("obras.archive") : t("obras.unarchive")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
