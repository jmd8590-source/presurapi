/**
 * Construcción del PDF y del correo a partir de un presupuesto.
 * Compartido por el endpoint del panel, el público y la acción de envío.
 */
import { generarPdfPresupuesto, type PdfEmpresa, type PdfPresupuesto } from "@/lib/pdf";

type Empresa = PdfEmpresa & { id?: string };

/** Datos mínimos de un presupuesto (completo o público) para el PDF. Los costes no se usan en el PDF. */
export function aPdfPresupuesto(p: {
  codigo: string;
  titulo: string;
  fechaEmision: Date;
  validezDias: number;
  ivaPct: number;
  retencionPct: number;
  descuentoPct: number;
  condiciones: string;
  notasCliente: string;
  cliente: { nombre: string; nif?: string; email?: string; telefono?: string; direccion?: string };
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
      costeUnitario?: number;
      esOpcional: boolean;
    }>;
  }>;
}): PdfPresupuesto {
  return {
    codigo: p.codigo,
    titulo: p.titulo,
    fechaEmision: p.fechaEmision,
    validezDias: p.validezDias,
    ivaPct: p.ivaPct,
    retencionPct: p.retencionPct,
    descuentoPct: p.descuentoPct,
    condiciones: p.condiciones,
    notasCliente: p.notasCliente,
    cliente: {
      nombre: p.cliente.nombre,
      nif: p.cliente.nif ?? "",
      email: p.cliente.email ?? "",
      telefono: p.cliente.telefono ?? "",
      direccion: p.cliente.direccion ?? "",
    },
    obra: p.obra,
    opciones: p.opciones.map((o) => ({
      id: o.id,
      nombre: o.nombre,
      lineas: o.lineas.map((l) => ({ ...l, costeUnitario: l.costeUnitario ?? 0 })),
    })),
  };
}

export async function pdfDe(empresa: Empresa, p: Parameters<typeof aPdfPresupuesto>[0]): Promise<Uint8Array> {
  return generarPdfPresupuesto(empresa, aPdfPresupuesto(p));
}

export function pdfResponse(bytes: Uint8Array, filename: string): Response {
  return new Response(bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename.replace(/[^\w.\-]/g, "_")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
