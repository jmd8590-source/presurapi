// Tipos de la capa de datos de demostración.
//
// Los nombres de campo imitan a propósito los atributos descritos en
// appwrite/DISENO.md (snake_case) en vez del camelCase habitual en TS: así,
// cuando se conecte Appwrite, sustituir este módulo por llamadas reales no
// obliga a renombrar nada en los componentes que ya consumen estos datos.

export type Idioma = "es" | "en";
export type UnidadMaterial = "m2" | "ml" | "ud" | "kg" | "l" | "saco" | "h";
export type UnidadTrabajo = "m2" | "ml" | "ud";
export type UnidadPartida = "m2" | "ml" | "ud" | "h";
export type RolManoObra = "oficial" | "peon";
export type EstadoCliente = "activo" | "archivado";
export type EstadoObra = "activa" | "archivada";
export type EstadoPresupuesto = "borrador" | "enviado" | "aceptado" | "rechazado";

export interface Perfil {
  nombre_empresa: string;
  nif_empresa: string;
  direccion_empresa: string;
  telefono_empresa: string;
  email_empresa: string;
  logo_data_url: string | null;
  precio_hora_oficial: number | null;
  precio_hora_peon: number | null;
  gastos_generales_pct: number;
  beneficio_industrial_pct: number;
  iva_pct: number;
  idioma: Idioma;
  email_cuenta: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  nif: string;
  email: string;
  telefono: string;
  direccion: string;
  notas: string;
  estado: EstadoCliente;
  created_at: string;
  updated_at: string;
}

export interface Obra {
  id: string;
  cliente_id: string;
  nombre: string;
  direccion: string;
  descripcion: string;
  estado: EstadoObra;
  created_at: string;
  updated_at: string;
}

export interface PartidaMaterialLinea {
  material_nombre: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
}

export interface PartidaManoObraLinea {
  rol: RolManoObra;
  horas: number;
  precio_hora: number;
  importe: number;
}

export interface Partida {
  id: string;
  capitulo_id: string;
  trabajo_slug: string | null;
  descripcion: string;
  unidad: UnidadPartida;
  medicion: number;
  materiales: PartidaMaterialLinea[];
  mano_obra: PartidaManoObraLinea[];
  importe_materiales: number;
  importe_mano_obra: number;
  precio_unitario: number;
  importe: number;
  posicion: number;
}

export interface Capitulo {
  id: string;
  presupuesto_id: string;
  nombre: string;
  posicion: number;
}

export interface Presupuesto {
  id: string;
  obra_id: string;
  numero: number;
  estado: EstadoPresupuesto;
  precio_hora_oficial: number;
  precio_hora_peon: number;
  gastos_generales_pct: number;
  beneficio_industrial_pct: number;
  iva_pct: number;
  subtotal_materiales: number;
  subtotal_mano_obra: number;
  gastos_generales_importe: number;
  beneficio_industrial_importe: number;
  base_imponible: number;
  iva_importe: number;
  total: number;
  notas: string;
  created_at: string;
  updated_at: string;
}

export interface PrecioMaterialUsuario {
  material_nombre: string;
  precio: number;
}

export interface DemoDb {
  perfil: Perfil;
  clientes: Cliente[];
  obras: Obra[];
  presupuestos: Presupuesto[];
  capitulos: Capitulo[];
  partidas: Partida[];
  precios_usuario: PrecioMaterialUsuario[];
}
