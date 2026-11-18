// Banco de precios y catálogo de trabajos de la demo.
//
// Mismos datos que las colecciones `materiales`/`trabajos` descritas en
// appwrite/DISENO.md, porteados a TypeScript porque en modo demo no hay
// base de datos. Cuando se conecte Appwrite, este catálogo se sustituye por
// una consulta a esas colecciones.
import type { RolManoObra, UnidadMaterial, UnidadTrabajo } from "./types";

export interface Material {
  nombre: string;
  unidad: UnidadMaterial;
  precio_referencia: number;
  fuente: string;
  fecha_actualizacion: string;
  categoria: string;
}

export interface TrabajoReceta {
  material_nombre: string;
  cantidad_por_unidad: number;
}

export interface TrabajoManoObra {
  rol: RolManoObra;
  horas_por_unidad: number;
}

export interface Trabajo {
  slug: string;
  nombre: string;
  unidad: UnidadTrabajo;
  descripcion: string;
  materiales: TrabajoReceta[];
  mano_obra: TrabajoManoObra[];
}

const FUENTE = "Estimación orientativa interna — Presurapi";
const FECHA = "2026-11-17";

export const MATERIALES: Material[] = [
  {
    nombre: "Ladrillo hueco doble 24x11,5x7 cm",
    unidad: "ud",
    precio_referencia: 0.22,
    fuente: FUENTE,
    fecha_actualizacion: FECHA,
    categoria: "Albañilería",
  },
  {
    nombre: "Mortero de cemento premezclado, saco 25 kg",
    unidad: "saco",
    precio_referencia: 7.9,
    fuente: FUENTE,
    fecha_actualizacion: FECHA,
    categoria: "Albañilería",
  },
  {
    nombre: "Yeso de enlucir, saco 25 kg",
    unidad: "saco",
    precio_referencia: 8.5,
    fuente: FUENTE,
    fecha_actualizacion: FECHA,
    categoria: "Revestimientos",
  },
  {
    nombre: "Azulejo cerámico 20x20 cm",
    unidad: "m2",
    precio_referencia: 9.9,
    fuente: FUENTE,
    fecha_actualizacion: FECHA,
    categoria: "Alicatados",
  },
  {
    nombre: "Gres porcelánico 60x60 cm",
    unidad: "m2",
    precio_referencia: 14.9,
    fuente: FUENTE,
    fecha_actualizacion: FECHA,
    categoria: "Solados",
  },
  {
    nombre: "Cemento cola, saco 25 kg",
    unidad: "saco",
    precio_referencia: 11.5,
    fuente: FUENTE,
    fecha_actualizacion: FECHA,
    categoria: "Solados y alicatados",
  },
  {
    nombre: "Junta de alicatado/solado",
    unidad: "kg",
    precio_referencia: 2.1,
    fuente: FUENTE,
    fecha_actualizacion: FECHA,
    categoria: "Solados y alicatados",
  },
  {
    nombre: "Pintura plástica blanca mate",
    unidad: "l",
    precio_referencia: 4.2,
    fuente: FUENTE,
    fecha_actualizacion: FECHA,
    categoria: "Pintura",
  },
  {
    nombre: "Imprimación selladora",
    unidad: "l",
    precio_referencia: 5.8,
    fuente: FUENTE,
    fecha_actualizacion: FECHA,
    categoria: "Pintura",
  },
];

export const TRABAJOS: Trabajo[] = [
  {
    slug: "tabique_ladrillo_hueco_7",
    nombre: "Tabique de ladrillo hueco doble (7 cm)",
    unidad: "m2",
    descripcion:
      "Fábrica de ladrillo hueco doble tomado con mortero, incluso replanteo y aplomado.",
    materiales: [
      { material_nombre: "Ladrillo hueco doble 24x11,5x7 cm", cantidad_por_unidad: 28.0 },
      {
        material_nombre: "Mortero de cemento premezclado, saco 25 kg",
        cantidad_por_unidad: 0.15,
      },
    ],
    mano_obra: [
      { rol: "oficial", horas_por_unidad: 0.35 },
      { rol: "peon", horas_por_unidad: 0.35 },
    ],
  },
  {
    slug: "enfoscado_maestreado",
    nombre: "Enfoscado maestreado y fratasado",
    unidad: "m2",
    descripcion:
      "Enfoscado de mortero de cemento, maestreado y fratasado, sobre fábrica de ladrillo.",
    materiales: [
      {
        material_nombre: "Mortero de cemento premezclado, saco 25 kg",
        cantidad_por_unidad: 0.12,
      },
    ],
    mano_obra: [
      { rol: "oficial", horas_por_unidad: 0.3 },
      { rol: "peon", horas_por_unidad: 0.2 },
    ],
  },
  {
    slug: "enlucido_yeso",
    nombre: "Enlucido de yeso",
    unidad: "m2",
    descripcion: "Enlucido de yeso sobre guarnecido, acabado liso.",
    materiales: [{ material_nombre: "Yeso de enlucir, saco 25 kg", cantidad_por_unidad: 0.3 }],
    mano_obra: [
      { rol: "oficial", horas_por_unidad: 0.25 },
      { rol: "peon", horas_por_unidad: 0.1 },
    ],
  },
  {
    slug: "alicatado_20x20",
    nombre: "Alicatado con azulejo (20x20 cm)",
    unidad: "m2",
    descripcion:
      "Alicatado con azulejo cerámico 20x20 cm recibido con cemento cola, rejuntado.",
    materiales: [
      { material_nombre: "Azulejo cerámico 20x20 cm", cantidad_por_unidad: 1.05 },
      { material_nombre: "Cemento cola, saco 25 kg", cantidad_por_unidad: 0.2 },
      { material_nombre: "Junta de alicatado/solado", cantidad_por_unidad: 0.5 },
    ],
    mano_obra: [
      { rol: "oficial", horas_por_unidad: 0.55 },
      { rol: "peon", horas_por_unidad: 0.25 },
    ],
  },
  {
    slug: "solado_gres_60x60",
    nombre: "Solado de gres porcelánico (60x60 cm)",
    unidad: "m2",
    descripcion:
      "Solado con baldosa de gres porcelánico 60x60 cm recibida con cemento cola, rejuntado.",
    materiales: [
      { material_nombre: "Gres porcelánico 60x60 cm", cantidad_por_unidad: 1.08 },
      { material_nombre: "Cemento cola, saco 25 kg", cantidad_por_unidad: 0.22 },
      { material_nombre: "Junta de alicatado/solado", cantidad_por_unidad: 0.3 },
    ],
    mano_obra: [
      { rol: "oficial", horas_por_unidad: 0.45 },
      { rol: "peon", horas_por_unidad: 0.2 },
    ],
  },
  {
    slug: "pintura_plastica",
    nombre: "Pintura plástica (dos manos)",
    unidad: "m2",
    descripcion:
      "Pintura plástica lisa en dos manos sobre paramento, incluso imprimación selladora.",
    materiales: [
      { material_nombre: "Pintura plástica blanca mate", cantidad_por_unidad: 0.2 },
      { material_nombre: "Imprimación selladora", cantidad_por_unidad: 0.1 },
    ],
    mano_obra: [{ rol: "oficial", horas_por_unidad: 0.15 }],
  },
];

export function getMaterial(nombre: string): Material | undefined {
  return MATERIALES.find((m) => m.nombre === nombre);
}

export function getTrabajo(slug: string): Trabajo | undefined {
  return TRABAJOS.find((t) => t.slug === slug);
}
