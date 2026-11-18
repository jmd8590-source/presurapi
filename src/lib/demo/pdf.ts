"use client";

// Generación del PDF del presupuesto, enteramente en el navegador (pdf-lib):
// no necesita servidor, así que funciona igual en la demo que con el backend
// real más adelante. Fuentes estándar (WinAnsi) para no tener que empaquetar
// tipografías: cubren tildes, ñ y el símbolo € sin problema.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Capitulo, Cliente, Obra, Partida, Perfil, Presupuesto } from "./types";
import type { Locale } from "../i18n";

function hex(r: number, g: number, b: number) {
  return rgb(r / 255, g / 255, b / 255);
}

const COLOR_INK = hex(0x21, 0x1d, 0x17);
const COLOR_MUTED = hex(0x6e, 0x66, 0x57);
const COLOR_BRASS = hex(0xa9, 0x75, 0x2e);
const COLOR_BORDER = hex(0xde, 0xd3, 0xbe);

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function textos(locale: Locale) {
  const es = {
    quote: "Presupuesto",
    no: "Nº",
    date: "Fecha",
    status: {
      borrador: "Borrador",
      enviado: "Enviado",
      aceptado: "Aceptado",
      rechazado: "Rechazado",
    },
    client: "Cliente",
    project: "Obra",
    description: "Descripción",
    measurement: "Medición",
    unitPrice: "Precio/ud",
    amount: "Importe",
    subtotalMaterials: "Subtotal materiales",
    subtotalLabor: "Subtotal mano de obra",
    overheads: "Gastos generales",
    profit: "Beneficio industrial",
    base: "Base imponible",
    vat: "IVA",
    total: "TOTAL",
    notes: "Notas",
    pendingCompany: "Completa los datos de tu empresa en Ajustes para que aparezcan aquí.",
    page: "Página",
    of: "de",
    guideline:
      "Presupuesto orientativo. Los precios de materiales proceden de un banco de precios estimado salvo que el profesional haya fijado los suyos propios.",
  };
  const en: typeof es = {
    quote: "Quote",
    no: "No.",
    date: "Date",
    status: { borrador: "Draft", enviado: "Sent", aceptado: "Accepted", rechazado: "Rejected" },
    client: "Client",
    project: "Project",
    description: "Description",
    measurement: "Measurement",
    unitPrice: "Price/unit",
    amount: "Amount",
    subtotalMaterials: "Materials subtotal",
    subtotalLabor: "Labour subtotal",
    overheads: "Overheads",
    profit: "Profit margin",
    base: "Taxable base",
    vat: "VAT",
    total: "TOTAL",
    notes: "Notes",
    pendingCompany: "Fill in your company details in Settings so they appear here.",
    page: "Page",
    of: "of",
    guideline:
      "Guideline quote. Material prices come from an estimated price list unless the professional has set their own.",
  };
  return locale === "en" ? en : es;
}

function formatoMoneda(locale: Locale) {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "es-ES", {
    style: "currency",
    currency: "EUR",
  });
}

function formatoFecha(locale: Locale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", { dateStyle: "long" });
}

function mimeDeDataUrl(dataUrl: string): string | null {
  const match = /^data:([^;]+);base64,/.exec(dataUrl);
  return match ? match[1] : null;
}

interface Contexto {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  fontRegular: PDFFont;
  fontBold: PDFFont;
  fontItalic: PDFFont;
  pageNum: number;
}

function nuevaPagina(ctx: Contexto) {
  ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.y = PAGE_HEIGHT - MARGIN;
  ctx.pageNum += 1;
}

function asegurarEspacio(ctx: Contexto, alturaNecesaria: number) {
  if (ctx.y - alturaNecesaria < MARGIN + 30) {
    nuevaPagina(ctx);
  }
}

function linea(
  ctx: Contexto,
  texto: string,
  opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number; gap?: number } = {},
) {
  const size = opts.size ?? 10;
  const font = opts.font ?? ctx.fontRegular;
  asegurarEspacio(ctx, size + (opts.gap ?? 4));
  ctx.page.drawText(texto, {
    x: opts.x ?? MARGIN,
    y: ctx.y - size,
    size,
    font,
    color: opts.color ?? COLOR_INK,
  });
  ctx.y -= size + (opts.gap ?? 4);
}

export async function generarPresupuestoPdf(params: {
  presupuesto: Presupuesto;
  obra: Obra;
  cliente: Cliente;
  perfil: Perfil;
  capitulos: Capitulo[];
  partidas: Partida[];
  locale: Locale;
}): Promise<Uint8Array> {
  const { presupuesto, obra, cliente, perfil, capitulos, partidas, locale } = params;
  const t = textos(locale);
  const moneda = formatoMoneda(locale);
  const fecha = formatoFecha(locale);

  const doc = await PDFDocument.create();
  doc.setTitle(`${t.quote} ${presupuesto.numero} — ${obra.nombre}`);
  doc.setProducer("Presurapi");

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

  const ctx: Contexto = {
    doc,
    page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    y: PAGE_HEIGHT - MARGIN,
    fontRegular,
    fontBold,
    fontItalic,
    pageNum: 1,
  };

  // --- Cabecera: logo + nombre de empresa a la izquierda, nº/fecha a la derecha ---
  let logoAltura = 0;
  if (perfil.logo_data_url) {
    const mime = mimeDeDataUrl(perfil.logo_data_url);
    try {
      const bytes = Uint8Array.from(
        atob(perfil.logo_data_url.split(",")[1] ?? ""),
        (c) => c.charCodeAt(0),
      );
      const imagen =
        mime === "image/png"
          ? await doc.embedPng(bytes)
          : mime === "image/jpeg"
            ? await doc.embedJpg(bytes)
            : null;
      if (imagen) {
        const alturaObjetivo = 48;
        const escala = alturaObjetivo / imagen.height;
        ctx.page.drawImage(imagen, {
          x: MARGIN,
          y: ctx.y - alturaObjetivo,
          width: imagen.width * escala,
          height: alturaObjetivo,
        });
        logoAltura = alturaObjetivo + 8;
      }
    } catch {
      // Logo no embebible (SVG/WebP u otro problema de formato): se omite,
      // el resto del PDF se genera igual.
    }
  }

  const xDerecha = PAGE_WIDTH - MARGIN;
  ctx.page.drawText(`${t.quote} ${t.no} ${presupuesto.numero}`, {
    x: xDerecha - fontBold.widthOfTextAtSize(`${t.quote} ${t.no} ${presupuesto.numero}`, 14),
    y: ctx.y - 14,
    size: 14,
    font: fontBold,
    color: COLOR_INK,
  });
  const fechaTexto = fecha.format(new Date(presupuesto.created_at));
  ctx.page.drawText(fechaTexto, {
    x: xDerecha - fontRegular.widthOfTextAtSize(fechaTexto, 10),
    y: ctx.y - 32,
    size: 10,
    font: fontRegular,
    color: COLOR_MUTED,
  });
  const estadoTexto = t.status[presupuesto.estado];
  ctx.page.drawText(estadoTexto, {
    x: xDerecha - fontRegular.widthOfTextAtSize(estadoTexto, 10),
    y: ctx.y - 46,
    size: 10,
    font: fontRegular,
    color: COLOR_BRASS,
  });

  ctx.y -= Math.max(logoAltura, 60);
  if (perfil.nombre_empresa) {
    linea(ctx, perfil.nombre_empresa, { size: 13, font: fontBold });
    [perfil.nif_empresa, perfil.direccion_empresa, perfil.telefono_empresa, perfil.email_empresa]
      .filter(Boolean)
      .forEach((texto) => linea(ctx, texto, { size: 9, color: COLOR_MUTED, gap: 2 }));
  } else {
    linea(ctx, t.pendingCompany, { size: 9, font: fontItalic, color: COLOR_MUTED });
  }

  ctx.y -= 10;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: xDerecha, y: ctx.y },
    thickness: 0.75,
    color: COLOR_BORDER,
  });
  ctx.y -= 18;

  // --- Cliente y obra, a dos columnas ---
  const colAncho = CONTENT_WIDTH / 2 - 10;
  const yInicioColumnas = ctx.y;

  ctx.page.drawText(t.client.toUpperCase(), {
    x: MARGIN,
    y: ctx.y - 9,
    size: 8,
    font: fontBold,
    color: COLOR_MUTED,
  });
  let yCliente = ctx.y - 24;
  [cliente.nombre, cliente.nif, cliente.direccion, cliente.email, cliente.telefono]
    .filter(Boolean)
    .forEach((texto) => {
      ctx.page.drawText(texto, { x: MARGIN, y: yCliente, size: 10, font: fontRegular, color: COLOR_INK });
      yCliente -= 14;
    });

  const xObra = MARGIN + colAncho + 20;
  ctx.page.drawText(t.project.toUpperCase(), {
    x: xObra,
    y: yInicioColumnas - 9,
    size: 8,
    font: fontBold,
    color: COLOR_MUTED,
  });
  let yObra = yInicioColumnas - 24;
  [obra.nombre, obra.direccion].filter(Boolean).forEach((texto) => {
    ctx.page.drawText(texto, { x: xObra, y: yObra, size: 10, font: fontRegular, color: COLOR_INK });
    yObra -= 14;
  });

  ctx.y = Math.min(yCliente, yObra) - 20;

  // --- Capítulos y partidas ---
  const colDescripcion = MARGIN;
  const colMedicion = MARGIN + CONTENT_WIDTH - 230;
  const colPrecio = MARGIN + CONTENT_WIDTH - 150;
  const colImporte = MARGIN + CONTENT_WIDTH - 70;

  for (const capitulo of [...capitulos].sort((a, b) => a.posicion - b.posicion)) {
    const partidasCapitulo = partidas
      .filter((p) => p.capitulo_id === capitulo.id)
      .sort((a, b) => a.posicion - b.posicion);
    if (partidasCapitulo.length === 0) continue;

    asegurarEspacio(ctx, 50);
    linea(ctx, capitulo.nombre, { size: 12, font: fontBold, color: COLOR_BRASS, gap: 8 });

    ctx.page.drawText(t.description, { x: colDescripcion, y: ctx.y - 8, size: 8, font: fontBold, color: COLOR_MUTED });
    ctx.page.drawText(t.measurement, { x: colMedicion, y: ctx.y - 8, size: 8, font: fontBold, color: COLOR_MUTED });
    ctx.page.drawText(t.unitPrice, { x: colPrecio, y: ctx.y - 8, size: 8, font: fontBold, color: COLOR_MUTED });
    ctx.page.drawText(t.amount, { x: colImporte, y: ctx.y - 8, size: 8, font: fontBold, color: COLOR_MUTED });
    ctx.y -= 14;
    ctx.page.drawLine({
      start: { x: MARGIN, y: ctx.y },
      end: { x: xDerecha, y: ctx.y },
      thickness: 0.5,
      color: COLOR_BORDER,
    });
    ctx.y -= 12;

    for (const partida of partidasCapitulo) {
      asegurarEspacio(ctx, 16);
      ctx.page.drawText(partida.descripcion, { x: colDescripcion, y: ctx.y, size: 9.5, font: fontRegular, color: COLOR_INK, maxWidth: colMedicion - colDescripcion - 10 });
      ctx.page.drawText(`${partida.medicion} ${partida.unidad}`, { x: colMedicion, y: ctx.y, size: 9.5, font: fontRegular, color: COLOR_INK });
      ctx.page.drawText(moneda.format(partida.precio_unitario), { x: colPrecio, y: ctx.y, size: 9.5, font: fontRegular, color: COLOR_INK });
      ctx.page.drawText(moneda.format(partida.importe), { x: colImporte, y: ctx.y, size: 9.5, font: fontBold, color: COLOR_INK });
      ctx.y -= 16;
    }
    ctx.y -= 10;
  }

  // --- Resumen de totales ---
  asegurarEspacio(ctx, 140);
  ctx.y -= 6;
  ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y }, end: { x: xDerecha, y: ctx.y }, thickness: 0.75, color: COLOR_BORDER });
  ctx.y -= 18;

  const filaResumen = (etiqueta: string, valor: number, destacado = false) => {
    asegurarEspacio(ctx, 18);
    const size = destacado ? 13 : 10;
    const font = destacado ? fontBold : fontRegular;
    const color = destacado ? COLOR_BRASS : COLOR_INK;
    ctx.page.drawText(etiqueta, { x: xDerecha - 260, y: ctx.y, size, font, color: destacado ? color : COLOR_MUTED });
    const textoValor = moneda.format(valor);
    ctx.page.drawText(textoValor, {
      x: xDerecha - font.widthOfTextAtSize(textoValor, size),
      y: ctx.y,
      size,
      font,
      color,
    });
    ctx.y -= destacado ? 22 : 16;
  };

  filaResumen(t.subtotalMaterials, presupuesto.subtotal_materiales);
  filaResumen(t.subtotalLabor, presupuesto.subtotal_mano_obra);
  filaResumen(`${t.overheads} (${presupuesto.gastos_generales_pct}%)`, presupuesto.gastos_generales_importe);
  filaResumen(`${t.profit} (${presupuesto.beneficio_industrial_pct}%)`, presupuesto.beneficio_industrial_importe);
  filaResumen(t.base, presupuesto.base_imponible);
  filaResumen(`${t.vat} (${presupuesto.iva_pct}%)`, presupuesto.iva_importe);
  ctx.y -= 4;
  ctx.page.drawLine({ start: { x: xDerecha - 260, y: ctx.y }, end: { x: xDerecha, y: ctx.y }, thickness: 1, color: COLOR_BRASS });
  ctx.y -= 18;
  filaResumen(t.total, presupuesto.total, true);

  if (presupuesto.notas.trim()) {
    ctx.y -= 10;
    asegurarEspacio(ctx, 40);
    linea(ctx, t.notes.toUpperCase(), { size: 8, font: fontBold, color: COLOR_MUTED, gap: 6 });
    linea(ctx, presupuesto.notas, { size: 9.5, color: COLOR_INK });
  }

  // --- Pie legal en cada página ---
  const paginas = doc.getPages();
  paginas.forEach((pagina, indice) => {
    pagina.drawText(t.guideline, {
      x: MARGIN,
      y: 28,
      size: 7,
      font: fontItalic,
      color: COLOR_MUTED,
      maxWidth: CONTENT_WIDTH - 80,
    });
    const piePagina = `${t.page} ${indice + 1} ${t.of} ${paginas.length}`;
    pagina.drawText(piePagina, {
      x: PAGE_WIDTH - MARGIN - fontRegular.widthOfTextAtSize(piePagina, 8),
      y: 28,
      size: 8,
      font: fontRegular,
      color: COLOR_MUTED,
    });
  });

  return doc.save();
}

export function descargarPdf(bytes: Uint8Array, nombreArchivo: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
