/**
 * Motor canónico de cálculo de Presurapi.
 *
 * REGLAS FUNDAMENTALES:
 * 1. Todos los importes monetarios se manejan y almacenan como céntimos enteros (integer)
 *    para evitar errores de coma flotante de JavaScript.
 * 2. El redondeo se efectúa con Math.round sobre cada línea antes de totalizar.
 * 3. El semáforo de rentabilidad es PRIVADO del albañil (nunca se envía al cliente final):
 *    - Verde: Margen >= 30%
 *    - Ámbar: Margen entre 15% y 29.9%
 *    - Rojo: Margen < 15%
 */

export interface LineaCalculo {
  id?: string;
  cantidad: number;
  precioUnitario: number; // En céntimos
  costeUnitario: number;  // En céntimos
  esOpcional: boolean;
}

export interface TotalesOpcion {
  /** Importe venta base (líneas no opcionales) en céntimos */
  subtotalBaseVenta: number;
  /** Importe venta de líneas opcionales en céntimos */
  subtotalOpcionalesVenta: number;
  /** Coste estimado base en céntimos */
  subtotalBaseCoste: number;
  /** Coste estimado de líneas opcionales en céntimos */
  subtotalOpcionalesCoste: number;
  /** Descuento aplicado en céntimos */
  descuentoCents: number;
  /** Base imponible (subtotalBaseVenta - descuento) en céntimos */
  baseImponible: number;
  /** Cuota de IVA en céntimos */
  ivaCents: number;
  /** Retención IRPF (si aplica) en céntimos */
  retencionCents: number;
  /** Total a pagar (Base imponible + IVA - Retención) en céntimos */
  totalPresupuesto: number;
  /** Beneficio bruto estimado (subtotalBaseVenta - subtotalBaseCoste) en céntimos */
  beneficioBruto: number;
  /** Porcentaje de margen sobre venta: (beneficio / venta) * 100 */
  margenPct: number;
  /** Semáforo de rentabilidad */
  semaforo: "verde" | "ambar" | "rojo";
}

/** Redondea a céntimo entero */
export function redondearCentimos(valor: number): number {
  return Math.round(valor);
}

/** Calcula el importe total de venta de una línea en céntimos */
export function calcularImporteLinea(cantidad: number, precioUnitarioCentimos: number): number {
  return Math.round(cantidad * precioUnitarioCentimos);
}

/** Calcula el coste total de una línea en céntimos */
export function calcularCosteLinea(cantidad: number, costeUnitarioCentimos: number): number {
  return Math.round(cantidad * costeUnitarioCentimos);
}

/**
 * Calcula los totales completos de una opción o presupuesto.
 */
export function calcularTotales(
  lineas: LineaCalculo[],
  config: {
    ivaPct?: number;        // Por defecto 21
    retencionPct?: number;  // Por defecto 0
    descuentoPct?: number;  // Por defecto 0
  } = {},
): TotalesOpcion {
  const ivaPct = config.ivaPct ?? 21;
  const retencionPct = config.retencionPct ?? 0;
  const descuentoPct = config.descuentoPct ?? 0;

  let subtotalBaseVenta = 0;
  let subtotalOpcionalesVenta = 0;
  let subtotalBaseCoste = 0;
  let subtotalOpcionalesCoste = 0;

  for (const l of lineas) {
    const venta = calcularImporteLinea(l.cantidad, l.precioUnitario);
    const coste = calcularCosteLinea(l.cantidad, l.costeUnitario);

    if (l.esOpcional) {
      subtotalOpcionalesVenta += venta;
      subtotalOpcionalesCoste += coste;
    } else {
      subtotalBaseVenta += venta;
      subtotalBaseCoste += coste;
    }
  }

  // Descuento sobre la base de venta principal
  const descuentoCents =
    descuentoPct > 0 ? Math.round((subtotalBaseVenta * descuentoPct) / 100) : 0;
  const baseImponible = Math.max(0, subtotalBaseVenta - descuentoCents);

  const ivaCents = Math.round((baseImponible * ivaPct) / 100);
  const retencionCents =
    retencionPct > 0 ? Math.round((baseImponible * retencionPct) / 100) : 0;

  const totalPresupuesto = baseImponible + ivaCents - retencionCents;
  const beneficioBruto = subtotalBaseVenta - subtotalBaseCoste;

  const margenPct =
    subtotalBaseVenta > 0
      ? Number(((beneficioBruto / subtotalBaseVenta) * 100).toFixed(1))
      : 0;

  let semaforo: "verde" | "ambar" | "rojo" = "verde";
  if (margenPct < 15) {
    semaforo = "rojo";
  } else if (margenPct < 30) {
    semaforo = "ambar";
  }

  return {
    subtotalBaseVenta,
    subtotalOpcionalesVenta,
    subtotalBaseCoste,
    subtotalOpcionalesCoste,
    descuentoCents,
    baseImponible,
    ivaCents,
    retencionCents,
    totalPresupuesto,
    beneficioBruto,
    margenPct,
    semaforo,
  };
}

/** Formatea céntimos a cadena en euros con formato español (ej: 1.250,50 €) */
export function formatearEuros(centimos: number): string {
  const euros = centimos / 100;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(euros);
}

/** Convierte euros (número o cadena con coma/punto) a céntimos enteros */
export function eurosACentimos(euros: number | string): number {
  if (typeof euros === "number") {
    return Math.round(euros * 100);
  }
  let limpio = euros.trim().replace(/\s/g, "");
  // Si contiene tanto punto como coma, el punto es separador de miles y la coma decimal
  if (limpio.includes(".") && limpio.includes(",")) {
    limpio = limpio.replace(/\./g, "").replace(",", ".");
  } else if (limpio.includes(",")) {
    // Si solo tiene coma, es decimal
    limpio = limpio.replace(",", ".");
  }
  const num = parseFloat(limpio);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

/** Convierte céntimos a euros en número decimal */
export function centimosAEuros(centimos: number): number {
  return Number((centimos / 100).toFixed(2));
}
