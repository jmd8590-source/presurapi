"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useT } from "@/components/PrefsProvider";
import {
  duplicarPresupuestoAccion,
  eliminarPresupuestoAccion,
  cambiarEstadoPresupuestoAccion,
} from "@/app/acciones/presupuestos";
import { enviarPresupuestoAccion, enlacePresupuestoAccion } from "@/app/acciones/envio";
import { formatearEuros } from "@/lib/calculo";
import { IconPlus, IconUser, IconPin, IconSend } from "@/components/Icons";
import { PresupuestoDropdown } from "./PresupuestoDropdown";
import type { EstadoPresupuesto } from "@/db/schema";

interface PresupuestoListItem {
  id: string;
  codigo: string;
  titulo: string;
  estado: string;
  fechaEmision: Date;
  validezDias: number;
  clienteId: string;
  clienteNombre: string;
  obraId: string | null;
  obraNombre: string | null;
  tokenPublico: string;
  totalCents: number;
}

export function PresupuestosListView({
  presupuestos,
}: {
  presupuestos: PresupuestoListItem[];
}) {
  const { t } = useT();
  const [isPending, startTransition] = useTransition();
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const enviar = (id: string) => {
    setAviso(null);
    startTransition(async () => {
      const res = await enviarPresupuestoAccion(id);
      if (res.ok) {
        setAviso({ ok: true, texto: t("send.sent", { email: res.email }) });
      } else {
        const mapa = { no_encontrado: "send.err.notFound", sin_email: "send.err.noEmail", limite: "send.err.limit", fallo: "send.err.fail" } as const;
        setAviso({ ok: false, texto: t(mapa[res.error]) });
      }
    });
  };

  const copiarEnlace = (id: string) => {
    setAviso(null);
    startTransition(async () => {
      const res = await enlacePresupuestoAccion(id);
      if (res.ok) {
        try {
          await navigator.clipboard.writeText(res.enlace);
          setAviso({ ok: true, texto: t("send.linkCopied") });
        } catch {
          window.prompt(t("send.copyLink"), res.enlace);
        }
      } else {
        setAviso({ ok: false, texto: t("send.err.notFound") });
      }
    });
  };

  const duplicar = (id: string) => {
    startTransition(async () => {
      const res = await duplicarPresupuestoAccion(id);
      if (!res.ok) alert(res.error || t("common.error"));
    });
  };

  const eliminar = (id: string) => {
    if (!confirm(t("common.confirmDelete"))) return;
    startTransition(async () => {
      const res = await eliminarPresupuestoAccion(id);
      if (!res.ok) alert(res.error || t("common.error"));
    });
  };

  const cambiarEstado = (id: string, nuevo: EstadoPresupuesto) => {
    startTransition(async () => {
      await cambiarEstadoPresupuestoAccion(id, nuevo);
    });
  };

  const filtrados = presupuestos.filter((p) => {
    const coincideEstado =
      filtroEstado === "todos" || p.estado === filtroEstado;
    const coincideTexto =
      !busqueda.trim() ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideTexto;
  });

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case "aceptado":
        return "badge-success";
      case "enviado":
        return "badge-info";
      case "rechazado":
        return "badge-error";
      case "facturado":
        return "badge-success";
      default:
        return "badge-warning";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 style={{ margin: 0 }}>{t("quotes.title")}</h1>
          <p className="muted" style={{ margin: "4px 0 0 0" }}>
            Crea, envía y gestiona presupuestos para tus clientes.
          </p>
        </div>
        <Link href="/panel/presupuestos/nuevo" className="btn btn-primary">
          <IconPlus />
          <span>{t("quotes.new")}</span>
        </Link>
      </div>

      {aviso && (
        <div className={`aviso ${aviso.ok ? "aviso-ok" : "aviso-error"} mb-6`} role="status" aria-live="polite">
          {aviso.texto}
        </div>
      )}

      {/* Filtros */}
      <div className="card mb-6" style={{ padding: 16 }}>
        <div className="flex gap-4 flex-wrap items-center">
          <div style={{ flex: 1, minWidth: 260 }}>
            <input
              type="search"
              className="input"
              placeholder={t("common.search")}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <select
              className="input"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">{t("quotes.status.all")}</option>
              <option value="borrador">{t("quotes.status.draft")}</option>
              <option value="enviado">{t("quotes.status.sent")}</option>
              <option value="aceptado">{t("quotes.status.accepted")}</option>
              <option value="rechazado">{t("quotes.status.rejected")}</option>
              <option value="facturado">{t("quotes.status.invoiced")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="card text-center" style={{ padding: "48px 24px" }}>
          <h2 style={{ fontSize: "1.25rem", margin: "0 0 8px 0" }}>{t("quotes.empty")}</h2>
          <p className="muted" style={{ maxWidth: 500, margin: "0 auto 24px auto" }}>
            {t("quotes.emptyText")}
          </p>
          <Link href="/panel/presupuestos/nuevo" className="btn btn-primary">
            <IconPlus />
            <span>{t("quotes.new")}</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtrados.map((p) => {
            const fechaStr = new Date(p.fechaEmision).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <div key={p.id} className="card p-4 flex items-center justify-between gap-4 flex-wrap">
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge" style={{ fontWeight: 700 }}>{p.codigo}</span>
                    <span className={`badge ${getBadgeClass(p.estado)}`}>
                      {p.estado.toUpperCase()}
                    </span>
                    <span className="muted" style={{ fontSize: "0.8rem" }}>
                      {fechaStr}
                    </span>
                  </div>

                  <h3 style={{ margin: "4px 0 2px 0", fontSize: "1.1rem" }}>
                    <Link href={`/panel/presupuestos/${p.id}`} className="hover:underline">
                      {p.titulo}
                    </Link>
                  </h3>

                  <div className="flex gap-4 text-sm muted flex-wrap mt-1">
                    <span className="inline-icon"><IconUser /> {p.clienteNombre}</span>
                    {p.obraNombre && <span className="inline-icon"><IconPin /> {p.obraNombre}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div style={{ textAlign: "right", minWidth: 120 }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{t("quotes.total")}</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                      {formatearEuros(p.totalCents)}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: "7px 14px", fontSize: "0.85rem" }}
                      onClick={() => enviar(p.id)}
                      disabled={isPending}
                    >
                      <IconSend />
                      <span>{t("send.email")}</span>
                    </button>

                    <Link
                      href={`/panel/presupuestos/${p.id}`}
                      className="btn btn-outline"
                      style={{ padding: "7px 14px", fontSize: "0.85rem" }}
                    >
                      {t("common.edit")}
                    </Link>

                    <PresupuestoDropdown
                      id={p.id}
                      onCopiarEnlace={() => copiarEnlace(p.id)}
                      onDuplicar={() => duplicar(p.id)}
                      onEliminar={() => eliminar(p.id)}
                      isPending={isPending}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
