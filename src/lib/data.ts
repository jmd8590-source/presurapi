// Capa de datos con AISLAMIENTO POR EMPRESA.
// Todas las funciones reciben el `empresaId` de la sesión y lo aplican en cada
// consulta. Ninguna página ni acción debe consultar estas tablas por su cuenta.
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { EstadoObra } from "@/db/schema";

const { cliente, obra, empresa, usuario, sesion } = schema;

export type ClienteInput = { nombre: string; nif: string; email: string; telefono: string; direccion: string; notas: string };
export type ObraInput = { clienteId: string; nombre: string; direccion: string; estado: EstadoObra; notas: string };

/* ------------------------------------------------------------- clientes */

export async function listClientes(empresaId: string) {
  const db = getDb();
  return db
    .select({
      id: cliente.id,
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      obras: sql<number>`(select count(*) from ${obra} where ${obra.clienteId} = ${cliente.id} and ${obra.empresaId} = ${empresaId})`,
    })
    .from(cliente)
    .where(eq(cliente.empresaId, empresaId))
    .orderBy(cliente.nombre);
}

export async function getCliente(empresaId: string, id: string) {
  const [row] = await getDb()
    .select()
    .from(cliente)
    .where(and(eq(cliente.id, id), eq(cliente.empresaId, empresaId)))
    .limit(1);
  return row ?? null;
}

export async function createCliente(empresaId: string, input: ClienteInput) {
  const id = crypto.randomUUID();
  await getDb().insert(cliente).values({ id, empresaId, ...input, creadoEn: new Date() });
  return id;
}

export async function updateCliente(empresaId: string, id: string, input: ClienteInput) {
  const res = await getDb()
    .update(cliente)
    .set(input)
    .where(and(eq(cliente.id, id), eq(cliente.empresaId, empresaId)));
  return res.meta.changes > 0;
}

/** Devuelve "has_works" si tiene obras; true si se borró; false si no existía. */
export async function deleteCliente(empresaId: string, id: string): Promise<true | false | "has_works"> {
  const db = getDb();
  const [n] = await db
    .select({ n: sql<number>`count(*)` })
    .from(obra)
    .where(and(eq(obra.clienteId, id), eq(obra.empresaId, empresaId)));
  if ((n?.n ?? 0) > 0) return "has_works";
  const res = await db.delete(cliente).where(and(eq(cliente.id, id), eq(cliente.empresaId, empresaId)));
  return res.meta.changes > 0;
}

/* ---------------------------------------------------------------- obras */

export async function listObras(empresaId: string) {
  return getDb()
    .select({
      id: obra.id,
      nombre: obra.nombre,
      direccion: obra.direccion,
      estado: obra.estado,
      clienteId: obra.clienteId,
      clienteNombre: cliente.nombre,
    })
    .from(obra)
    .innerJoin(cliente, eq(cliente.id, obra.clienteId))
    .where(and(eq(obra.empresaId, empresaId), eq(cliente.empresaId, empresaId)))
    .orderBy(desc(obra.creadoEn));
}

export async function getObra(empresaId: string, id: string) {
  const [row] = await getDb()
    .select()
    .from(obra)
    .where(and(eq(obra.id, id), eq(obra.empresaId, empresaId)))
    .limit(1);
  return row ?? null;
}

export async function createObra(empresaId: string, input: ObraInput): Promise<string | null> {
  // El cliente debe ser de esta empresa: evita colgar una obra de datos ajenos.
  if (!(await getCliente(empresaId, input.clienteId))) return null;
  const id = crypto.randomUUID();
  await getDb().insert(obra).values({ id, empresaId, ...input, creadoEn: new Date() });
  return id;
}

export async function updateObra(empresaId: string, id: string, input: ObraInput): Promise<boolean> {
  if (!(await getCliente(empresaId, input.clienteId))) return false;
  const res = await getDb()
    .update(obra)
    .set(input)
    .where(and(eq(obra.id, id), eq(obra.empresaId, empresaId)));
  return res.meta.changes > 0;
}

export async function deleteObra(empresaId: string, id: string): Promise<boolean> {
  const res = await getDb().delete(obra).where(and(eq(obra.id, id), eq(obra.empresaId, empresaId)));
  return res.meta.changes > 0;
}

/* --------------------------------------------------------------- resumen */

export async function resumen(empresaId: string) {
  const db = getDb();
  const [c] = await db.select({ n: sql<number>`count(*)` }).from(cliente).where(eq(cliente.empresaId, empresaId));
  const [o] = await db.select({ n: sql<number>`count(*)` }).from(obra).where(eq(obra.empresaId, empresaId));
  const [a] = await db
    .select({ n: sql<number>`count(*)` })
    .from(obra)
    .where(and(eq(obra.empresaId, empresaId), eq(obra.estado, "en_curso")));
  return { clientes: c?.n ?? 0, obras: o?.n ?? 0, obrasEnCurso: a?.n ?? 0 };
}

/* ------------------------------------------------------- RGPD: datos */

/** Todos los datos de la empresa (portabilidad). Nunca incluye hashes ni sesiones. */
export async function exportarTodo(empresaId: string, usuarioId: string) {
  const db = getDb();
  const [emp] = await db.select().from(empresa).where(eq(empresa.id, empresaId)).limit(1);
  const [usr] = await db
    .select({ id: usuario.id, email: usuario.email, nombre: usuario.nombre, creadoEn: usuario.creadoEn })
    .from(usuario)
    .where(and(eq(usuario.id, usuarioId), eq(usuario.empresaId, empresaId)))
    .limit(1);
  const clientes = await db.select().from(cliente).where(eq(cliente.empresaId, empresaId));
  const obras = await db.select().from(obra).where(eq(obra.empresaId, empresaId));
  return { exportadoEn: new Date().toISOString(), usuario: usr, empresa: emp, clientes, obras };
}

/** Borra la empresa y todo lo que cuelga de ella (derecho de supresión). */
export async function eliminarEmpresa(empresaId: string): Promise<string> {
  const db = getDb();
  const [emp] = await db.select({ logoKey: empresa.logoKey }).from(empresa).where(eq(empresa.id, empresaId)).limit(1);
  const usuarios = await db.select({ id: usuario.id }).from(usuario).where(eq(usuario.empresaId, empresaId));
  await db.delete(obra).where(eq(obra.empresaId, empresaId));
  await db.delete(cliente).where(eq(cliente.empresaId, empresaId));
  for (const u of usuarios) await db.delete(sesion).where(eq(sesion.usuarioId, u.id));
  await db.delete(usuario).where(eq(usuario.empresaId, empresaId));
  await db.delete(empresa).where(eq(empresa.id, empresaId));
  return emp?.logoKey ?? "";
}
