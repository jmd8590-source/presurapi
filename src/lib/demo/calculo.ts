// Cálculo de partidas y totales de presupuesto.
//
// Funciones puras: no dependen de localStorage ni de Appwrite, así que
// sirven igual en la demo y el día que haya base de datos real (la lógica
// de negocio no cambia, solo de dónde vienen los datos).
import { getMaterial, getTrabajo } from "./catalog";
import type {
  Partida,
  PartidaManoObraLinea,
  PartidaMaterialLinea,
  Perfil,
  PrecioMaterialUsuario,
} from "./types";

// Igual que gastos_generales_pct/beneficio_industrial_pct/iva_pct en el
// perfil: valores de partida habituales en España, editables por el usuario.
export const PRECIO_HORA_OFICIAL_DEFECTO = 18;
export const PRECIO_HORA_PEON_DEFECTO = 14;

export function precioMaterial(nombre: string, preciosUsuario: PrecioMaterialUsuario[]): number {
  const propio = preciosUsuario.find((p) => p.material_nombre === nombre);
  if (propio) return propio.precio;
  const catalogo = getMaterial(nombre);
  return catalogo?.precio_referencia ?? 0;
}

export function precioHoraOficial(perfil: Perfil): number {
  return perfil.precio_hora_oficial ?? PRECIO_HORA_OFICIAL_DEFECTO;
}

export function precioHoraPeon(perfil: Perfil): number {
  return perfil.precio_hora_peon ?? PRECIO_HORA_PEON_DEFECTO;
}

export interface DesglosePartida {
  materiales: PartidaMaterialLinea[];
  mano_obra: PartidaManoObraLinea[];
  importe_materiales: number;
  importe_mano_obra: number;
  precio_unitario: number;
  importe: number;
}

const redondea = (n: number) => Math.round(n * 100) / 100;

export function calcularPartidaDesdeTrabajo(
  trabajoSlug: string,
  medicion: number,
  perfil: Perfil,
  preciosUsuario: PrecioMaterialUsuario[],
): DesglosePartida | null {
  const trabajo = getTrabajo(trabajoSlug);
  if (!trabajo) return null;

  const materiales: PartidaMaterialLinea[] = trabajo.materiales.map((receta) => {
    const precio_unitario = precioMaterial(receta.material_nombre, preciosUsuario);
    const cantidad = redondea(receta.cantidad_por_unidad * medicion);
    return {
      material_nombre: receta.material_nombre,
      cantidad,
      precio_unitario,
      importe: redondea(cantidad * precio_unitario),
    };
  });

  const tarifas = { oficial: precioHoraOficial(perfil), peon: precioHoraPeon(perfil) };
  const mano_obra: PartidaManoObraLinea[] = trabajo.mano_obra.map((linea) => {
    const horas = redondea(linea.horas_por_unidad * medicion);
    const precio_hora = tarifas[linea.rol];
    return {
      rol: linea.rol,
      horas,
      precio_hora,
      importe: redondea(horas * precio_hora),
    };
  });

  const importe_materiales = redondea(materiales.reduce((acc, m) => acc + m.importe, 0));
  const importe_mano_obra = redondea(mano_obra.reduce((acc, m) => acc + m.importe, 0));
  const importe = redondea(importe_materiales + importe_mano_obra);

  return {
    materiales,
    mano_obra,
    importe_materiales,
    importe_mano_obra,
    precio_unitario: medicion > 0 ? redondea(importe / medicion) : 0,
    importe,
  };
}

export interface TotalesPresupuesto {
  subtotal_materiales: number;
  subtotal_mano_obra: number;
  gastos_generales_importe: number;
  beneficio_industrial_importe: number;
  base_imponible: number;
  iva_importe: number;
  total: number;
}

export function calcularTotalesPresupuesto(
  partidas: Pick<Partida, "importe_materiales" | "importe_mano_obra">[],
  gastosGeneralesPct: number,
  beneficioIndustrialPct: number,
  ivaPct: number,
): TotalesPresupuesto {
  const subtotal_materiales = redondea(
    partidas.reduce((acc, p) => acc + p.importe_materiales, 0),
  );
  const subtotal_mano_obra = redondea(partidas.reduce((acc, p) => acc + p.importe_mano_obra, 0));
  const subtotalEjecucionMaterial = redondea(subtotal_materiales + subtotal_mano_obra);

  const gastos_generales_importe = redondea(
    (subtotalEjecucionMaterial * gastosGeneralesPct) / 100,
  );
  const beneficio_industrial_importe = redondea(
    (subtotalEjecucionMaterial * beneficioIndustrialPct) / 100,
  );
  const base_imponible = redondea(
    subtotalEjecucionMaterial + gastos_generales_importe + beneficio_industrial_importe,
  );
  const iva_importe = redondea((base_imponible * ivaPct) / 100);
  const total = redondea(base_imponible + iva_importe);

  return {
    subtotal_materiales,
    subtotal_mano_obra,
    gastos_generales_importe,
    beneficio_industrial_importe,
    base_imponible,
    iva_importe,
    total,
  };
}
