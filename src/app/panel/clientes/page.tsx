"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAppwriteStore } from "@/lib/appwrite/store";
import Campo from "@/components/ui/Campo";

const inputClase =
  "rounded-sm border border-(--color-border-strong) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-brass)";

export default function ClientesPage() {
  const { t } = useLocale();
  const { db, listo, crearCliente, cambiarEstadoCliente } = useAppwriteStore();
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    nif: "",
    email: "",
    telefono: "",
    direccion: "",
    notas: "",
  });

  if (!listo) return null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    crearCliente(form);
    setForm({ nombre: "", nif: "", email: "", telefono: "", direccion: "", notas: "" });
    setAbierto(false);
  }

  const clientes = [...db.clientes].sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-(--color-ink)">
          {t("clientes.title")}
        </h1>
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
        >
          {t("clientes.add")}
        </button>
      </div>

      {abierto && (
        <form
          onSubmit={onSubmit}
          className="mt-4 flex flex-col gap-3 rounded-sm border border-(--color-border) bg-(--color-surface) p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label={t("clientes.name")}>
              <input
                required
                className={inputClase}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </Campo>
            <Campo label={t("clientes.taxId")}>
              <input
                className={inputClase}
                value={form.nif}
                onChange={(e) => setForm({ ...form, nif: e.target.value })}
              />
            </Campo>
            <Campo label={t("clientes.email")}>
              <input
                type="email"
                className={inputClase}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Campo>
            <Campo label={t("clientes.phone")}>
              <input
                className={inputClase}
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </Campo>
            <div className="sm:col-span-2">
              <Campo label={t("clientes.address")}>
                <input
                  className={inputClase}
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                />
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <Campo label={t("clientes.notes")}>
                <textarea
                  rows={2}
                  className={inputClase}
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                />
              </Campo>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-sm bg-(--color-brass) px-4 py-2 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
            >
              {t("clientes.save")}
            </button>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="rounded-sm border border-(--color-border-strong) px-4 py-2 text-sm font-medium text-(--color-ink)"
            >
              {t("clientes.cancel")}
            </button>
          </div>
        </form>
      )}

      <ul className="mt-6 flex flex-col gap-2">
        {clientes.length === 0 && (
          <p className="text-sm text-(--color-ink-muted)">{t("clientes.empty")}</p>
        )}
        {clientes.map((cliente) => (
          <li
            key={cliente.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-(--color-border) bg-(--color-surface) px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-(--color-ink)">
                {cliente.nombre}
                {cliente.estado === "archivado" && (
                  <span className="ml-2 text-xs text-(--color-ink-faint)">
                    ({t("clientes.archived")})
                  </span>
                )}
              </p>
              <p className="text-xs text-(--color-ink-muted)">
                {[cliente.email, cliente.telefono].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                cambiarEstadoCliente(
                  cliente.id,
                  cliente.estado === "activo" ? "archivado" : "activo",
                )
              }
              className="text-xs font-medium text-(--color-ink-muted) hover:text-(--color-brass)"
            >
              {cliente.estado === "activo" ? t("clientes.archive") : t("clientes.unarchive")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
