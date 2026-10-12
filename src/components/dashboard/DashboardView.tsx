"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useT } from "@/components/PrefsProvider";
import { formatearEuros } from "@/lib/calculo";
import {
  IconPlus,
  IconDatabase,
  IconUsers,
  IconHammer,
  IconFileText,
  IconSend,
  IconCheck,
  IconBolt,
  IconPin,
  IconUser,
} from "@/components/Icons";
import { enviarRecordatorioPresupuestoAccion } from "@/app/acciones/seguimiento";
import type { AlertaSeguimiento } from "@/lib/data";

interface PresupuestoReciente {
  id: string;
  codigo: string;
  titulo: string;
  estado: string;
  fechaEmision: Date;
  clienteNombre: string;
  obraNombre: string | null;
  totalCents: number;
}

interface DashboardData {
  usuarioNombre: string;
  empresaNombre: string;
  clientes: number;
  obras: number;
  obrasEnCurso: number;
  presupuestosTotal: number;
  presupuestosBorrador: number;
  presupuestosEnviado: number;
  presupuestosAceptado: number;
  presupuestosRechazado: number;
  totalAceptadoCents: number;
  totalEnviadoCents: number;
  tasaConversion: number;
  recientes: PresupuestoReciente[];
  alertas: AlertaSeguimiento[];
}

export function DashboardView({ data }: { data: DashboardData }) {
  const { t } = useT();
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [alertasLocales, setAlertasLocales] = useState<AlertaSeguimiento[]>(data.alertas);

  const enviarRecordatorio = (alerta: AlertaSeguimiento) => {
    setMensaje(null);
    startTransition(async () => {
      const res = await enviarRecordatorioPresupuestoAccion(alerta.presupuestoId);
      if (res.ok) {
        setMensaje({ ok: true, texto: t("home.followup.reminderSent", { email: res.email }) });
        // Quitar alerta de la lista tras enviar
        setAlertasLocales((prev) => prev.filter((a) => a.id !== alerta.id));
      } else {
        setMensaje({ ok: false, texto: t("send.err.fail") });
      }
    });
  };

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
    <div className="stack">
      {/* Cabecera */}
      <div className="page-head flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 style={{ marginBottom: 4 }}>
            {t("home.hello", { name: data.usuarioNombre.split(" ")[0] })}
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            {t("home.sub", { company: data.empresaNombre })}
          </p>
        </div>
        <Link href="/panel/presupuestos/nuevo" className="btn btn-primary">
          <IconPlus />
          <span>{t("home.quick.newQuote")}</span>
        </Link>
      </div>

      {mensaje && (
        <div
          className={`aviso ${mensaje.ok ? "aviso-ok" : "aviso-error"}`}
          role="status"
          aria-live="polite"
        >
          {mensaje.ok && <IconCheck />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Tarjetas KPI */}
      <div className="grid grid-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="kpi-card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <span className="muted" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              {t("home.kpi.totalVolume")}
            </span>
            <div className="kpi-icon-wrap">
              <IconBolt />
            </div>
          </div>
          <p className="num" style={{ fontSize: "1.9rem", fontWeight: 800, margin: 0, color: "var(--accent)" }}>
            {formatearEuros(data.totalAceptadoCents)}
          </p>
          <div className="flex justify-between items-center mt-3">
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              {t("home.kpi.accepted")}: <strong className="num text-success">{data.presupuestosAceptado}</strong>
            </span>
            <span className="badge badge-success" style={{ fontSize: "0.75rem" }}>
              {data.tasaConversion}% éxito
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <span className="muted" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              {t("home.kpi.pending")}
            </span>
            <div className="kpi-icon-wrap info">
              <IconSend />
            </div>
          </div>
          <p className="num" style={{ fontSize: "1.9rem", fontWeight: 800, margin: 0 }}>
            {data.presupuestosEnviado}
          </p>
          <div className="flex justify-between items-center mt-3">
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              Total en juego: <strong className="num">{formatearEuros(data.totalEnviadoCents)}</strong>
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <span className="muted" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              {t("home.kpi.drafts")}
            </span>
            <div className="kpi-icon-wrap">
              <IconFileText />
            </div>
          </div>
          <p className="num" style={{ fontSize: "1.9rem", fontWeight: 800, margin: 0 }}>
            {data.presupuestosBorrador}
          </p>
          <div className="flex justify-between items-center mt-3">
            <Link href="/panel/presupuestos" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              Ver todos ({data.presupuestosTotal}) →
            </Link>
          </div>
        </div>

        <div className="kpi-card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <span className="muted" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              {t("home.works")}
            </span>
            <div className="kpi-icon-wrap ok">
              <IconHammer />
            </div>
          </div>
          <p className="num" style={{ fontSize: "1.9rem", fontWeight: 800, margin: 0 }}>
            {data.obrasEnCurso}
          </p>
          <div className="flex justify-between items-center mt-3">
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              {t("home.clients")}: <strong className="num">{data.clientes}</strong>
            </span>
            <Link href="/panel/obras" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              Ver obras →
            </Link>
          </div>
        </div>
      </div>

      {/* Sección de Seguimiento y Alertas */}
      <section className="card" aria-labelledby="followup-title">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 id="followup-title" style={{ fontSize: "1.2rem", margin: 0 }}>
            {t("home.followup.title")}
          </h2>
          {alertasLocales.length > 0 && (
            <span className="badge badge-warning">
              {alertasLocales.length} pendientes
            </span>
          )}
        </div>

        {alertasLocales.length === 0 ? (
          <div className="aviso aviso-ok" style={{ margin: 0 }}>
            <IconCheck />
            <span>{t("home.followup.empty")}</span>
          </div>
        ) : (
          <div className="grid gap-3">
            {alertasLocales.map((alerta) => (
              <div
                key={alerta.id}
                className="card flex justify-between items-center gap-4 flex-wrap"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  padding: "12px 16px",
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="badge" style={{ fontWeight: 700 }}>
                      {alerta.codigo}
                    </span>
                    {alerta.tipo === "cambios" && (
                      <span className="badge badge-warning">
                        {t("home.followup.changesTitle")}
                      </span>
                    )}
                    {alerta.tipo === "esperando" && (
                      <span className="badge badge-info">
                        {t("home.followup.waitingTitle")} ({alerta.dias}d)
                      </span>
                    )}
                    {alerta.tipo === "expira" && (
                      <span className="badge badge-error">
                        {t("home.followup.expiringTitle")} ({alerta.dias}d)
                      </span>
                    )}
                    <strong style={{ fontSize: "0.95rem" }}>{alerta.titulo}</strong>
                  </div>

                  <p className="muted" style={{ margin: "2px 0 0 0", fontSize: "0.88rem" }}>
                    {alerta.tipo === "cambios" && (
                      t("home.followup.changesDesc", {
                        name: alerta.clienteNombre,
                        code: alerta.codigo,
                        comment: alerta.comentario || "",
                      })
                    )}
                    {alerta.tipo === "esperando" && (
                      t("home.followup.waitingDesc", {
                        days: alerta.dias,
                        client: alerta.clienteNombre,
                        code: alerta.codigo,
                      })
                    )}
                    {alerta.tipo === "expira" && (
                      t("home.followup.expiringDesc", {
                        code: alerta.codigo,
                        client: alerta.clienteNombre,
                        days: alerta.dias,
                      })
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="num font-bold" style={{ whiteSpace: "nowrap" }}>
                    {formatearEuros(alerta.totalCents)}
                  </span>
                  {alerta.tipo === "cambios" ? (
                    <Link
                      href={`/panel/presupuestos/${alerta.presupuestoId}`}
                      className="btn btn-primary"
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                    >
                      {t("home.followup.review")}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      onClick={() => enviarRecordatorio(alerta)}
                      disabled={isPending}
                    >
                      <IconSend />
                      <span>{t("home.followup.sendReminder")}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Últimos Presupuestos */}
      <section className="card" aria-labelledby="recent-title">
        <div className="flex justify-between items-center mb-4">
          <h2 id="recent-title" style={{ fontSize: "1.2rem", margin: 0 }}>
            {t("home.recent.title")}
          </h2>
          <Link href="/panel/presupuestos" style={{ fontSize: "0.9rem" }}>
            Ver todos →
          </Link>
        </div>

        {data.recientes.length === 0 ? (
          <p className="muted">{t("home.recent.empty")}</p>
        ) : (
          <div className="grid gap-2">
            {data.recientes.map((p) => {
              const fechaStr = new Date(p.fechaEmision).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
              });
              return (
                <div
                  key={p.id}
                  className="flex justify-between items-center gap-4 p-2 flex-wrap"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: 10,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div className="flex items-center gap-2">
                      <span className="badge" style={{ fontWeight: 700 }}>{p.codigo}</span>
                      <span className={`badge ${getBadgeClass(p.estado)}`}>
                        {p.estado.toUpperCase()}
                      </span>
                      <Link
                        href={`/panel/presupuestos/${p.id}`}
                        style={{ fontWeight: 600, color: "var(--foreground)" }}
                        className="hover:underline"
                      >
                        {p.titulo}
                      </Link>
                    </div>
                    <div className="muted flex gap-3 text-sm mt-1">
                      <span className="inline-icon"><IconUser /> {p.clienteNombre}</span>
                      {p.obraNombre && <span className="inline-icon"><IconPin /> {p.obraNombre}</span>}
                      <span>{fechaStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="num font-bold" style={{ fontSize: "1.05rem" }}>
                      {formatearEuros(p.totalCents)}
                    </span>
                    <Link
                      href={`/panel/presupuestos/${p.id}`}
                      className="btn btn-outline"
                      style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Acciones Rápidas */}
      <section className="card">
        <h2 style={{ fontSize: "1.2rem", marginBottom: 6 }}>
          {t("home.quick.title")}
        </h2>
        <div className="row" style={{ marginTop: 12, flexWrap: "wrap", gap: 10 }}>
          <Link href="/panel/presupuestos/nuevo" className="btn btn-primary">
            <IconPlus />
            <span>{t("home.quick.newQuote")}</span>
          </Link>
          <Link href="/panel/banco" className="btn btn-outline">
            <IconDatabase />
            <span>{t("home.quick.priceBank")}</span>
          </Link>
          <Link href="/panel/clientes" className="btn btn-outline">
            <IconUsers />
            <span>{t("home.quick.addClient")}</span>
          </Link>
          <Link href="/panel/obras" className="btn btn-outline">
            <IconHammer />
            <span>{t("home.quick.addWork")}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
