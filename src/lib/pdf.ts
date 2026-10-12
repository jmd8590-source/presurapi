/**
 * Generación del PDF del presupuesto en el propio Worker (pdf-lib, JS puro).
 * El PDF es el documento para el cliente: NUNCA incluye costes ni márgenes.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { calcularTotales, calcularImporteLinea, formatearEuros } from "@/lib/calculo";

export type PdfEmpresa = {
  nombre: string;
  cif: string;
  direccion: string;
  cp: string;
  poblacion: string;
  provincia: string;
  telefono: string;
  emailContacto: string;
  piePdf: string;
};

export type PdfPresupuesto = {
  codigo: string;
  titulo: string;
  fechaEmision: Date;
  validezDias: number;
  ivaPct: number;
  retencionPct: number;
  descuentoPct: number;
  condiciones: string;
  notasCliente: string;
  cliente: { nombre: string; nif: string; email: string; telefono: string; direccion: string };
  obra: { nombre: string; direccion: string } | null;
  opciones: Array<{
    id: string;
    nombre: string;
    lineas: Array<{
      concepto: string;
      descripcion: string;
      unidad: string;
      cantidad: number;
      precioUnitario: number;
      costeUnitario: number;
      esOpcional: boolean;
    }>;
  }>;
};

const ACCENT = rgb(0.788, 0.541, 0.106); // #C98A1B
const INK = rgb(0.169, 0.149, 0.125);
const MUTED = rgb(0.42, 0.38, 0.33);
const LINE = rgb(0.86, 0.82, 0.74);

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 48;

/** pdf-lib con fuentes estándar solo admite WinAnsi: se sustituye lo demás. */
function clean(s: string): string {
  return (s ?? "")
    .replace(/[\r\t]/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\n\x20-\x7E\xA0-\xFF\u20AC]/g, "?");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of clean(text).split("\n")) {
    const words = para.split(" ");
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) <= maxWidth) {
        line = test;
      } else {
        if (line) out.push(line);
        line = w;
      }
    }
    out.push(line);
  }
  return out;
}

function fmtFecha(d: Date): string {
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

export async function generarPdfPresupuesto(empresa: PdfEmpresa, p: PdfPresupuesto): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${p.codigo} - ${p.titulo}`);
  pdf.setProducer("Presurapi");
  pdf.setCreator("Presurapi");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = pdf.addPage(A4);
  let y = A4[1] - MARGIN;
  const W = A4[0] - MARGIN * 2;

  const newPage = () => {
    page = pdf.addPage(A4);
    y = A4[1] - MARGIN;
  };
  const ensure = (h: number) => {
    if (y - h < MARGIN + 30) newPage();
  };
  const text = (s: string, x: number, size = 10, f: PDFFont = font, color = INK) => {
    page.drawText(clean(s), { x, y, size, font: f, color });
  };
  const textRight = (s: string, xRight: number, size = 10, f: PDFFont = font, color = INK) => {
    const c = clean(s);
    page.drawText(c, { x: xRight - f.widthOfTextAtSize(c, size), y, size, font: f, color });
  };
  const rule = (color = LINE, thickness = 0.7) => {
    page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + W, y }, thickness, color });
  };

  // Cabecera: empresa a la izquierda, datos del documento a la derecha.
  page.drawRectangle({ x: 0, y: A4[1] - 10, width: A4[0], height: 10, color: ACCENT });
  y -= 14;
  text(empresa.nombre || "Empresa", MARGIN, 18, bold);
  const docRight = MARGIN + W;
  textRight("PRESUPUESTO", docRight, 18, bold, ACCENT);
  y -= 16;
  const dirEmpresa = [empresa.direccion, [empresa.cp, empresa.poblacion].filter(Boolean).join(" "), empresa.provincia]
    .filter(Boolean)
    .join(", ");
  const datosEmpresa = [empresa.cif && `CIF/NIF: ${empresa.cif}`, dirEmpresa, empresa.telefono && `Tel. ${empresa.telefono}`, empresa.emailContacto]
    .filter(Boolean) as string[];
  const meta = [`N.º ${p.codigo}`, `Fecha: ${fmtFecha(p.fechaEmision)}`, `Validez: ${p.validezDias} días`];
  const rows = Math.max(datosEmpresa.length, meta.length);
  for (let i = 0; i < rows; i++) {
    if (datosEmpresa[i]) text(datosEmpresa[i], MARGIN, 9, font, MUTED);
    if (meta[i]) textRight(meta[i], docRight, 9, font, MUTED);
    y -= 12;
  }
  y -= 6;
  rule(ACCENT, 1.5);
  y -= 20;

  // Cliente y obra
  text("CLIENTE", MARGIN, 8, bold, MUTED);
  if (p.obra) text("OBRA", MARGIN + W / 2, 8, bold, MUTED);
  y -= 13;
  text(p.cliente.nombre, MARGIN, 11, bold);
  if (p.obra) text(p.obra.nombre, MARGIN + W / 2, 11, bold);
  y -= 13;
  const cliLines = [p.cliente.nif && `NIF/CIF: ${p.cliente.nif}`, p.cliente.direccion, p.cliente.telefono, p.cliente.email].filter(Boolean) as string[];
  const obraLines = p.obra?.direccion ? [p.obra.direccion] : [];
  const n = Math.max(cliLines.length, obraLines.length);
  for (let i = 0; i < n; i++) {
    if (cliLines[i]) text(cliLines[i], MARGIN, 9, font, MUTED);
    if (obraLines[i]) text(obraLines[i], MARGIN + W / 2, 9, font, MUTED);
    y -= 12;
  }
  y -= 10;

  // Título
  for (const l of wrap(p.titulo, bold, 14, W)) {
    ensure(20);
    text(l, MARGIN, 14, bold);
    y -= 19;
  }
  y -= 4;

  // Columnas de la tabla
  const colQty = MARGIN + W - 215;
  const colUnit = MARGIN + W - 150;
  const colPrice = MARGIN + W - 70;
  const colTotal = MARGIN + W;
  const descW = colQty - MARGIN - 52;

  const tableHeader = () => {
    ensure(24);
    page.drawRectangle({ x: MARGIN, y: y - 5, width: W, height: 18, color: rgb(0.96, 0.93, 0.87) });
    text("Concepto", MARGIN + 6, 8.5, bold, MUTED);
    textRight("Cant.", colQty + 28, 8.5, bold, MUTED);
    textRight("Ud.", colUnit + 24, 8.5, bold, MUTED);
    textRight("Precio", colPrice, 8.5, bold, MUTED);
    textRight("Importe", colTotal - 4, 8.5, bold, MUTED);
    y -= 20;
  };

  const multiOpcion = p.opciones.length > 1;

  for (const opc of p.opciones) {
    const t = calcularTotales(opc.lineas, { ivaPct: p.ivaPct, retencionPct: p.retencionPct, descuentoPct: p.descuentoPct });

    ensure(60);
    if (multiOpcion) {
      page.drawRectangle({ x: MARGIN, y: y - 6, width: W, height: 22, color: ACCENT });
      text(`OPCIÓN ${clean(opc.nombre).toUpperCase()}`, MARGIN + 8, 11, bold, rgb(1, 1, 1));
      y -= 28;
    }
    tableHeader();

    for (const l of opc.lineas) {
      const nameLines = wrap(l.concepto + (l.esOpcional ? " (opcional)" : ""), bold, 9, descW);
      const descLines = l.descripcion ? wrap(l.descripcion, font, 8, descW) : [];
      const h = nameLines.length * 11 + descLines.length * 10 + 8;
      if (y - h < MARGIN + 30) {
        newPage();
        tableHeader();
      }
      const top = y;
      for (const ln of nameLines) {
        text(ln, MARGIN + 6, 9, bold);
        y -= 11;
      }
      for (const ln of descLines) {
        text(ln, MARGIN + 6, 8, font, MUTED);
        y -= 10;
      }
      const yEnd = y;
      y = top;
      const importe = calcularImporteLinea(l.cantidad, l.precioUnitario);
      textRight(String(l.cantidad).replace(".", ","), colQty + 28, 9);
      textRight(l.unidad, colUnit + 24, 9);
      textRight(formatearEuros(l.precioUnitario), colPrice, 9);
      textRight(formatearEuros(importe), colTotal - 4, 9, bold);
      y = yEnd - 4;
      rule(LINE, 0.4);
      y -= 6;
    }

    // Totales de la opción
    ensure(110);
    y -= 4;
    const lblX = MARGIN + W - 210;
    const line = (label: string, value: string, strong = false, color = INK) => {
      text(label, lblX, strong ? 11 : 9.5, strong ? bold : font, strong ? INK : MUTED);
      textRight(value, colTotal - 4, strong ? 12 : 9.5, strong ? bold : font, color);
      y -= strong ? 18 : 14;
    };
    line("Subtotal", formatearEuros(t.subtotalBaseVenta));
    if (t.descuentoCents > 0) line(`Descuento (${p.descuentoPct}%)`, `- ${formatearEuros(t.descuentoCents)}`);
    line("Base imponible", formatearEuros(t.baseImponible));
    line(`IVA (${p.ivaPct}%)`, formatearEuros(t.ivaCents));
    if (t.retencionCents > 0) line(`Retención IRPF (${p.retencionPct}%)`, `- ${formatearEuros(t.retencionCents)}`);
    rule(INK, 0.8);
    y -= 14;
    line(multiOpcion ? `TOTAL ${clean(opc.nombre).toUpperCase()}` : "TOTAL", formatearEuros(t.totalPresupuesto), true, ACCENT);
    if (t.subtotalOpcionalesVenta > 0) {
      text(`Partidas opcionales no incluidas: ${formatearEuros(t.subtotalOpcionalesVenta)} + IVA`, lblX - 40, 8.5, font, MUTED);
      y -= 14;
    }
    y -= 14;
  }

  // Condiciones y notas
  const bloque = (titulo: string, cuerpo: string) => {
    if (!cuerpo.trim()) return;
    ensure(40);
    text(titulo, MARGIN, 9, bold, MUTED);
    y -= 13;
    for (const l of wrap(cuerpo, font, 9, W)) {
      ensure(14);
      text(l, MARGIN, 9);
      y -= 12;
    }
    y -= 8;
  };
  bloque("OBSERVACIONES", p.notasCliente);
  bloque("CONDICIONES", p.condiciones);

  // Pie y numeración en todas las páginas
  const pages = pdf.getPages();
  pages.forEach((pg, i) => {
    const foot = clean(empresa.piePdf || "");
    if (foot) {
      pg.drawText(foot, { x: MARGIN, y: 30, size: 8, font, color: MUTED, maxWidth: W - 60 });
    }
    const num = `${i + 1} / ${pages.length}`;
    pg.drawText(num, { x: MARGIN + W - font.widthOfTextAtSize(num, 8), y: 30, size: 8, font, color: MUTED });
  });

  return pdf.save();
}
