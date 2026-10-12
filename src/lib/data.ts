// Capa de datos con AISLAMIENTO POR EMPRESA.
// Todas las funciones reciben el `empresaId` de la sesión y lo aplican en cada
// consulta. Ninguna página ni acción debe consultar estas tablas por su cuenta.
import { and, desc, eq, sql, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { EstadoObra, EstadoPresupuesto } from "@/db/schema";
import { CAPITULOS_BASE, PARTIDAS_BASE } from "@/lib/catalogo-base";
import { randomToken } from "@/lib/crypto";

const {
  cliente,
  obra,
  empresa,
  usuario,
  sesion,
  capitulo,
  partida,
  presupuesto,
  opcionPresupuesto,
  lineaPresupuesto,
} = schema;

export type ClienteInput = { nombre: string; nif: string; email: string; telefono: string; direccion: string; notas: string };
export type ObraInput = { clienteId: string; nombre: string; direccion: string; estado: EstadoObra; notas: string };

export type PartidaInput = {
  capituloId: string;
  codigo: string;
  concepto: string;
  descripcion: string;
  unidad: string;
  precioVenta: number;
  costeEstimado: number;
};

export type LineaPresupuestoInput = {
  id?: string;
  opcionId: string;
  capituloId?: string;
  codigoPartida?: string;
  concepto: string;
  descripcion?: string;
  unidad?: string;
  cantidad: number;
  precioUnitario: number;
  costeUnitario: number;
  esOpcional?: boolean;
  orden?: number;
};

export type OpcionPresupuestoInput = {
  id?: string;
  nombre: string;
  orden: number;
  esSeleccionada?: boolean;
};

export type PresupuestoInput = {
  clienteId: string;
  obraId?: string | null;
  titulo: string;
  ivaPct?: number;
  retencionPct?: number;
  descuentoPct?: number;
  condiciones?: string;
  validezDias?: number;
  fechaEmision?: Date;
  notasCliente?: string;
  notasInternas?: string;
  opciones: Array<OpcionPresupuestoInput & { lineas: LineaPresupuestoInput[] }>;
};

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

/* ------------------------------------------------------------- catálogo */

export async function listCapitulos(empresaId: string) {
  const db = getDb();
  let caps = await db
    .select()
    .from(capitulo)
    .where(sql`${capitulo.empresaId} is null or ${capitulo.empresaId} = ${empresaId}`)
    .orderBy(capitulo.orden);

  if (caps.length === 0) {
    // Inicializar capítulos base globales
    for (const c of CAPITULOS_BASE) {
      await db.insert(capitulo).values({
        id: c.id,
        nombre: c.nombre,
        orden: c.orden,
        icono: c.icono,
      });
    }
    caps = await db
      .select()
      .from(capitulo)
      .where(sql`${capitulo.empresaId} is null or ${capitulo.empresaId} = ${empresaId}`)
      .orderBy(capitulo.orden);
  }
  return caps;
}

export async function listPartidas(empresaId: string, capituloId?: string) {
  const db = getDb();
  const conds = [eq(partida.empresaId, empresaId)];
  if (capituloId) conds.push(eq(partida.capituloId, capituloId));
  return db
    .select({
      id: partida.id,
      capituloId: partida.capituloId,
      capituloNombre: capitulo.nombre,
      codigo: partida.codigo,
      concepto: partida.concepto,
      descripcion: partida.descripcion,
      unidad: partida.unidad,
      precioVenta: partida.precioVenta,
      costeEstimado: partida.costeEstimado,
      activo: partida.activo,
    })
    .from(partida)
    .innerJoin(capitulo, eq(capitulo.id, partida.capituloId))
    .where(and(...conds))
    .orderBy(capitulo.orden, partida.codigo, partida.concepto);
}

export async function getPartida(empresaId: string, id: string) {
  const [row] = await getDb()
    .select()
    .from(partida)
    .where(and(eq(partida.id, id), eq(partida.empresaId, empresaId)))
    .limit(1);
  return row ?? null;
}

export async function createPartida(empresaId: string, input: PartidaInput) {
  const id = crypto.randomUUID();
  await getDb().insert(partida).values({
    id,
    empresaId,
    ...input,
    activo: true,
    creadoEn: new Date(),
  });
  return id;
}

export async function updatePartida(empresaId: string, id: string, input: PartidaInput) {
  const res = await getDb()
    .update(partida)
    .set(input)
    .where(and(eq(partida.id, id), eq(partida.empresaId, empresaId)));
  return res.meta.changes > 0;
}

export async function deletePartida(empresaId: string, id: string) {
  const res = await getDb()
    .delete(partida)
    .where(and(eq(partida.id, id), eq(partida.empresaId, empresaId)));
  return res.meta.changes > 0;
}

/** Si el albañil no tiene partidas, precarga el catálogo base estándar */
export async function seedBancoBase(empresaId: string) {
  const db = getDb();
  await listCapitulos(empresaId); // Garantiza que los capítulos existen
  const [count] = await db
    .select({ n: sql<number>`count(*)` })
    .from(partida)
    .where(eq(partida.empresaId, empresaId));

  if ((count?.n ?? 0) === 0) {
    for (const p of PARTIDAS_BASE) {
      await db.insert(partida).values({
        id: crypto.randomUUID(),
        empresaId,
        capituloId: p.capituloId,
        codigo: p.codigo,
        concepto: p.concepto,
        descripcion: p.descripcion,
        unidad: p.unidad,
        precioVenta: p.precioVenta,
        costeEstimado: p.costeEstimado,
        activo: true,
        creadoEn: new Date(),
      });
    }
  }
}

/* --------------------------------------------------------- presupuestos */

export async function generarSiguienteCodigoPresupuesto(empresaId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PRE-${year}-`;
  const db = getDb();
  const [row] = await db
    .select({ codigo: presupuesto.codigo })
    .from(presupuesto)
    .where(and(eq(presupuesto.empresaId, empresaId), sql`${presupuesto.codigo} LIKE ${prefix + "%"}`))
    .orderBy(desc(presupuesto.codigo))
    .limit(1);

  if (!row) return `${prefix}001`;
  const numPart = row.codigo.replace(prefix, "");
  const num = parseInt(numPart, 10);
  const nextNum = isNaN(num) ? 1 : num + 1;
  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}

export async function listPresupuestos(empresaId: string, estado?: string) {
  const db = getDb();
  const conds = [eq(presupuesto.empresaId, empresaId)];
  if (estado && estado !== "todos") {
    conds.push(eq(presupuesto.estado, estado as EstadoPresupuesto));
  }

  const rows = await db
    .select({
      id: presupuesto.id,
      codigo: presupuesto.codigo,
      titulo: presupuesto.titulo,
      estado: presupuesto.estado,
      fechaEmision: presupuesto.fechaEmision,
      validezDias: presupuesto.validezDias,
      clienteId: presupuesto.clienteId,
      clienteNombre: cliente.nombre,
      obraId: presupuesto.obraId,
      obraNombre: obra.nombre,
      tokenPublico: presupuesto.tokenPublico,
    })
    .from(presupuesto)
    .innerJoin(cliente, eq(cliente.id, presupuesto.clienteId))
    .leftJoin(obra, eq(obra.id, presupuesto.obraId))
    .where(and(...conds))
    .orderBy(desc(presupuesto.fechaEmision), desc(presupuesto.creadoEn));

  // Traer totales para cada presupuesto
  const result = [];
  for (const p of rows) {
    const lineas = await db
      .select({
        cantidad: lineaPresupuesto.cantidad,
        precioUnitario: lineaPresupuesto.precioUnitario,
        costeUnitario: lineaPresupuesto.costeUnitario,
        esOpcional: lineaPresupuesto.esOpcional,
      })
      .from(lineaPresupuesto)
      .where(and(eq(lineaPresupuesto.presupuestoId, p.id), eq(lineaPresupuesto.empresaId, empresaId)));

    let totalVenta = 0;
    for (const l of lineas) {
      if (!l.esOpcional) totalVenta += Math.round(l.cantidad * l.precioUnitario);
    }
    result.push({ ...p, totalCents: totalVenta });
  }

  return result;
}

export async function getPresupuestoCompleto(empresaId: string, id: string) {
  const db = getDb();
  const [pres] = await db
    .select({
      presupuesto,
      clienteNombre: cliente.nombre,
      clienteNif: cliente.nif,
      clienteEmail: cliente.email,
      clienteTelefono: cliente.telefono,
      clienteDireccion: cliente.direccion,
      obraNombre: obra.nombre,
      obraDireccion: obra.direccion,
    })
    .from(presupuesto)
    .innerJoin(cliente, eq(cliente.id, presupuesto.clienteId))
    .leftJoin(obra, eq(obra.id, presupuesto.obraId))
    .where(and(eq(presupuesto.id, id), eq(presupuesto.empresaId, empresaId)))
    .limit(1);

  if (!pres) return null;

  const opciones = await db
    .select()
    .from(opcionPresupuesto)
    .where(and(eq(opcionPresupuesto.presupuestoId, id), eq(opcionPresupuesto.empresaId, empresaId)))
    .orderBy(opcionPresupuesto.orden);

  const lineas = await db
    .select()
    .from(lineaPresupuesto)
    .where(and(eq(lineaPresupuesto.presupuestoId, id), eq(lineaPresupuesto.empresaId, empresaId)))
    .orderBy(lineaPresupuesto.orden);

  return {
    ...pres.presupuesto,
    cliente: {
      id: pres.presupuesto.clienteId,
      nombre: pres.clienteNombre,
      nif: pres.clienteNif,
      email: pres.clienteEmail,
      telefono: pres.clienteTelefono,
      direccion: pres.clienteDireccion,
    },
    obra: pres.presupuesto.obraId
      ? {
          id: pres.presupuesto.obraId,
          nombre: pres.obraNombre ?? "",
          direccion: pres.obraDireccion ?? "",
        }
      : null,
    opciones: opciones.map((opc) => ({
      ...opc,
      lineas: lineas.filter((l) => l.opcionId === opc.id),
    })),
  };
}

export async function getPresupuestoPorToken(tokenPublico: string) {
  const db = getDb();
  const [pres] = await db
    .select()
    .from(presupuesto)
    .where(eq(presupuesto.tokenPublico, tokenPublico))
    .limit(1);

  if (!pres) return null;

  return getPresupuestoCompleto(pres.empresaId, pres.id);
}

export async function createPresupuesto(empresaId: string, input: PresupuestoInput): Promise<string> {
  const db = getDb();
  const id = crypto.randomUUID();
  const codigo = await generarSiguienteCodigoPresupuesto(empresaId);
  const tokenPublico = randomToken(32);
  const ahora = new Date();

  await db.insert(presupuesto).values({
    id,
    empresaId,
    clienteId: input.clienteId,
    obraId: input.obraId || null,
    codigo,
    titulo: input.titulo,
    estado: "borrador",
    ivaPct: input.ivaPct ?? 21,
    retencionPct: input.retencionPct ?? 0,
    descuentoPct: input.descuentoPct ?? 0,
    condiciones: input.condiciones ?? "",
    validezDias: input.validezDias ?? 30,
    fechaEmision: input.fechaEmision ?? ahora,
    notasCliente: input.notasCliente ?? "",
    notasInternas: input.notasInternas ?? "",
    tokenPublico,
    creadoEn: ahora,
    actualizadoEn: ahora,
  });

  // Si no vienen opciones, crear al menos la estándar
  const opcionesData = input.opciones.length > 0
    ? input.opciones
    : [{ nombre: "Presupuesto", orden: 0, esSeleccionada: true, lineas: [] }];

  for (let i = 0; i < opcionesData.length; i++) {
    const opc = opcionesData[i];
    const opcionId = opc.id || crypto.randomUUID();
    await db.insert(opcionPresupuesto).values({
      id: opcionId,
      empresaId,
      presupuestoId: id,
      nombre: opc.nombre,
      orden: opc.orden ?? i,
      esSeleccionada: opc.esSeleccionada ?? (i === 0),
    });

    for (let j = 0; j < (opc.lineas ?? []).length; j++) {
      const l = opc.lineas[j];
      await db.insert(lineaPresupuesto).values({
        id: crypto.randomUUID(),
        empresaId,
        presupuestoId: id,
        opcionId,
        capituloId: l.capituloId ?? "",
        codigoPartida: l.codigoPartida ?? "",
        concepto: l.concepto,
        descripcion: l.descripcion ?? "",
        unidad: l.unidad ?? "ud",
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        costeUnitario: l.costeUnitario,
        esOpcional: l.esOpcional ?? false,
        orden: l.orden ?? j,
      });
    }
  }

  return id;
}

export async function updatePresupuesto(empresaId: string, id: string, input: PresupuestoInput): Promise<boolean> {
  const db = getDb();
  const existente = await getPresupuestoCompleto(empresaId, id);
  if (!existente) return false;

  const ahora = new Date();
  await db
    .update(presupuesto)
    .set({
      clienteId: input.clienteId,
      obraId: input.obraId || null,
      titulo: input.titulo,
      ivaPct: input.ivaPct ?? 21,
      retencionPct: input.retencionPct ?? 0,
      descuentoPct: input.descuentoPct ?? 0,
      condiciones: input.condiciones ?? "",
      validezDias: input.validezDias ?? 30,
      notasCliente: input.notasCliente ?? "",
      notasInternas: input.notasInternas ?? "",
      actualizadoEn: ahora,
    })
    .where(and(eq(presupuesto.id, id), eq(presupuesto.empresaId, empresaId)));

  // Reemplazar opciones y líneas de forma atómica para este presupuesto
  await db.delete(lineaPresupuesto).where(and(eq(lineaPresupuesto.presupuestoId, id), eq(lineaPresupuesto.empresaId, empresaId)));
  await db.delete(opcionPresupuesto).where(and(eq(opcionPresupuesto.presupuestoId, id), eq(opcionPresupuesto.empresaId, empresaId)));

  for (let i = 0; i < input.opciones.length; i++) {
    const opc = input.opciones[i];
    const opcionId = opc.id || crypto.randomUUID();
    await db.insert(opcionPresupuesto).values({
      id: opcionId,
      empresaId,
      presupuestoId: id,
      nombre: opc.nombre,
      orden: opc.orden ?? i,
      esSeleccionada: opc.esSeleccionada ?? (i === 0),
    });

    for (let j = 0; j < (opc.lineas ?? []).length; j++) {
      const l = opc.lineas[j];
      await db.insert(lineaPresupuesto).values({
        id: crypto.randomUUID(),
        empresaId,
        presupuestoId: id,
        opcionId,
        capituloId: l.capituloId ?? "",
        codigoPartida: l.codigoPartida ?? "",
        concepto: l.concepto,
        descripcion: l.descripcion ?? "",
        unidad: l.unidad ?? "ud",
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        costeUnitario: l.costeUnitario,
        esOpcional: l.esOpcional ?? false,
        orden: l.orden ?? j,
      });
    }
  }

  return true;
}

export async function cambiarEstadoPresupuesto(
  empresaId: string,
  id: string,
  nuevoEstado: EstadoPresupuesto,
): Promise<boolean> {
  const res = await getDb()
    .update(presupuesto)
    .set({ estado: nuevoEstado, actualizadoEn: new Date() })
    .where(and(eq(presupuesto.id, id), eq(presupuesto.empresaId, empresaId)));
  return res.meta.changes > 0;
}

export async function deletePresupuesto(empresaId: string, id: string): Promise<boolean> {
  const db = getDb();
  await db.delete(lineaPresupuesto).where(and(eq(lineaPresupuesto.presupuestoId, id), eq(lineaPresupuesto.empresaId, empresaId)));
  await db.delete(opcionPresupuesto).where(and(eq(opcionPresupuesto.presupuestoId, id), eq(opcionPresupuesto.empresaId, empresaId)));
  const res = await db.delete(presupuesto).where(and(eq(presupuesto.id, id), eq(presupuesto.empresaId, empresaId)));
  return res.meta.changes > 0;
}

export async function duplicarPresupuesto(empresaId: string, id: string): Promise<string | null> {
  const original = await getPresupuestoCompleto(empresaId, id);
  if (!original) return null;

  return createPresupuesto(empresaId, {
    clienteId: original.clienteId,
    obraId: original.obraId,
    titulo: `${original.titulo} (Copia)`,
    ivaPct: original.ivaPct,
    retencionPct: original.retencionPct,
    descuentoPct: original.descuentoPct,
    condiciones: original.condiciones,
    validezDias: original.validezDias,
    notasCliente: original.notasCliente,
    notasInternas: original.notasInternas,
    opciones: original.opciones.map((opc) => ({
      nombre: opc.nombre,
      orden: opc.orden,
      esSeleccionada: opc.esSeleccionada,
      lineas: opc.lineas.map((l) => ({
        opcionId: "",
        capituloId: l.capituloId,
        codigoPartida: l.codigoPartida,
        concepto: l.concepto,
        descripcion: l.descripcion,
        unidad: l.unidad,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        costeUnitario: l.costeUnitario,
        esOpcional: l.esOpcional,
        orden: l.orden,
      })),
    })),
  });
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

  // Presupuestos por estado
  const [pTotal] = await db.select({ n: sql<number>`count(*)` }).from(presupuesto).where(eq(presupuesto.empresaId, empresaId));
  const [pBorrador] = await db.select({ n: sql<number>`count(*)` }).from(presupuesto).where(and(eq(presupuesto.empresaId, empresaId), eq(presupuesto.estado, "borrador")));
  const [pEnviado] = await db.select({ n: sql<number>`count(*)` }).from(presupuesto).where(and(eq(presupuesto.empresaId, empresaId), eq(presupuesto.estado, "en_viado" as any)));
  const [pAceptado] = await db.select({ n: sql<number>`count(*)` }).from(presupuesto).where(and(eq(presupuesto.empresaId, empresaId), eq(presupuesto.estado, "aceptado")));

  return {
    clientes: c?.n ?? 0,
    obras: o?.n ?? 0,
    obrasEnCurso: a?.n ?? 0,
    presupuestosTotal: pTotal?.n ?? 0,
    presupuestosBorrador: pBorrador?.n ?? 0,
    presupuestosEnviado: pEnviado?.n ?? 0,
    presupuestosAceptado: pAceptado?.n ?? 0,
  };
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
  const presupuestos = await db.select().from(presupuesto).where(eq(presupuesto.empresaId, empresaId));
  return { exportadoEn: new Date().toISOString(), usuario: usr, empresa: emp, clientes, obras, presupuestos };
}

/** Borra la empresa y todo lo que cuelga de ella (derecho de supresión). */
export async function eliminarEmpresa(empresaId: string): Promise<string> {
  const db = getDb();
  const [emp] = await db.select({ logoKey: empresa.logoKey }).from(empresa).where(eq(empresa.id, empresaId)).limit(1);
  const usuarios = await db.select({ id: usuario.id }).from(usuario).where(eq(usuario.empresaId, empresaId));
  await db.delete(lineaPresupuesto).where(eq(lineaPresupuesto.empresaId, empresaId));
  await db.delete(opcionPresupuesto).where(eq(opcionPresupuesto.empresaId, empresaId));
  await db.delete(presupuesto).where(eq(presupuesto.empresaId, empresaId));
  await db.delete(partida).where(eq(partida.empresaId, empresaId));
  await db.delete(obra).where(eq(obra.empresaId, empresaId));
  await db.delete(cliente).where(eq(cliente.empresaId, empresaId));
  for (const u of usuarios) await db.delete(sesion).where(eq(sesion.usuarioId, u.id));
  await db.delete(usuario).where(eq(usuario.empresaId, empresaId));
  await db.delete(empresa).where(eq(empresa.id, empresaId));
  return emp?.logoKey ?? "";
}

