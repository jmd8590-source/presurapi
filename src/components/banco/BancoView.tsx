"use client";

import { useState, useTransition } from "react";
import { useT } from "@/components/PrefsProvider";
import {
  crearPartidaAccion,
  actualizarPartidaAccion,
  eliminarPartidaAccion,
  precargarCatalogoBaseAccion,
} from "@/app/acciones/banco";
import { formatearEuros, eurosACentimos, centimosAEuros } from "@/lib/calculo";
import { IconPlus, IconDatabase, IconClose } from "@/components/Icons";

interface CapituloItem {
  id: string;
  nombre: string;
  orden: number;
}

interface PartidaItem {
  id: string;
  capituloId: string;
  capituloNombre: string;
  codigo: string;
  concepto: string;
  descripcion: string;
  unidad: string;
  precioVenta: number;   // Céntimos
  costeEstimado: number; // Céntimos
  activo: boolean;
}

export function BancoView({
  capitulos,
  partidas,
}: {
  capitulos: CapituloItem[];
  partidas: PartidaItem[];
}) {
  const { t } = useT();
  const [isPending, startTransition] = useTransition();
  const [capituloActivo, setCapituloActivo] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [partidaEditando, setPartidaEditando] = useState<PartidaItem | null>(null);

  // Campos de formulario
  const [fCapitulo, setFCapitulo] = useState<string>(capitulos[0]?.id ?? "");
  const [fCodigo, setFCodigo] = useState<string>("");
  const [fConcepto, setFConcepto] = useState<string>("");
  const [fDescripcion, setFDescripcion] = useState<string>("");
  const [fUnidad, setFUnidad] = useState<string>("m2");
  const [fPrecioVenta, setFPrecioVenta] = useState<string>("0");
  const [fCosteEstimado, setFCosteEstimado] = useState<string>("0");
  const [mensaje, setMensaje] = useState<string | null>(null);

  const abrirNuevo = () => {
    setPartidaEditando(null);
    setFCapitulo(capitulos[0]?.id ?? "");
    setFCodigo("");
    setFConcepto("");
    setFDescripcion("");
    setFUnidad("m2");
    setFPrecioVenta("0");
    setFCosteEstimado("0");
    setMensaje(null);
    setModalAbierto(true);
  };

  const abrirEditar = (p: PartidaItem) => {
    setPartidaEditando(p);
    setFCapitulo(p.capituloId);
    setFCodigo(p.codigo);
    setFConcepto(p.concepto);
    setFDescripcion(p.descripcion);
    setFUnidad(p.unidad);
    setFPrecioVenta(String(centimosAEuros(p.precioVenta)));
    setFCosteEstimado(String(centimosAEuros(p.costeEstimado)));
    setMensaje(null);
    setModalAbierto(true);
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const data = {
      capituloId: fCapitulo,
      codigo: fCodigo.trim(),
      concepto: fConcepto.trim(),
      descripcion: fDescripcion.trim(),
      unidad: fUnidad,
      precioVenta: eurosACentimos(fPrecioVenta),
      costeEstimado: eurosACentimos(fCosteEstimado),
    };

    startTransition(async () => {
      if (partidaEditando) {
        const res = await actualizarPartidaAccion(partidaEditando.id, data);
        if (res.ok) {
          setModalAbierto(false);
        } else {
          setMensaje(res.error || t("common.error"));
        }
      } else {
        const res = await crearPartidaAccion(data);
        if (res.ok) {
          setModalAbierto(false);
        } else {
          setMensaje(res.error || t("common.error"));
        }
      }
    });
  };

  const eliminar = (id: string) => {
    if (!confirm(t("common.confirmDelete"))) return;
    startTransition(async () => {
      await eliminarPartidaAccion(id);
    });
  };

  const precargar = () => {
    startTransition(async () => {
      const res = await precargarCatalogoBaseAccion();
      if (!res.ok) {
        alert(res.error || t("common.error"));
      }
    });
  };

  // Filtrado reactivo
  const partidasFiltradas = partidas.filter((p) => {
    const coincideCapitulo =
      capituloActivo === "todos" || p.capituloId === capituloActivo;
    const coincideTexto =
      !busqueda.trim() ||
      p.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCapitulo && coincideTexto;
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 style={{ margin: 0 }}>{t("bank.title")}</h1>
          <p className="muted" style={{ margin: "4px 0 0 0" }}>
            Partidas, precios de venta y costes de referencia para presupuestos.
          </p>
        </div>
        <div className="flex gap-2">
          {partidas.length === 0 && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={precargar}
              disabled={isPending}
            >
              <IconDatabase />
              <span>{t("bank.seedBtn")}</span>
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={abrirNuevo}>
            <IconPlus />
            <span>{t("bank.new")}</span>
          </button>
        </div>
      </div>

      {/* Buscador y filtro por capítulo */}
      <div className="card mb-6" style={{ padding: 16 }}>
        <div className="flex gap-4 flex-wrap items-center">
          <div style={{ flex: 1, minWidth: 260 }}>
            <input
              type="search"
              className="input"
              placeholder={t("bank.search")}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <select
              className="input"
              value={capituloActivo}
              onChange={(e) => setCapituloActivo(e.target.value)}
            >
              <option value="todos">{t("bank.allChapters")}</option>
              {capitulos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Listado de partidas */}
      {partidasFiltradas.length === 0 ? (
        <div className="card text-center" style={{ padding: "48px 24px" }}>
          <h2 style={{ fontSize: "1.25rem", margin: "0 0 8px 0" }}>{t("bank.empty")}</h2>
          <p className="muted" style={{ maxWidth: 500, margin: "0 auto 24px auto" }}>
            {t("bank.emptyText")}
          </p>
          <div className="flex justify-center gap-4">
            {partidas.length === 0 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={precargar}
                disabled={isPending}
              >
                <IconDatabase />
                <span>{t("bank.seedBtn")}</span>
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={abrirNuevo}>
              <IconPlus />
              <span>{t("bank.new")}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {partidasFiltradas.map((p) => {
            const beneficio = p.precioVenta - p.costeEstimado;
            const margenPct =
              p.precioVenta > 0
                ? Number(((beneficio / p.precioVenta) * 100).toFixed(0))
                : 0;
            const semaforoClass =
              margenPct >= 30
                ? "badge-success"
                : margenPct >= 15
                ? "badge-warning"
                : "badge-error";

            return (
              <div
                key={p.id}
                className="card flex items-center justify-between gap-4 p-4 flex-wrap"
                style={{
                  borderLeft: `4px solid ${
                    margenPct >= 30
                      ? "var(--success)"
                      : margenPct >= 15
                      ? "var(--warning)"
                      : "var(--error)"
                  }`,
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="flex items-center gap-2 mb-1">
                    {p.codigo && <span className="badge">{p.codigo}</span>}
                    <span className="badge badge-info" style={{ fontSize: "0.75rem" }}>
                      {p.capituloNombre}
                    </span>
                  </div>
                  <h3 style={{ margin: "4px 0", fontSize: "1.05rem" }}>{p.concepto}</h3>
                  {p.descripcion && (
                    <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                      {p.descripcion}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div style={{ textAlign: "right", minWidth: 110 }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      {t("bank.price")} / {p.unidad}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                      {formatearEuros(p.precioVenta)}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", minWidth: 100 }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      Coste: {formatearEuros(p.costeEstimado)}
                    </div>
                    <div>
                      <span className={`badge ${semaforoClass}`}>
                        {margenPct}% {t("bank.margin")}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      onClick={() => abrirEditar(p)}
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      type="button"
                      className="btn"
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.85rem",
                        color: "var(--error)",
                        background: "transparent",
                      }}
                      onClick={() => eliminar(p.id)}
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Añadir / Editar */}
      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
                {partidaEditando ? t("bank.edit") : t("bank.new")}
              </h2>
              <button
                type="button"
                className="btn"
                style={{ background: "transparent", fontSize: "1.25rem" }}
                onClick={() => setModalAbierto(false)}
              >
                <IconClose />
              </button>
            </div>

            {mensaje && (
              <div
                className="badge badge-error mb-4"
                style={{ display: "block", padding: 8 }}
              >
                {mensaje}
              </div>
            )}

            <form onSubmit={guardar} className="grid gap-3">
              <div className="grid grid-2 gap-3">
                <div>
                  <label className="label">{t("bank.chapter")} *</label>
                  <select
                    className="input"
                    value={fCapitulo}
                    onChange={(e) => setFCapitulo(e.target.value)}
                    required
                  >
                    {capitulos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{t("bank.code")}</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="ej: DEM-01"
                    value={fCodigo}
                    onChange={(e) => setFCodigo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">{t("bank.concept")} *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="ej: Alicatado de paredes con azulejo porcelánico"
                  value={fConcepto}
                  onChange={(e) => setFConcepto(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">{t("bank.description")}</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Detalle de materiales, morteros o proceso de ejecución..."
                  value={fDescripcion}
                  onChange={(e) => setFDescripcion(e.target.value)}
                />
              </div>

              <div className="grid grid-3 gap-3">
                <div>
                  <label className="label">{t("bank.unit")} *</label>
                  <select
                    className="input"
                    value={fUnidad}
                    onChange={(e) => setFUnidad(e.target.value)}
                  >
                    <option value="m2">m² (Metro cuadrado)</option>
                    <option value="m">m (Metro lineal)</option>
                    <option value="ud">ud (Unidad)</option>
                    <option value="pa">pa (Partida alzada)</option>
                    <option value="h">h (Hora)</option>
                    <option value="kg">kg (Kilo)</option>
                  </select>
                </div>

                <div>
                  <label className="label">{t("bank.price")} *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    value={fPrecioVenta}
                    onChange={(e) => setFPrecioVenta(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="label">{t("bank.cost")}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    value={fCosteEstimado}
                    onChange={(e) => setFCosteEstimado(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalAbierto(false)}
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? t("common.saving") : t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
