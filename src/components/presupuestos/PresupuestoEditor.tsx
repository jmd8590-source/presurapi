"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useT } from "@/components/PrefsProvider";
import {
  crearPresupuestoAccion,
  actualizarPresupuestoAccion,
} from "@/app/acciones/presupuestos";
import {
  calcularTotales,
  formatearEuros,
  eurosACentimos,
  centimosAEuros,
  calcularImporteLinea,
} from "@/lib/calculo";
import { IconPlus, IconDatabase } from "@/components/Icons";

interface ClienteSimple {
  id: string;
  nombre: string;
  nif: string;
  email: string;
  telefono: string;
}

interface ObraSimple {
  id: string;
  nombre: string;
  clienteId: string;
}

interface CapituloSimple {
  id: string;
  nombre: string;
}

interface PartidaBancoSimple {
  id: string;
  capituloId: string;
  codigo: string;
  concepto: string;
  descripcion: string;
  unidad: string;
  precioVenta: number;   // Céntimos
  costeEstimado: number; // Céntimos
}

interface LineaForm {
  tempId: string;
  capituloId: string;
  codigoPartida: string;
  concepto: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number; // Céntimos
  costeUnitario: number;  // Céntimos
  esOpcional: boolean;
}

interface OpcionForm {
  id?: string;
  tempId: string;
  nombre: string;
  orden: number;
  esSeleccionada: boolean;
  lineas: LineaForm[];
}

export function PresupuestoEditor({
  presupuestoExistente,
  clientes,
  obras,
  capitulos,
  bancoPartidas,
  empresaIvaDefault = 21,
  empresaCondicionesDefault = "",
}: {
  presupuestoExistente?: any;
  clientes: ClienteSimple[];
  obras: ObraSimple[];
  capitulos: CapituloSimple[];
  bancoPartidas: PartidaBancoSimple[];
  empresaIvaDefault?: number;
  empresaCondicionesDefault?: string;
}) {
  const { t } = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Paso actual (1: Datos, 2: Partidas y Opciones, 3: Condiciones)
  const [paso, setPaso] = useState<number>(1);

  // Paso 1: Datos
  const [clienteId, setClienteId] = useState<string>(
    presupuestoExistente?.clienteId || (clientes[0]?.id ?? "")
  );
  const [obraId, setObraId] = useState<string>(
    presupuestoExistente?.obraId || ""
  );
  const [titulo, setTitulo] = useState<string>(
    presupuestoExistente?.titulo || "Reforma de vivienda"
  );
  const [validezDias, setValidezDias] = useState<number>(
    presupuestoExistente?.validezDias || 30
  );

  // Paso 2: Opciones y Líneas
  const [opciones, setOpciones] = useState<OpcionForm[]>(() => {
    if (presupuestoExistente?.opciones && presupuestoExistente.opciones.length > 0) {
      return presupuestoExistente.opciones.map((opc: any, idx: number) => ({
        id: opc.id,
        tempId: opc.id || `opc_${idx}`,
        nombre: opc.nombre,
        orden: opc.orden,
        esSeleccionada: opc.esSeleccionada,
        lineas: (opc.lineas || []).map((l: any, lIdx: number) => ({
          tempId: l.id || `line_${lIdx}`,
          capituloId: l.capituloId,
          codigoPartida: l.codigoPartida,
          concepto: l.concepto,
          descripcion: l.descripcion,
          unidad: l.unidad,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
          costeUnitario: l.costeUnitario,
          esOpcional: l.esOpcional,
        })),
      }));
    }
    // Por defecto: 1 opción inicial
    return [
      {
        tempId: "opc_0",
        nombre: "Presupuesto",
        orden: 0,
        esSeleccionada: true,
        lineas: [],
      },
    ];
  });

  const [opcionActivaIdx, setOpcionActivaIdx] = useState<number>(0);
  const [modalBancoAbierto, setModalBancoAbierto] = useState<boolean>(false);
  const [filtroBanco, setFiltroBanco] = useState<string>("");

  // Paso 3: Condiciones
  const [ivaPct, setIvaPct] = useState<number>(
    presupuestoExistente?.ivaPct ?? empresaIvaDefault
  );
  const [descuentoPct, setDescuentoPct] = useState<number>(
    presupuestoExistente?.descuentoPct ?? 0
  );
  const [retencionPct, setRetencionPct] = useState<number>(
    presupuestoExistente?.retencionPct ?? 0
  );
  const [condiciones, setCondiciones] = useState<string>(
    presupuestoExistente?.condiciones || empresaCondicionesDefault
  );
  const [notasCliente, setNotasCliente] = useState<string>(
    presupuestoExistente?.notasCliente || ""
  );
  const [notasInternas, setNotasInternas] = useState<string>(
    presupuestoExistente?.notasInternas || ""
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Obras filtradas por el cliente seleccionado
  const obrasDelCliente = obras.filter((o) => o.clienteId === clienteId);

  // Opción activa actual
  const opcionActual = opciones[opcionActivaIdx] || opciones[0];

  // Cálculo en vivo de la opción activa
  const totalesOpcionActual = useMemo(() => {
    if (!opcionActual) return null;
    return calcularTotales(opcionActual.lineas, {
      ivaPct,
      descuentoPct,
      retencionPct,
    });
  }, [opcionActual, ivaPct, descuentoPct, retencionPct]);

  // Manejo de variantes de opciones
  const activarModoTresOpciones = () => {
    if (opciones.length >= 3) return;
    const nuevas: OpcionForm[] = [
      {
        tempId: "opc_basica",
        nombre: "Básica",
        orden: 0,
        esSeleccionada: false,
        lineas: [...(opciones[0]?.lineas || [])],
      },
      {
        tempId: "opc_recomendada",
        nombre: "Recomendada",
        orden: 1,
        esSeleccionada: true,
        lineas: [...(opciones[0]?.lineas || [])],
      },
      {
        tempId: "opc_premium",
        nombre: "Premium",
        orden: 2,
        esSeleccionada: false,
        lineas: [...(opciones[0]?.lineas || [])],
      },
    ];
    setOpciones(nuevas);
    setOpcionActivaIdx(1); // Situarse en Recomendada
  };

  const agregarOpcionLibre = () => {
    const orden = opciones.length;
    const nueva: OpcionForm = {
      tempId: `opc_${Date.now()}`,
      nombre: `Opción ${orden + 1}`,
      orden,
      esSeleccionada: false,
      lineas: [],
    };
    setOpciones([...opciones, nueva]);
    setOpcionActivaIdx(orden);
  };

  // Manejo de líneas en la opción activa
  const agregarLineaLibre = () => {
    const nueva: LineaForm = {
      tempId: `line_${Date.now()}`,
      capituloId: capitulos[0]?.id || "",
      codigoPartida: "",
      concepto: "Nueva partida",
      descripcion: "",
      unidad: "m2",
      cantidad: 1,
      precioUnitario: 0,
      costeUnitario: 0,
      esOpcional: false,
    };
    const copia = [...opciones];
    copia[opcionActivaIdx].lineas.push(nueva);
    setOpciones(copia);
  };

  const agregarDesdeBanco = (p: PartidaBancoSimple) => {
    const nueva: LineaForm = {
      tempId: `line_${Date.now()}`,
      capituloId: p.capituloId,
      codigoPartida: p.codigo,
      concepto: p.concepto,
      descripcion: p.descripcion,
      unidad: p.unidad,
      cantidad: 1,
      precioUnitario: p.precioVenta,
      costeUnitario: p.costeEstimado,
      esOpcional: false,
    };
    const copia = [...opciones];
    copia[opcionActivaIdx].lineas.push(nueva);
    setOpciones(copia);
    setModalBancoAbierto(false);
  };

  const actualizarLinea = (idx: number, patch: Partial<LineaForm>) => {
    const copia = [...opciones];
    copia[opcionActivaIdx].lineas[idx] = {
      ...copia[opcionActivaIdx].lineas[idx],
      ...patch,
    };
    setOpciones(copia);
  };

  const eliminarLinea = (idx: number) => {
    const copia = [...opciones];
    copia[opcionActivaIdx].lineas.splice(idx, 1);
    setOpciones(copia);
  };

  // Guardar presupuesto
  const guardar = () => {
    setErrorMsg(null);
    if (!clienteId) {
      setErrorMsg(t("editor.selectClient"));
      setPaso(1);
      return;
    }
    if (!titulo.trim()) {
      setErrorMsg("El título es obligatorio");
      setPaso(1);
      return;
    }

    const payload = {
      clienteId,
      obraId: obraId || null,
      titulo: titulo.trim(),
      ivaPct,
      retencionPct,
      descuentoPct,
      condiciones,
      validezDias,
      notasCliente,
      notasInternas,
      opciones: opciones.map((opc, oIdx) => ({
        id: opc.id,
        nombre: opc.nombre,
        orden: oIdx,
        esSeleccionada: opc.esSeleccionada,
        lineas: opc.lineas.map((l, lIdx) => ({
          opcionId: opc.id || "",
          capituloId: l.capituloId,
          codigoPartida: l.codigoPartida,
          concepto: l.concepto,
          descripcion: l.descripcion,
          unidad: l.unidad,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
          costeUnitario: l.costeUnitario,
          esOpcional: l.esOpcional,
          orden: lIdx,
        })),
      })),
    };

    startTransition(async () => {
      if (presupuestoExistente?.id) {
        const res = await actualizarPresupuestoAccion(
          presupuestoExistente.id,
          payload
        );
        if (res.ok) {
          router.push("/panel/presupuestos");
        } else {
          setErrorMsg(res.error || t("common.error"));
        }
      } else {
        const res = await crearPresupuestoAccion(payload);
        if (res.ok) {
          router.push("/panel/presupuestos");
        } else {
          setErrorMsg(res.error || t("common.error"));
        }
      }
    });
  };

  return (
    <div>
      {/* Cabecera y Navegación de Pasos */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/panel/presupuestos" className="muted hover:underline">
              ← {t("quotes.title")}
            </Link>
            {presupuestoExistente?.codigo && (
              <span className="badge">{presupuestoExistente.codigo}</span>
            )}
          </div>
          <h1 style={{ margin: 0, fontSize: "1.75rem" }}>
            {presupuestoExistente ? t("quotes.edit") : t("quotes.new")}
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={guardar}
            disabled={isPending}
          >
            {isPending ? t("common.saving") : t("editor.saveDraft")}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          className="badge badge-error mb-4"
          style={{ display: "block", padding: 12, fontSize: "0.95rem" }}
        >
          {errorMsg}
        </div>
      )}

      {/* Selector de los 3 pasos */}
      <div className="card mb-6" style={{ padding: 12 }}>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className={`btn ${paso === 1 ? "btn-primary" : "btn-outline"}`}
            style={{ flex: 1, minWidth: 160 }}
            onClick={() => setPaso(1)}
          >
            {t("editor.step1")}
          </button>
          <button
            type="button"
            className={`btn ${paso === 2 ? "btn-primary" : "btn-outline"}`}
            style={{ flex: 1, minWidth: 160 }}
            onClick={() => setPaso(2)}
          >
            {t("editor.step2")}
          </button>
          <button
            type="button"
            className={`btn ${paso === 3 ? "btn-primary" : "btn-outline"}`}
            style={{ flex: 1, minWidth: 160 }}
            onClick={() => setPaso(3)}
          >
            {t("editor.step3")}
          </button>
        </div>
      </div>

      {/* CONTENIDO DEL PASO 1 */}
      {paso === 1 && (
        <div className="card p-6 grid gap-4" style={{ maxWidth: 700 }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{t("editor.step1")}</h2>

          <div>
            <label className="label">{t("editor.selectClient")} *</label>
            <select
              className="input"
              value={clienteId}
              onChange={(e) => {
                setClienteId(e.target.value);
                setObraId(""); // reset obra si cambia cliente
              }}
              required
            >
              <option value="">-- Elige un cliente --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.nif ? `(${c.nif})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">{t("editor.selectWork")}</label>
            <select
              className="input"
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
            >
              <option value="">{t("editor.noWork")}</option>
              {obrasDelCliente.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">{t("quotes.quoteTitle")} *</label>
            <input
              type="text"
              className="input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="ej: Reforma Baño Principal y Alicatado"
              required
            />
          </div>

          <div>
            <label className="label">{t("quotes.validity")}</label>
            <input
              type="number"
              className="input"
              value={validezDias}
              onChange={(e) => setValidezDias(Number(e.target.value))}
              min={1}
              max={365}
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPaso(2)}
            >
              {t("common.next")} →
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO DEL PASO 2: EL NÚCLEO */}
      {paso === 2 && (
        <div className="grid gap-6">
          {/* Variantes / Opciones (Básica / Recomendada / Premium) */}
          <div className="card p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <strong style={{ fontSize: "1.1rem" }}>{t("editor.optionsTitle")}</strong>
                <p className="muted" style={{ margin: "2px 0 0 0", fontSize: "0.85rem" }}>
                  Ofrece al cliente elegir entre opciones en el mismo presupuesto para aumentar tus ventas.
                </p>
              </div>

              <div className="flex gap-2">
                {opciones.length === 1 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={activarModoTresOpciones}
                  >
                    ⭐ {t("editor.optionTriple")}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={agregarOpcionLibre}
                >
                  {t("editor.addOption")}
                </button>
              </div>
            </div>

            {/* Pestañas de opciones */}
            <div className="flex gap-2 border-b" style={{ borderColor: "var(--border)" }}>
              {opciones.map((opc, idx) => (
                <button
                  key={opc.tempId}
                  type="button"
                  className={`btn ${
                    opcionActivaIdx === idx ? "btn-primary" : "btn-outline"
                  }`}
                  style={{
                    borderRadius: "8px 8px 0 0",
                    borderBottom: opcionActivaIdx === idx ? "none" : undefined,
                  }}
                  onClick={() => setOpcionActivaIdx(idx)}
                >
                  <span>{opc.nombre}</span>
                  <span
                    className="badge"
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: "inherit",
                      marginLeft: 6,
                    }}
                  >
                    {opc.lineas.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid: Partidas de la opción + Panel lateral de cálculo en vivo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
            {/* Lista de Partidas */}
            <div className="grid gap-4">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <h3 style={{ margin: 0 }}>
                  Partidas de {opcionActual.nombre}
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setModalBancoAbierto(true)}
                  >
                    <IconDatabase />
                    <span>{t("editor.addFromBank")}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={agregarLineaLibre}
                  >
                    <IconPlus />
                    <span>{t("editor.addLine")}</span>
                  </button>
                </div>
              </div>

              {opcionActual.lineas.length === 0 ? (
                <div className="card text-center p-8">
                  <p className="muted" style={{ margin: "0 0 16px 0" }}>
                    No hay partidas en esta opción todavía.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setModalBancoAbierto(true)}
                    >
                      <IconDatabase />
                      <span>{t("editor.addFromBank")}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={agregarLineaLibre}
                    >
                      <IconPlus />
                      <span>{t("editor.addLine")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {opcionActual.lineas.map((linea, lIdx) => {
                    const importeLinea = calcularImporteLinea(
                      linea.cantidad,
                      linea.precioUnitario
                    );
                    const costeTotalLinea = calcularImporteLinea(
                      linea.cantidad,
                      linea.costeUnitario
                    );
                    const beneficioLinea = importeLinea - costeTotalLinea;
                    const margenLineaPct =
                      importeLinea > 0
                        ? Number(((beneficioLinea / importeLinea) * 100).toFixed(0))
                        : 0;

                    return (
                      <div
                        key={linea.tempId}
                        className="card p-4"
                        style={{
                          borderLeft: linea.esOpcional
                            ? "4px dashed var(--accent)"
                            : "4px solid var(--accent)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                          <div style={{ flex: 1, minWidth: 240 }}>
                            <input
                              type="text"
                              className="input font-semibold mb-1"
                              value={linea.concepto}
                              placeholder="Concepto de la partida"
                              onChange={(e) =>
                                actualizarLinea(lIdx, { concepto: e.target.value })
                              }
                            />
                            <textarea
                              className="input text-sm"
                              rows={1}
                              value={linea.descripcion}
                              placeholder="Descripción o detalle..."
                              onChange={(e) =>
                                actualizarLinea(lIdx, { descripcion: e.target.value })
                              }
                            />
                          </div>

                          <button
                            type="button"
                            className="btn"
                            style={{
                              color: "var(--error)",
                              background: "transparent",
                              padding: "4px 8px",
                            }}
                            title={t("editor.deleteLine")}
                            onClick={() => eliminarLinea(lIdx)}
                          >
                            ✕
                          </button>
                        </div>

                        {/* Campos numéricos y opciones */}
                        <div className="flex items-center gap-3 flex-wrap text-sm">
                          <div style={{ width: 85 }}>
                            <label className="label" style={{ fontSize: "0.75rem" }}>
                              Cantidad
                            </label>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              className="input"
                              value={linea.cantidad}
                              onChange={(e) =>
                                actualizarLinea(lIdx, {
                                  cantidad: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>

                          <div style={{ width: 80 }}>
                            <label className="label" style={{ fontSize: "0.75rem" }}>
                              Unidad
                            </label>
                            <input
                              type="text"
                              className="input"
                              value={linea.unidad}
                              onChange={(e) =>
                                actualizarLinea(lIdx, { unidad: e.target.value })
                              }
                            />
                          </div>

                          <div style={{ width: 110 }}>
                            <label className="label" style={{ fontSize: "0.75rem" }}>
                              Precio Venta (€)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="input"
                              value={centimosAEuros(linea.precioUnitario)}
                              onChange={(e) =>
                                actualizarLinea(lIdx, {
                                  precioUnitario: eurosACentimos(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div style={{ width: 110 }}>
                            <label className="label" style={{ fontSize: "0.75rem" }}>
                              Coste (€)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="input"
                              value={centimosAEuros(linea.costeUnitario)}
                              onChange={(e) =>
                                actualizarLinea(lIdx, {
                                  costeUnitario: eurosACentimos(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div className="flex items-center gap-2 mt-4">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={linea.esOpcional}
                                onChange={(e) =>
                                  actualizarLinea(lIdx, {
                                    esOpcional: e.target.checked,
                                  })
                                }
                              />
                              <span style={{ fontSize: "0.8rem" }}>
                                {t("editor.isOptional")}
                              </span>
                            </label>
                          </div>

                          <div style={{ marginLeft: "auto", textAlign: "right" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                              Total Línea
                            </div>
                            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                              {formatearEuros(importeLinea)}
                            </div>
                            <div style={{ fontSize: "0.75rem" }}>
                              Margen:{" "}
                              <span
                                style={{
                                  fontWeight: 600,
                                  color:
                                    margenLineaPct >= 30
                                      ? "var(--success)"
                                      : margenLineaPct >= 15
                                      ? "var(--warning)"
                                      : "var(--error)",
                                }}
                              >
                                {margenLineaPct}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PANEL LATERAL: CÁLCULO EN VIVO Y CONTROL DE RENTABILIDAD */}
            {totalesOpcionActual && (
              <div
                className="card p-5"
                style={{
                  position: "sticky",
                  top: 24,
                  border: "2px solid var(--border)",
                }}
              >
                <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>
                  {t("editor.summary")}
                </h3>

                <div className="grid gap-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="muted">{t("editor.subtotal")}</span>
                    <span>{formatearEuros(totalesOpcionActual.subtotalBaseVenta)}</span>
                  </div>

                  {totalesOpcionActual.subtotalOpcionalesVenta > 0 && (
                    <div className="flex justify-between text-xs" style={{ color: "var(--accent)" }}>
                      <span>{t("editor.optionalSubtotal")}</span>
                      <span>+{formatearEuros(totalesOpcionActual.subtotalOpcionalesVenta)}</span>
                    </div>
                  )}

                  {descuentoPct > 0 && (
                    <div className="flex justify-between text-xs" style={{ color: "var(--error)" }}>
                      <span>Descuento ({descuentoPct}%)</span>
                      <span>-{formatearEuros(totalesOpcionActual.descuentoCents)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="muted">Base Imponible</span>
                    <span>{formatearEuros(totalesOpcionActual.baseImponible)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="muted">IVA ({ivaPct}%)</span>
                    <span>{formatearEuros(totalesOpcionActual.ivaCents)}</span>
                  </div>

                  {retencionPct > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="muted">Retención IRPF ({retencionPct}%)</span>
                      <span>-{formatearEuros(totalesOpcionActual.retencionCents)}</span>
                    </div>
                  )}

                  <div
                    className="flex justify-between font-bold border-t pt-2"
                    style={{ borderColor: "var(--border)", fontSize: "1.2rem" }}
                  >
                    <span>{t("editor.total")}</span>
                    <span style={{ color: "var(--accent)" }}>
                      {formatearEuros(totalesOpcionActual.totalPresupuesto)}
                    </span>
                  </div>
                </div>

                {/* SEMÁFORO DE RENTABILIDAD (PRIVADO PARA EL ALBAÑIL) */}
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 12,
                    background: "rgba(0,0,0,0.02)",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      Control de Rentabilidad
                    </span>
                    <span
                      className={`badge ${
                        totalesOpcionActual.semaforo === "verde"
                          ? "badge-success"
                          : totalesOpcionActual.semaforo === "ambar"
                          ? "badge-warning"
                          : "badge-error"
                      }`}
                      style={{ fontWeight: 700 }}
                    >
                      {totalesOpcionActual.margenPct}% {t("editor.margin")}
                    </span>
                  </div>

                  <div className="grid gap-1 text-xs mb-2">
                    <div className="flex justify-between">
                      <span className="muted">{t("editor.estimatedCost")}</span>
                      <span>{formatearEuros(totalesOpcionActual.subtotalBaseCoste)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="muted">{t("editor.profit")}</span>
                      <span style={{ fontWeight: 600 }}>
                        {formatearEuros(totalesOpcionActual.beneficioBruto)}
                      </span>
                    </div>
                  </div>

                  <p className="muted" style={{ margin: 0, fontSize: "0.75rem" }}>
                    🔒 {t("editor.privateNote")}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => setPaso(1)}
                  >
                    ← {t("common.back")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => setPaso(3)}
                  >
                    {t("common.next")} →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENIDO DEL PASO 3: CONDICIONES Y CIERRE */}
      {paso === 3 && (
        <div className="card p-6 grid gap-4" style={{ maxWidth: 700 }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{t("editor.step3")}</h2>

          <div className="grid grid-3 gap-3">
            <div>
              <label className="label">{t("editor.vat")} (%)</label>
              <select
                className="input"
                value={ivaPct}
                onChange={(e) => setIvaPct(Number(e.target.value))}
              >
                <option value={21}>21% (General)</option>
                <option value={10}>10% (Reducido obras vivienda)</option>
                <option value={0}>0% (Exento)</option>
              </select>
            </div>

            <div>
              <label className="label">{t("editor.discount")}</label>
              <input
                type="number"
                min="0"
                max="100"
                className="input"
                value={descuentoPct}
                onChange={(e) => setDescuentoPct(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="label">{t("editor.retention")} (%)</label>
              <input
                type="number"
                min="0"
                max="30"
                className="input"
                value={retencionPct}
                onChange={(e) => setRetencionPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="label">Condiciones de Pago y Validez</label>
            <textarea
              className="input"
              rows={3}
              value={condiciones}
              onChange={(e) => setCondiciones(e.target.value)}
              placeholder="Forma de pago, entrega de materiales, licencias..."
            />
          </div>

          <div>
            <label className="label">{t("editor.clientNotes")}</label>
            <textarea
              className="input"
              rows={2}
              value={notasCliente}
              onChange={(e) => setNotasCliente(e.target.value)}
              placeholder="Mensaje de bienvenida o aclaraciones visibles en el presupuesto..."
            />
          </div>

          <div>
            <label className="label">{t("editor.internalNotes")}</label>
            <textarea
              className="input"
              rows={2}
              value={notasInternas}
              onChange={(e) => setNotasInternas(e.target.value)}
              placeholder="Notas privadas sobre subcontratas, horas previstas..."
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setPaso(2)}
            >
              ← {t("common.back")}
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={guardar}
              disabled={isPending}
            >
              {isPending ? t("common.saving") : t("editor.saveDraft")}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DEL BANCO DE PRECIOS */}
      {modalBancoAbierto && (
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
            style={{ width: "100%", maxWidth: 650, maxHeight: "85vh", overflowY: "auto" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
                Seleccionar Partida del Banco
              </h2>
              <button
                type="button"
                className="btn"
                style={{ background: "transparent", fontSize: "1.25rem" }}
                onClick={() => setModalBancoAbierto(false)}
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <input
                type="search"
                className="input"
                placeholder="Buscar por concepto o código..."
                value={filtroBanco}
                onChange={(e) => setFiltroBanco(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              {bancoPartidas
                .filter(
                  (p) =>
                    !filtroBanco ||
                    p.concepto.toLowerCase().includes(filtroBanco.toLowerCase()) ||
                    p.codigo.toLowerCase().includes(filtroBanco.toLowerCase())
                )
                .map((p) => (
                  <div
                    key={p.id}
                    className="card p-3 flex justify-between items-center gap-3 hover:shadow-md cursor-pointer"
                    onClick={() => agregarDesdeBanco(p)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {p.codigo && <span className="badge">{p.codigo}</span>}
                        <strong style={{ fontSize: "0.95rem" }}>{p.concepto}</strong>
                      </div>
                      {p.descripcion && (
                        <p className="muted" style={{ margin: "2px 0 0 0", fontSize: "0.8rem" }}>
                          {p.descripcion}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right", minWidth: 100 }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                        {formatearEuros(p.precioVenta)}
                      </div>
                      <div className="muted" style={{ fontSize: "0.75rem" }}>
                        /{p.unidad}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
