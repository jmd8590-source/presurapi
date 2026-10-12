"use client";

import { useMemo, useRef, useState, useTransition, useEffect } from "react";
import { useT } from "@/components/PrefsProvider";
import { responderPresupuestoAccion } from "@/app/acciones/publico";
import { calcularTotales, calcularImporteLinea, formatearEuros } from "@/lib/calculo";
import { IconCheck, IconDownload, IconPen, IconClose } from "@/components/Icons";
import type { Key } from "@/lib/i18n";

export interface LineaPublica {
  id: string;
  concepto: string;
  descripcion: string | null;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
  esOpcional: boolean;
}
export interface OpcionPublica {
  id: string;
  nombre: string;
  esSeleccionada: boolean;
  lineas: LineaPublica[];
}
export interface PresupuestoPublicoData {
  codigo: string;
  titulo: string;
  estado: string;
  ivaPct: number;
  retencionPct: number;
  descuentoPct: number;
  condiciones: string | null;
  notasCliente: string | null;
  validezDias: number;
  fechaEmision: string;
  caducado: boolean;
  cliente: { nombre: string };
  obra: { nombre: string; direccion: string | null } | null;
  empresa: { nombre: string; telefono: string | null; emailContacto: string | null };
  opciones: OpcionPublica[];
}

const ERRORES: Record<string, Key> = {
  invalido: "pub.err.invalid",
  limite: "pub.err.limit",
  no_disponible: "pub.err.unavailable",
  caducado: "pub.expired",
  fallo: "pub.err.generic",
};

/** Lienzo de firma con ratón y táctil. Devuelve el PNG como data URL. */
function Firma({ onChange, clearLabel }: { onChange: (png: string) => void; clearLabel: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#1f1a14";
    }
  }, []);

  const punto = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const inicio = (e: React.PointerEvent) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ref.current!.setPointerCapture(e.pointerId);
    dibujando.current = true;
    const p = punto(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const mover = (e: React.PointerEvent) => {
    if (!dibujando.current) return;
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const p = punto(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const fin = () => {
    if (!dibujando.current) return;
    dibujando.current = false;
    onChange(ref.current!.toDataURL("image/png"));
  };
  const borrar = () => {
    const c = ref.current!;
    c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    onChange("");
  };

  return (
    <div>
      <canvas
        ref={ref}
        className="firma-lienzo"
        onPointerDown={inicio}
        onPointerMove={mover}
        onPointerUp={fin}
        onPointerCancel={fin}
        role="img"
        aria-label="signature"
      />
      <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} onClick={borrar}>
        <IconClose /> <span>{clearLabel}</span>
      </button>
    </div>
  );
}

export function PresupuestoPublico({ token, p }: { token: string; p: PresupuestoPublicoData }) {
  const { t, lang } = useT();
  const [pending, start] = useTransition();
  const seleccionInicial = p.opciones.find((o) => o.esSeleccionada)?.id ?? p.opciones[0]?.id ?? "";
  const [opcionId, setOpcionId] = useState(seleccionInicial);
  const [extras, setExtras] = useState<string[]>([]);
  const [nombre, setNombre] = useState("");
  const [firma, setFirma] = useState("");
  const [comentario, setComentario] = useState("");
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [hecho, setHecho] = useState(false);

  const opcion = p.opciones.find((o) => o.id === opcionId) ?? p.opciones[0];
  const locale = lang === "en" ? "en-GB" : "es-ES";

  const totales = useMemo(() => {
    if (!opcion) return null;
    const lineas = opcion.lineas.map((l) => ({
      cantidad: l.cantidad,
      precioUnitario: l.precioUnitario,
      costeUnitario: 0,
      esOpcional: l.esOpcional && !extras.includes(l.id),
    }));
    return calcularTotales(lineas, {
      ivaPct: p.ivaPct,
      retencionPct: p.retencionPct,
      descuentoPct: p.descuentoPct,
    });
  }, [opcion, extras, p.ivaPct, p.retencionPct, p.descuentoPct]);

  const fechaHasta = new Date(new Date(p.fechaEmision).getTime() + p.validezDias * 86_400_000).toLocaleDateString(
    locale,
    { day: "2-digit", month: "long", year: "numeric" },
  );

  const yaAceptado = p.estado === "aceptado" || p.estado === "facturado";
  const bloqueado = p.caducado || yaAceptado || hecho;

  const enviar = (accion: "aceptado" | "cambios") => {
    setMensaje(null);
    start(async () => {
      const res = await responderPresupuestoAccion(token, {
        accion,
        opcionId,
        opcionalesIds: extras,
        nombre,
        comentario,
        firmaPng: accion === "aceptado" ? firma : "",
      });
      if (res.ok) {
        setHecho(true);
        setMensaje({ tipo: "ok", texto: t(accion === "aceptado" ? "pub.done.accepted" : "pub.done.changes") });
      } else {
        setMensaje({ tipo: "error", texto: t(ERRORES[res.error] ?? "pub.err.generic", { company: p.empresa.nombre }) });
      }
    });
  };

  if (!opcion || !totales) return null;

  return (
    <main className="publico">
      <header className="publico-cab">
        <div>
          <p className="publico-empresa">{t("pub.from", { company: p.empresa.nombre })}</p>
          <h1>{p.titulo}</h1>
          <p className="muted">
            {p.codigo} · {t("pub.hello", { name: p.cliente.nombre })}
            {p.obra ? ` · ${p.obra.nombre}` : ""}
          </p>
          <p className="muted">{t("pub.validUntil", { date: fechaHasta })}</p>
        </div>
        <a className="btn btn-outline" href={`/p/${token}/pdf`}>
          <IconDownload /> <span>{t("pub.downloadPdf")}</span>
        </a>
      </header>

      {p.caducado && !yaAceptado && <div className="aviso aviso-error">{t("pub.expired", { company: p.empresa.nombre })}</div>}
      {yaAceptado && !hecho && <div className="aviso aviso-ok">{t("pub.alreadyAccepted")}</div>}

      {p.opciones.length > 1 && (
        <section className="card" aria-labelledby="pub-opciones">
          <h2 id="pub-opciones" style={{ fontSize: "1.1rem" }}>{t("pub.chooseOption")}</h2>
          <div className="publico-tabs" role="radiogroup" aria-labelledby="pub-opciones">
            {p.opciones.map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={o.id === opcionId}
                className={`btn ${o.id === opcionId ? "btn-primary" : "btn-outline"}`}
                disabled={bloqueado}
                onClick={() => {
                  setOpcionId(o.id);
                  setExtras([]);
                }}
              >
                {t("pub.option")} {o.nombre}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <div className="tabla-scroll">
          <table className="tabla-publica">
            <thead>
              <tr>
                <th>{t("pub.concept")}</th>
                <th className="num">{t("pub.qty")}</th>
                <th className="num">{t("pub.price")}</th>
                <th className="num">{t("pub.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {opcion.lineas
                .filter((l) => !l.esOpcional)
                .map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.concepto}</strong>
                      {l.descripcion && <div className="muted" style={{ fontSize: "0.85rem" }}>{l.descripcion}</div>}
                    </td>
                    <td className="num">{l.cantidad} {l.unidad}</td>
                    <td className="num">{formatearEuros(l.precioUnitario)}</td>
                    <td className="num">{formatearEuros(calcularImporteLinea(l.cantidad, l.precioUnitario))}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {opcion.lineas.some((l) => l.esOpcional) && (
          <fieldset className="publico-opcionales">
            <legend>{t("pub.optionalTitle")}</legend>
            <p className="muted" style={{ marginTop: 0 }}>{t("pub.optionalHint")}</p>
            {opcion.lineas
              .filter((l) => l.esOpcional)
              .map((l) => (
                <label key={l.id} className="publico-extra">
                  <input
                    type="checkbox"
                    checked={extras.includes(l.id)}
                    disabled={bloqueado}
                    onChange={(e) =>
                      setExtras((prev) => (e.target.checked ? [...prev, l.id] : prev.filter((x) => x !== l.id)))
                    }
                  />
                  <span>
                    <strong>{l.concepto}</strong> <span className="badge">{t("pub.optionalTag")}</span>
                    <br />
                    <span className="muted">
                      {l.cantidad} {l.unidad} · {formatearEuros(calcularImporteLinea(l.cantidad, l.precioUnitario))}
                    </span>
                  </span>
                </label>
              ))}
          </fieldset>
        )}

        <dl className="publico-totales">
          <div><dt>{t("pub.subtotal")}</dt><dd>{formatearEuros(totales.subtotalBaseVenta)}</dd></div>
          {totales.descuentoCents > 0 && (
            <div><dt>{t("pub.discount")} ({p.descuentoPct}%)</dt><dd>-{formatearEuros(totales.descuentoCents)}</dd></div>
          )}
          <div><dt>{t("pub.base")}</dt><dd>{formatearEuros(totales.baseImponible)}</dd></div>
          <div><dt>{t("pub.vat")} ({p.ivaPct}%)</dt><dd>{formatearEuros(totales.ivaCents)}</dd></div>
          {totales.retencionCents > 0 && (
            <div><dt>{t("pub.retention")} ({p.retencionPct}%)</dt><dd>-{formatearEuros(totales.retencionCents)}</dd></div>
          )}
          <div className="total"><dt>{t("pub.total")}</dt><dd>{formatearEuros(totales.totalPresupuesto)}</dd></div>
        </dl>

        {p.condiciones && <p className="muted" style={{ whiteSpace: "pre-line", fontSize: "0.85rem" }}>{p.condiciones}</p>}
      </section>

      {mensaje && (
        <div className={`aviso ${mensaje.tipo === "ok" ? "aviso-ok" : "aviso-error"}`} role="status" aria-live="polite">
          {mensaje.tipo === "ok" && <IconCheck />} {mensaje.texto}
        </div>
      )}

      {!bloqueado && (
        <>
          <section className="card" aria-labelledby="pub-firma">
            <h2 id="pub-firma" style={{ fontSize: "1.1rem" }}>
              <IconPen /> {t("pub.accept.title")}
            </h2>
            <label className="label" htmlFor="pub-nombre">{t("pub.accept.name")}</label>
            <input
              id="pub-nombre"
              className="input"
              value={nombre}
              maxLength={120}
              autoComplete="name"
              onChange={(e) => setNombre(e.target.value)}
            />
            <p className="label" style={{ marginTop: 16 }}>{t("pub.accept.sign")}</p>
            <Firma onChange={setFirma} clearLabel={t("pub.accept.clear")} />
            <p className="muted" style={{ fontSize: "0.85rem" }}>{t("pub.accept.legal")}</p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={pending || nombre.trim().length < 2 || !firma}
              onClick={() => enviar("aceptado")}
            >
              <IconCheck /> <span>{t("pub.accept.submit")}</span>
            </button>
          </section>

          <section className="card" aria-labelledby="pub-cambios">
            <h2 id="pub-cambios" style={{ fontSize: "1.1rem" }}>{t("pub.changes.title")}</h2>
            <textarea
              className="input"
              rows={3}
              maxLength={1500}
              placeholder={t("pub.changes.placeholder")}
              aria-label={t("pub.changes.title")}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline"
              style={{ marginTop: 8 }}
              disabled={pending || nombre.trim().length < 2 || !comentario.trim()}
              onClick={() => enviar("cambios")}
            >
              {t("pub.changes.submit")}
            </button>
            {nombre.trim().length < 2 && <p className="muted" style={{ fontSize: "0.8rem" }}>{t("pub.accept.name")}</p>}
          </section>
        </>
      )}
    </main>
  );
}
