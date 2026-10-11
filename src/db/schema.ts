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
