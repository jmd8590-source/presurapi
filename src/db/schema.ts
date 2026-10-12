// Esquema de Presurapi (Cloudflare D1 / SQLite).
// Regla de aislamiento: toda tabla con datos de negocio lleva `empresa_id` y
// TODA consulta se filtra por él a través de src/lib/data.ts. Nunca se consulta
// una de estas tablas desde fuera de esa capa.
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const ts = (name: string) => integer(name, { mode: "timestamp_ms" });

export const empresa = sqliteTable("empresa", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull().default(""),
  cif: text("cif").notNull().default(""),
  direccion: text("direccion").notNull().default(""),
  cp: text("cp").notNull().default(""),
  poblacion: text("poblacion").notNull().default(""),
  provincia: text("provincia").notNull().default(""),
  telefono: text("telefono").notNull().default(""),
  emailContacto: text("email_contacto").notNull().default(""),
  /** Clave del logotipo en R2. Vacío si no hay. */
  logoKey: text("logo_key").notNull().default(""),
  ivaPct: real("iva_pct").notNull().default(21),
  condiciones: text("condiciones").notNull().default(""),
  piePdf: text("pie_pdf").notNull().default(""),
  onboardingHecho: integer("onboarding_hecho", { mode: "boolean" }).notNull().default(false),
  creadoEn: ts("creado_en").notNull(),
});

export const usuario = sqliteTable(
  "usuario",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresa.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    nombre: text("nombre").notNull(),
    passwordHash: text("password_hash").notNull(),
    creadoEn: ts("creado_en").notNull(),
  },
  (t) => [uniqueIndex("usuario_email").on(t.email), index("usuario_empresa").on(t.empresaId)],
);

/** `id` es el SHA-256 del token que viaja en la cookie: robar la base no da sesiones. */
export const sesion = sqliteTable(
  "sesion",
  {
    id: text("id").primaryKey(),
    usuarioId: text("usuario_id")
      .notNull()
      .references(() => usuario.id, { onDelete: "cascade" }),
    expiraEn: ts("expira_en").notNull(),
    creadoEn: ts("creado_en").notNull(),
  },
  (t) => [index("sesion_usuario").on(t.usuarioId)],
);

/** Enlace de recuperación de contraseña de un solo uso (se guarda su hash). */
export const tokenReset = sqliteTable(
  "token_reset",
  {
    id: text("id").primaryKey(),
    usuarioId: text("usuario_id")
      .notNull()
      .references(() => usuario.id, { onDelete: "cascade" }),
    expiraEn: ts("expira_en").notNull(),
  },
  (t) => [index("token_reset_usuario").on(t.usuarioId)],
);

/** Límite de intentos (acceso, registro, recuperación). `clave` va ya hasheada. */
export const intentoAcceso = sqliteTable(
  "intento_acceso",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clave: text("clave").notNull(),
    tipo: text("tipo").notNull(),
    ts: ts("ts").notNull(),
  },
  (t) => [index("intento_clave").on(t.tipo, t.clave, t.ts)],
);

export const cliente = sqliteTable(
  "cliente",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresa.id, { onDelete: "cascade" }),
    nombre: text("nombre").notNull(),
    nif: text("nif").notNull().default(""),
    email: text("email").notNull().default(""),
    telefono: text("telefono").notNull().default(""),
    direccion: text("direccion").notNull().default(""),
    notas: text("notas").notNull().default(""),
    creadoEn: ts("creado_en").notNull(),
  },
  (t) => [index("cliente_empresa").on(t.empresaId, t.nombre)],
);

export const ESTADOS_OBRA = ["pendiente", "en_curso", "terminada", "cancelada"] as const;
export type EstadoObra = (typeof ESTADOS_OBRA)[number];

export const obra = sqliteTable(
  "obra",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresa.id, { onDelete: "cascade" }),
    clienteId: text("cliente_id")
      .notNull()
      .references(() => cliente.id),
    nombre: text("nombre").notNull(),
    direccion: text("direccion").notNull().default(""),
    estado: text("estado").notNull().default("pendiente"),
    notas: text("notas").notNull().default(""),
    creadoEn: ts("creado_en").notNull(),
  },
  (t) => [index("obra_empresa").on(t.empresaId, t.creadoEn), index("obra_cliente").on(t.clienteId)],
);

export const capitulo = sqliteTable(
  "capitulo",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id"),
    nombre: text("nombre").notNull(),
    orden: integer("orden").notNull().default(0),
    icono: text("icono").notNull().default(""),
  },
  (t) => [index("capitulo_empresa").on(t.empresaId, t.orden)],
);

export const partida = sqliteTable(
  "partida",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresa.id, { onDelete: "cascade" }),
    capituloId: text("capitulo_id")
      .notNull()
      .references(() => capitulo.id),
    codigo: text("codigo").notNull().default(""),
    concepto: text("concepto").notNull(),
    descripcion: text("descripcion").notNull().default(""),
    unidad: text("unidad").notNull().default("ud"),
    /** En céntimos de euro */
    precioVenta: integer("precio_venta").notNull().default(0),
    /** En céntimos de euro (coste para el albañil: mano de obra + materiales) */
    costeEstimado: integer("coste_estimado").notNull().default(0),
    activo: integer("activo", { mode: "boolean" }).notNull().default(true),
    creadoEn: ts("creado_en").notNull(),
  },
  (t) => [
    index("partida_empresa").on(t.empresaId, t.concepto),
    index("partida_capitulo").on(t.capituloId),
  ],
);

export const ESTADOS_PRESUPUESTO = ["borrador", "enviado", "aceptado", "rechazado", "facturado"] as const;
export type EstadoPresupuesto = (typeof ESTADOS_PRESUPUESTO)[number];

export const presupuesto = sqliteTable(
  "presupuesto",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresa.id, { onDelete: "cascade" }),
    clienteId: text("cliente_id")
      .notNull()
      .references(() => cliente.id),
    obraId: text("obra_id").references(() => obra.id),
    codigo: text("codigo").notNull(),
    titulo: text("titulo").notNull(),
    estado: text("estado").notNull().default("borrador"),
    ivaPct: real("iva_pct").notNull().default(21),
    retencionPct: real("retencion_pct").notNull().default(0),
    descuentoPct: real("descuento_pct").notNull().default(0),
    condiciones: text("condiciones").notNull().default(""),
    validezDias: integer("validez_dias").notNull().default(30),
    fechaEmision: ts("fecha_emision").notNull(),
    notasCliente: text("notas_cliente").notNull().default(""),
    notasInternas: text("notas_internas").notNull().default(""),
    tokenPublico: text("token_publico").notNull(),
    creadoEn: ts("creado_en").notNull(),
    actualizadoEn: ts("actualizado_en").notNull(),
  },
  (t) => [
    index("presupuesto_empresa").on(t.empresaId, t.creadoEn),
    index("presupuesto_cliente").on(t.clienteId),
    uniqueIndex("presupuesto_token").on(t.tokenPublico),
  ],
);

export const opcionPresupuesto = sqliteTable(
  "opcion_presupuesto",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresa.id, { onDelete: "cascade" }),
    presupuestoId: text("presupuesto_id")
      .notNull()
      .references(() => presupuesto.id, { onDelete: "cascade" }),
    nombre: text("nombre").notNull(),
    orden: integer("orden").notNull().default(0),
    esSeleccionada: integer("es_seleccionada", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [
    index("opcion_presupuesto_empresa").on(t.empresaId),
    index("opcion_presupuesto_id").on(t.presupuestoId),
  ],
);

export const lineaPresupuesto = sqliteTable(
  "linea_presupuesto",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresa.id, { onDelete: "cascade" }),
    presupuestoId: text("presupuesto_id")
      .notNull()
      .references(() => presupuesto.id, { onDelete: "cascade" }),
    opcionId: text("opcion_id").notNull(),
    capituloId: text("capitulo_id").notNull().default(""),
    codigoPartida: text("codigo_partida").notNull().default(""),
    concepto: text("concepto").notNull(),
    descripcion: text("descripcion").notNull().default(""),
    unidad: text("unidad").notNull().default("ud"),
    cantidad: real("cantidad").notNull().default(1),
    /** En céntimos de euro */
    precioUnitario: integer("precio_unitario").notNull().default(0),
    /** En céntimos de euro */
    costeUnitario: integer("coste_unitario").notNull().default(0),
    esOpcional: integer("es_opcional", { mode: "boolean" }).notNull().default(false),
    orden: integer("orden").notNull().default(0),
  },
  (t) => [
    index("linea_presupuesto_empresa").on(t.empresaId),
    index("linea_presupuesto_opcion").on(t.presupuestoId, t.opcionId, t.orden),
  ],
);

