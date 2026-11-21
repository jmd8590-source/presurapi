"use client";

// Almacén de datos real: cada lectura y escritura va contra Appwrite
// TablesDB (antes vivía en localStorage, ver el commit que retiró el modo
// demostración). Expone la misma interfaz que tenía el store de demo para
// que las páginas del panel cambien lo mínimo: actualizaciones optimistas en
// memoria (igual que antes) más la persistencia real en segundo plano, con
// reversión si la escritura falla.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ID, Permission, Role, Query, type Models } from "appwrite";
import { crearClienteNavegador } from "./client";
import { APPWRITE_DATABASE_ID, TABLA } from "./config";
import {
  calcularPartidaDesdeMaterialPropio,
  calcularPartidaDesdeTrabajo,
  calcularTotalesPresupuesto,
} from "../demo/calculo";
import type {
  Capitulo,
  Cliente,
  DemoDb,
  EstadoCliente,
  EstadoObra,
  MaterialPropio,
  Obra,
  Partida,
  Presupuesto,
  PrecioMaterialUsuario,
  TipoObra,
  UnidadMaterial,
} from "../demo/types";

type PrecioUsuarioFila = PrecioMaterialUsuario & { id: string };

type AppwriteDb = Omit<DemoDb, "precios_usuario"> & {
  precios_usuario: PrecioUsuarioFila[];
};

const LIMITE_FILAS = 500;

function perfilVacio(email: string): DemoDb["perfil"] {
  return {
    nombre_empresa: "",
    nif_empresa: "",
    direccion_empresa: "",
    telefono_empresa: "",
    email_empresa: "",
    logo_data_url: null,
    precio_hora_oficial: null,
    precio_hora_peon: null,
    gastos_generales_pct: 13,
    beneficio_industrial_pct: 6,
    iva_pct: 21,
    idioma: "es",
    email_cuenta: email,
  };
}

function dbVacia(email: string): AppwriteDb {
  return {
    perfil: perfilVacio(email),
    clientes: [],
    obras: [],
    presupuestos: [],
    capitulos: [],
    partidas: [],
    precios_usuario: [],
    materiales_propios: [],
  };
}

const ahora = () => new Date().toISOString();

// Las columnas de tipo "email" en Appwrite validan el formato incluso
// cuando no son obligatorias: un "" (campo opcional dejado en blanco) se
// rechaza igual que un email mal escrito. Se omiten antes de enviarlas en
// vez de mandar la cadena vacía.
function sinEmailVacio<T extends Record<string, unknown>>(data: T, claves: (keyof T)[]): T {
  const limpio = { ...data };
  for (const clave of claves) {
    if (limpio[clave] === "") delete limpio[clave];
  }
  return limpio;
}

function filaACliente(fila: Record<string, unknown>): Cliente {
  return {
    id: fila.$id as string,
    nombre: fila.nombre as string,
    nif: (fila.nif as string) ?? "",
    email: (fila.email as string) ?? "",
    telefono: (fila.telefono as string) ?? "",
    direccion: (fila.direccion as string) ?? "",
    notas: (fila.notas as string) ?? "",
    estado: fila.estado as EstadoCliente,
    created_at: fila.$createdAt as string,
    updated_at: fila.$updatedAt as string,
  };
}

function filaAObra(fila: Record<string, unknown>): Obra {
  return {
    id: fila.$id as string,
    cliente_id: fila.cliente_id as string,
    nombre: fila.nombre as string,
    direccion: (fila.direccion as string) ?? "",
    descripcion: (fila.descripcion as string) ?? "",
    tipo_obra: (fila.tipo_obra as TipoObra) ?? "nueva",
    estado: fila.estado as EstadoObra,
    created_at: fila.$createdAt as string,
    updated_at: fila.$updatedAt as string,
  };
}

function filaAPresupuesto(fila: Record<string, unknown>): Presupuesto {
  return {
    id: fila.$id as string,
    obra_id: fila.obra_id as string,
    numero: fila.numero as number,
    estado: fila.estado as Presupuesto["estado"],
    precio_hora_oficial: fila.precio_hora_oficial as number,
    precio_hora_peon: fila.precio_hora_peon as number,
    gastos_generales_pct: fila.gastos_generales_pct as number,
    beneficio_industrial_pct: fila.beneficio_industrial_pct as number,
    iva_pct: fila.iva_pct as number,
    subtotal_materiales: fila.subtotal_materiales as number,
    subtotal_mano_obra: fila.subtotal_mano_obra as number,
    gastos_generales_importe: fila.gastos_generales_importe as number,
    beneficio_industrial_importe: fila.beneficio_industrial_importe as number,
    base_imponible: fila.base_imponible as number,
    iva_importe: fila.iva_importe as number,
    total: fila.total as number,
    notas: (fila.notas as string) ?? "",
    created_at: fila.$createdAt as string,
    updated_at: fila.$updatedAt as string,
  };
}

function filaACapitulo(fila: Record<string, unknown>): Capitulo {
  return {
    id: fila.$id as string,
    presupuesto_id: fila.presupuesto_id as string,
    nombre: fila.nombre as string,
    posicion: fila.posicion as number,
  };
}

function jsonSeguro<T>(texto: unknown, porDefecto: T): T {
  if (typeof texto !== "string" || texto.length === 0) return porDefecto;
  try {
    return JSON.parse(texto) as T;
  } catch {
    return porDefecto;
  }
}

function filaAPartida(fila: Record<string, unknown>): Partida {
  return {
    id: fila.$id as string,
    capitulo_id: fila.capitulo_id as string,
    trabajo_slug: (fila.trabajo_slug as string) ?? null,
    descripcion: fila.descripcion as string,
    unidad: fila.unidad as Partida["unidad"],
    medicion: fila.medicion as number,
    materiales: jsonSeguro(fila.materiales_json, []),
    mano_obra: jsonSeguro(fila.mano_obra_json, []),
    importe_materiales: fila.importe_materiales as number,
    importe_mano_obra: fila.importe_mano_obra as number,
    precio_unitario: fila.precio_unitario as number,
    importe: fila.importe as number,
    posicion: fila.posicion as number,
  };
}

function filaAPrecioUsuario(fila: Record<string, unknown>): PrecioUsuarioFila {
  return {
    id: fila.$id as string,
    material_nombre: fila.material_nombre as string,
    precio: fila.precio as number,
  };
}

function filaAMaterialPropio(fila: Record<string, unknown>): MaterialPropio {
  return {
    id: fila.$id as string,
    nombre: fila.nombre as string,
    unidad: fila.unidad as UnidadMaterial,
    precio: fila.precio as number,
  };
}

type AppwriteStoreValue = {
  db: AppwriteDb;
  listo: boolean;
  error: string | null;
  limpiarError: () => void;
  actualizarPerfil: (cambios: Partial<DemoDb["perfil"]>) => void;
  crearCliente: (
    datos: Pick<Cliente, "nombre" | "nif" | "email" | "telefono" | "direccion" | "notas">,
  ) => Cliente;
  actualizarCliente: (id: string, cambios: Partial<Cliente>) => void;
  cambiarEstadoCliente: (id: string, estado: EstadoCliente) => void;
  crearObra: (
    datos: Pick<Obra, "cliente_id" | "nombre" | "direccion" | "descripcion" | "tipo_obra">,
  ) => Obra;
  actualizarObra: (id: string, cambios: Partial<Obra>) => void;
  cambiarEstadoObra: (id: string, estado: EstadoObra) => void;
  crearPresupuesto: (obraId: string) => Presupuesto;
  actualizarNotasPresupuesto: (id: string, notas: string) => void;
  cambiarEstadoPresupuesto: (id: string, estado: Presupuesto["estado"]) => void;
  crearCapitulo: (presupuestoId: string, nombre: string) => Capitulo;
  renombrarCapitulo: (id: string, nombre: string) => void;
  eliminarCapitulo: (id: string) => void;
  agregarPartidaDesdeTrabajo: (
    capituloId: string,
    trabajoSlug: string,
    descripcion: string,
    medicion: number,
  ) => void;
  agregarPartidaDesdeMaterialPropio: (
    capituloId: string,
    materialPropioId: string,
    descripcion: string,
    cantidad: number,
    horasOficial: number,
    horasPeon: number,
  ) => void;
  eliminarPartida: (id: string) => void;
  fijarPrecioMaterial: (materialNombre: string, precio: number) => void;
  quitarPrecioMaterial: (materialNombre: string) => void;
  crearMaterialPropio: (datos: {
    nombre: string;
    unidad: UnidadMaterial;
    precio: number;
  }) => MaterialPropio;
  eliminarMaterialPropio: (id: string) => void;
};

const AppwriteStoreContext = createContext<AppwriteStoreValue | null>(null);

function recalcularPresupuesto(db: AppwriteDb, presupuestoId: string): AppwriteDb {
  const presupuesto = db.presupuestos.find((p) => p.id === presupuestoId);
  if (!presupuesto) return db;
  const partidas = db.partidas.filter((p) => {
    const capitulo = db.capitulos.find((c) => c.id === p.capitulo_id);
    return capitulo?.presupuesto_id === presupuestoId;
  });
  const totales = calcularTotalesPresupuesto(
    partidas,
    presupuesto.gastos_generales_pct,
    presupuesto.beneficio_industrial_pct,
    presupuesto.iva_pct,
  );
  return {
    ...db,
    presupuestos: db.presupuestos.map((p) =>
      p.id === presupuestoId ? { ...p, ...totales, updated_at: ahora() } : p,
    ),
  };
}

export function AppwriteDataProvider({
  userId,
  sessionSecret,
  email,
  children,
}: {
  userId: string;
  sessionSecret: string;
  email: string;
  children: ReactNode;
}) {
  const { tablesDB } = useMemo(() => crearClienteNavegador(sessionSecret), [sessionSecret]);
  const dbRef = useRef<AppwriteDb>(dbVacia(email));
  const [db, setDbState] = useState<AppwriteDb>(() => dbVacia(email));
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setDb = useCallback((siguiente: AppwriteDb) => {
    dbRef.current = siguiente;
    setDbState(siguiente);
  }, []);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      const permisosUsuario = [Query.equal("user_id", userId), Query.limit(LIMITE_FILAS)];
      const [
        perfilRes,
        clientesRes,
        obrasRes,
        presupuestosRes,
        capitulosRes,
        partidasRes,
        preciosRes,
        materialesPropiosRes,
      ] = await Promise.all([
          tablesDB
            .getRow({ databaseId: APPWRITE_DATABASE_ID, tableId: TABLA.perfiles, rowId: userId })
            .catch(() => null),
          tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.clientes,
            queries: permisosUsuario,
          }),
          tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.obras,
            queries: permisosUsuario,
          }),
          tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.presupuestos,
            queries: permisosUsuario,
          }),
          tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.capitulos,
            queries: permisosUsuario,
          }),
          tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.partidas,
            queries: permisosUsuario,
          }),
          tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.preciosUsuario,
            queries: permisosUsuario,
          }),
          tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.materialesPropios,
            queries: permisosUsuario,
          }),
        ]);
      if (cancelado) return;

      const siguiente: AppwriteDb = {
        perfil: perfilRes
          ? {
              ...perfilVacio(email),
              ...perfilRes,
              // email_empresa es una columna de tipo "email" sin valor por
              // defecto (un "" no es un email válido): llega como null
              // mientras el usuario no la rellene en Ajustes.
              email_empresa: (perfilRes.email_empresa as string | null) ?? "",
            }
          : perfilVacio(email),
        clientes: clientesRes.rows.map(filaACliente),
        obras: obrasRes.rows.map(filaAObra),
        presupuestos: presupuestosRes.rows.map(filaAPresupuesto),
        capitulos: capitulosRes.rows.map(filaACapitulo),
        partidas: partidasRes.rows.map(filaAPartida),
        precios_usuario: preciosRes.rows.map(filaAPrecioUsuario),
        materiales_propios: materialesPropiosRes.rows.map(filaAMaterialPropio),
      };
      setDb(siguiente);
      setListo(true);
    }
    cargar().catch((err) => {
      console.error("Error cargando datos de Appwrite:", err);
      if (!cancelado) {
        setError("load");
        setListo(true);
      }
    });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const aplicar = useCallback(
    (actualizar: (db: AppwriteDb) => AppwriteDb, persistir: () => Promise<unknown>) => {
      const anterior = dbRef.current;
      setDb(actualizar(anterior));
      persistir().catch((err) => {
        console.error("Error guardando en Appwrite:", err);
        setDb(anterior);
        setError("save");
      });
    },
    [setDb],
  );

  const permisosPropios = useCallback(
    () => [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
    [userId],
  );

  const limpiarError = useCallback(() => setError(null), []);

  const actualizarPerfil = useCallback<AppwriteStoreValue["actualizarPerfil"]>(
    (cambios) =>
      aplicar(
        (db) => ({ ...db, perfil: { ...db.perfil, ...cambios } }),
        () =>
          tablesDB.updateRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.perfiles,
            rowId: userId,
            data: sinEmailVacio(cambios, ["email_empresa"]),
          }),
      ),
    [aplicar, tablesDB, userId],
  );

  const crearCliente = useCallback<AppwriteStoreValue["crearCliente"]>(
    (datos) => {
      const cliente: Cliente = {
        id: ID.unique(),
        ...datos,
        estado: "activo",
        created_at: ahora(),
        updated_at: ahora(),
      };
      aplicar(
        (db) => ({ ...db, clientes: [...db.clientes, cliente] }),
        () =>
          tablesDB.createRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.clientes,
            rowId: cliente.id,
            data: sinEmailVacio({ ...datos, user_id: userId, estado: "activo" }, ["email"]),
            permissions: permisosPropios(),
          }),
      );
      return cliente;
    },
    [aplicar, tablesDB, userId, permisosPropios],
  );

  const actualizarCliente = useCallback<AppwriteStoreValue["actualizarCliente"]>(
    (id, cambios) =>
      aplicar(
        (db) => ({
          ...db,
          clientes: db.clientes.map((c) =>
            c.id === id ? { ...c, ...cambios, updated_at: ahora() } : c,
          ),
        }),
        () =>
          tablesDB.updateRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.clientes,
            rowId: id,
            data: sinEmailVacio(cambios, ["email"]),
          }),
      ),
    [aplicar, tablesDB],
  );

  const cambiarEstadoCliente = useCallback<AppwriteStoreValue["cambiarEstadoCliente"]>(
    (id, estado) => actualizarCliente(id, { estado }),
    [actualizarCliente],
  );

  const crearObra = useCallback<AppwriteStoreValue["crearObra"]>(
    (datos) => {
      const obra: Obra = {
        id: ID.unique(),
        ...datos,
        estado: "activa",
        created_at: ahora(),
        updated_at: ahora(),
      };
      aplicar(
        (db) => ({ ...db, obras: [...db.obras, obra] }),
        () =>
          tablesDB.createRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.obras,
            rowId: obra.id,
            data: { ...datos, user_id: userId, estado: "activa" },
            permissions: permisosPropios(),
          }),
      );
      return obra;
    },
    [aplicar, tablesDB, userId, permisosPropios],
  );

  const actualizarObra = useCallback<AppwriteStoreValue["actualizarObra"]>(
    (id, cambios) =>
      aplicar(
        (db) => ({
          ...db,
          obras: db.obras.map((o) => (o.id === id ? { ...o, ...cambios, updated_at: ahora() } : o)),
        }),
        () =>
          tablesDB.updateRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.obras,
            rowId: id,
            data: cambios,
          }),
      ),
    [aplicar, tablesDB],
  );

  const cambiarEstadoObra = useCallback<AppwriteStoreValue["cambiarEstadoObra"]>(
    (id, estado) => actualizarObra(id, { estado }),
    [actualizarObra],
  );

  const crearPresupuesto = useCallback<AppwriteStoreValue["crearPresupuesto"]>(
    (obraId) => {
      const db = dbRef.current;
      const siguienteNumero = db.presupuestos.reduce((max, p) => Math.max(max, p.numero), 0) + 1;
      const creado: Presupuesto = {
        id: ID.unique(),
        obra_id: obraId,
        numero: siguienteNumero,
        estado: "borrador",
        precio_hora_oficial: db.perfil.precio_hora_oficial ?? 18,
        precio_hora_peon: db.perfil.precio_hora_peon ?? 14,
        gastos_generales_pct: db.perfil.gastos_generales_pct,
        beneficio_industrial_pct: db.perfil.beneficio_industrial_pct,
        iva_pct: db.perfil.iva_pct,
        subtotal_materiales: 0,
        subtotal_mano_obra: 0,
        gastos_generales_importe: 0,
        beneficio_industrial_importe: 0,
        base_imponible: 0,
        iva_importe: 0,
        total: 0,
        notas: "",
        created_at: ahora(),
        updated_at: ahora(),
      };
      aplicar(
        (db) => ({ ...db, presupuestos: [...db.presupuestos, creado] }),
        () =>
          tablesDB.createRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.presupuestos,
            rowId: creado.id,
            data: {
              user_id: userId,
              obra_id: obraId,
              numero: creado.numero,
              estado: "borrador",
              precio_hora_oficial: creado.precio_hora_oficial,
              precio_hora_peon: creado.precio_hora_peon,
              gastos_generales_pct: creado.gastos_generales_pct,
              beneficio_industrial_pct: creado.beneficio_industrial_pct,
              iva_pct: creado.iva_pct,
            },
            permissions: permisosPropios(),
          }),
      );
      return creado;
    },
    [aplicar, tablesDB, userId, permisosPropios],
  );

  const actualizarNotasPresupuesto = useCallback<AppwriteStoreValue["actualizarNotasPresupuesto"]>(
    (id, notas) =>
      aplicar(
        (db) => ({
          ...db,
          presupuestos: db.presupuestos.map((p) =>
            p.id === id ? { ...p, notas, updated_at: ahora() } : p,
          ),
        }),
        () =>
          tablesDB.updateRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.presupuestos,
            rowId: id,
            data: { notas },
          }),
      ),
    [aplicar, tablesDB],
  );

  const cambiarEstadoPresupuesto = useCallback<AppwriteStoreValue["cambiarEstadoPresupuesto"]>(
    (id, estado) =>
      aplicar(
        (db) => ({
          ...db,
          presupuestos: db.presupuestos.map((p) =>
            p.id === id ? { ...p, estado, updated_at: ahora() } : p,
          ),
        }),
        () =>
          tablesDB.updateRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.presupuestos,
            rowId: id,
            data: { estado },
          }),
      ),
    [aplicar, tablesDB],
  );

  const crearCapitulo = useCallback<AppwriteStoreValue["crearCapitulo"]>(
    (presupuestoId, nombre) => {
      const db = dbRef.current;
      const posiciones = db.capitulos
        .filter((c) => c.presupuesto_id === presupuestoId)
        .map((c) => c.posicion);
      const creado: Capitulo = {
        id: ID.unique(),
        presupuesto_id: presupuestoId,
        nombre,
        posicion: (posiciones.length ? Math.max(...posiciones) : 0) + 1,
      };
      aplicar(
        (db) => ({ ...db, capitulos: [...db.capitulos, creado] }),
        () =>
          tablesDB.createRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.capitulos,
            rowId: creado.id,
            data: {
              user_id: userId,
              presupuesto_id: presupuestoId,
              nombre,
              posicion: creado.posicion,
            },
            permissions: permisosPropios(),
          }),
      );
      return creado;
    },
    [aplicar, tablesDB, userId, permisosPropios],
  );

  const renombrarCapitulo = useCallback<AppwriteStoreValue["renombrarCapitulo"]>(
    (id, nombre) =>
      aplicar(
        (db) => ({
          ...db,
          capitulos: db.capitulos.map((c) => (c.id === id ? { ...c, nombre } : c)),
        }),
        () =>
          tablesDB.updateRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.capitulos,
            rowId: id,
            data: { nombre },
          }),
      ),
    [aplicar, tablesDB],
  );

  const eliminarCapitulo = useCallback<AppwriteStoreValue["eliminarCapitulo"]>(
    (id) => {
      const db = dbRef.current;
      const partidasDelCapitulo = db.partidas.filter((p) => p.capitulo_id === id);
      const presupuestoId = db.capitulos.find((c) => c.id === id)?.presupuesto_id;

      aplicar(
        (db) => {
          const siguiente = {
            ...db,
            capitulos: db.capitulos.filter((c) => c.id !== id),
            partidas: db.partidas.filter((p) => p.capitulo_id !== id),
          };
          return presupuestoId ? recalcularPresupuesto(siguiente, presupuestoId) : siguiente;
        },
        async () => {
          await Promise.all([
            tablesDB.deleteRow({ databaseId: APPWRITE_DATABASE_ID, tableId: TABLA.capitulos, rowId: id }),
            ...partidasDelCapitulo.map((p) =>
              tablesDB.deleteRow({ databaseId: APPWRITE_DATABASE_ID, tableId: TABLA.partidas, rowId: p.id }),
            ),
          ]);
          if (presupuestoId) {
            const siguiente = recalcularPresupuesto(dbRef.current, presupuestoId);
            const presupuesto = siguiente.presupuestos.find((p) => p.id === presupuestoId);
            if (presupuesto) {
              await tablesDB.updateRow<Models.DefaultRow>({
                databaseId: APPWRITE_DATABASE_ID,
                tableId: TABLA.presupuestos,
                rowId: presupuestoId,
                data: {
                  subtotal_materiales: presupuesto.subtotal_materiales,
                  subtotal_mano_obra: presupuesto.subtotal_mano_obra,
                  gastos_generales_importe: presupuesto.gastos_generales_importe,
                  beneficio_industrial_importe: presupuesto.beneficio_industrial_importe,
                  base_imponible: presupuesto.base_imponible,
                  iva_importe: presupuesto.iva_importe,
                  total: presupuesto.total,
                },
              });
            }
          }
        },
      );
    },
    [aplicar, tablesDB],
  );

  const persistirTotalesPresupuesto = useCallback(
    async (presupuestoId: string) => {
      const presupuesto = dbRef.current.presupuestos.find((p) => p.id === presupuestoId);
      if (!presupuesto) return;
      await tablesDB.updateRow<Models.DefaultRow>({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: TABLA.presupuestos,
        rowId: presupuestoId,
        data: {
          subtotal_materiales: presupuesto.subtotal_materiales,
          subtotal_mano_obra: presupuesto.subtotal_mano_obra,
          gastos_generales_importe: presupuesto.gastos_generales_importe,
          beneficio_industrial_importe: presupuesto.beneficio_industrial_importe,
          base_imponible: presupuesto.base_imponible,
          iva_importe: presupuesto.iva_importe,
          total: presupuesto.total,
        },
      });
    },
    [tablesDB],
  );

  const agregarPartidaDesdeTrabajo = useCallback<AppwriteStoreValue["agregarPartidaDesdeTrabajo"]>(
    (capituloId, trabajoSlug, descripcion, medicion) => {
      const db = dbRef.current;
      const desglose = calcularPartidaDesdeTrabajo(
        trabajoSlug,
        medicion,
        db.perfil,
        db.precios_usuario,
      );
      if (!desglose) return;
      const posiciones = db.partidas
        .filter((p) => p.capitulo_id === capituloId)
        .map((p) => p.posicion);
      const partida: Partida = {
        id: ID.unique(),
        capitulo_id: capituloId,
        trabajo_slug: trabajoSlug,
        descripcion,
        unidad: "m2",
        medicion,
        materiales: desglose.materiales,
        mano_obra: desglose.mano_obra,
        importe_materiales: desglose.importe_materiales,
        importe_mano_obra: desglose.importe_mano_obra,
        precio_unitario: desglose.precio_unitario,
        importe: desglose.importe,
        posicion: (posiciones.length ? Math.max(...posiciones) : 0) + 1,
      };
      const presupuestoId = db.capitulos.find((c) => c.id === capituloId)?.presupuesto_id;

      aplicar(
        (db) => {
          const siguiente = { ...db, partidas: [...db.partidas, partida] };
          return presupuestoId ? recalcularPresupuesto(siguiente, presupuestoId) : siguiente;
        },
        async () => {
          await tablesDB.createRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.partidas,
            rowId: partida.id,
            data: {
              user_id: userId,
              capitulo_id: capituloId,
              trabajo_slug: trabajoSlug,
              descripcion,
              unidad: partida.unidad,
              medicion,
              materiales_json: JSON.stringify(partida.materiales),
              mano_obra_json: JSON.stringify(partida.mano_obra),
              importe_materiales: partida.importe_materiales,
              importe_mano_obra: partida.importe_mano_obra,
              precio_unitario: partida.precio_unitario,
              importe: partida.importe,
              posicion: partida.posicion,
            },
            permissions: permisosPropios(),
          });
          if (presupuestoId) await persistirTotalesPresupuesto(presupuestoId);
        },
      );
    },
    [aplicar, tablesDB, userId, permisosPropios, persistirTotalesPresupuesto],
  );

  const agregarPartidaDesdeMaterialPropio = useCallback<
    AppwriteStoreValue["agregarPartidaDesdeMaterialPropio"]
  >(
    (capituloId, materialPropioId, descripcion, cantidad, horasOficial, horasPeon) => {
      const db = dbRef.current;
      const material = db.materiales_propios.find((m) => m.id === materialPropioId);
      if (!material) return;
      const desglose = calcularPartidaDesdeMaterialPropio(
        material,
        cantidad,
        horasOficial,
        horasPeon,
        db.perfil,
      );
      const posiciones = db.partidas
        .filter((p) => p.capitulo_id === capituloId)
        .map((p) => p.posicion);
      const partida: Partida = {
        id: ID.unique(),
        capitulo_id: capituloId,
        trabajo_slug: null,
        descripcion,
        unidad: material.unidad,
        medicion: cantidad,
        materiales: desglose.materiales,
        mano_obra: desglose.mano_obra,
        importe_materiales: desglose.importe_materiales,
        importe_mano_obra: desglose.importe_mano_obra,
        precio_unitario: desglose.precio_unitario,
        importe: desglose.importe,
        posicion: (posiciones.length ? Math.max(...posiciones) : 0) + 1,
      };
      const presupuestoId = db.capitulos.find((c) => c.id === capituloId)?.presupuesto_id;

      aplicar(
        (db) => {
          const siguiente = { ...db, partidas: [...db.partidas, partida] };
          return presupuestoId ? recalcularPresupuesto(siguiente, presupuestoId) : siguiente;
        },
        async () => {
          await tablesDB.createRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.partidas,
            rowId: partida.id,
            data: {
              user_id: userId,
              capitulo_id: capituloId,
              trabajo_slug: null,
              descripcion,
              unidad: partida.unidad,
              medicion: cantidad,
              materiales_json: JSON.stringify(partida.materiales),
              mano_obra_json: JSON.stringify(partida.mano_obra),
              importe_materiales: partida.importe_materiales,
              importe_mano_obra: partida.importe_mano_obra,
              precio_unitario: partida.precio_unitario,
              importe: partida.importe,
              posicion: partida.posicion,
            },
            permissions: permisosPropios(),
          });
          if (presupuestoId) await persistirTotalesPresupuesto(presupuestoId);
        },
      );
    },
    [aplicar, tablesDB, userId, permisosPropios, persistirTotalesPresupuesto],
  );

  const eliminarPartida = useCallback<AppwriteStoreValue["eliminarPartida"]>(
    (id) => {
      const db = dbRef.current;
      const partida = db.partidas.find((p) => p.id === id);
      const capitulo = partida && db.capitulos.find((c) => c.id === partida.capitulo_id);

      aplicar(
        (db) => {
          const siguiente = { ...db, partidas: db.partidas.filter((p) => p.id !== id) };
          return capitulo ? recalcularPresupuesto(siguiente, capitulo.presupuesto_id) : siguiente;
        },
        async () => {
          await tablesDB.deleteRow({ databaseId: APPWRITE_DATABASE_ID, tableId: TABLA.partidas, rowId: id });
          if (capitulo) await persistirTotalesPresupuesto(capitulo.presupuesto_id);
        },
      );
    },
    [aplicar, tablesDB, persistirTotalesPresupuesto],
  );

  const fijarPrecioMaterial = useCallback<AppwriteStoreValue["fijarPrecioMaterial"]>(
    (materialNombre, precio) => {
      const existente = dbRef.current.precios_usuario.find(
        (p) => p.material_nombre === materialNombre,
      );
      aplicar(
        (db) => ({
          ...db,
          precios_usuario: [
            ...db.precios_usuario.filter((p) => p.material_nombre !== materialNombre),
            { id: existente?.id ?? ID.unique(), material_nombre: materialNombre, precio },
          ],
        }),
        () =>
          existente
            ? tablesDB.updateRow<Models.DefaultRow>({
                databaseId: APPWRITE_DATABASE_ID,
                tableId: TABLA.preciosUsuario,
                rowId: existente.id,
                data: { precio },
              })
            : tablesDB.createRow<Models.DefaultRow>({
                databaseId: APPWRITE_DATABASE_ID,
                tableId: TABLA.preciosUsuario,
                rowId: ID.unique(),
                data: { user_id: userId, material_nombre: materialNombre, precio },
                permissions: permisosPropios(),
              }),
      );
    },
    [aplicar, tablesDB, userId, permisosPropios],
  );

  const quitarPrecioMaterial = useCallback<AppwriteStoreValue["quitarPrecioMaterial"]>(
    (materialNombre) => {
      const existente = dbRef.current.precios_usuario.find(
        (p) => p.material_nombre === materialNombre,
      );
      if (!existente) return;
      aplicar(
        (db) => ({
          ...db,
          precios_usuario: db.precios_usuario.filter((p) => p.material_nombre !== materialNombre),
        }),
        () =>
          tablesDB.deleteRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.preciosUsuario,
            rowId: existente.id,
          }),
      );
    },
    [aplicar, tablesDB],
  );

  const crearMaterialPropio = useCallback<AppwriteStoreValue["crearMaterialPropio"]>(
    (datos) => {
      const material: MaterialPropio = { id: ID.unique(), ...datos };
      aplicar(
        (db) => ({ ...db, materiales_propios: [...db.materiales_propios, material] }),
        () =>
          tablesDB.createRow<Models.DefaultRow>({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.materialesPropios,
            rowId: material.id,
            data: { ...datos, user_id: userId },
            permissions: permisosPropios(),
          }),
      );
      return material;
    },
    [aplicar, tablesDB, userId, permisosPropios],
  );

  const eliminarMaterialPropio = useCallback<AppwriteStoreValue["eliminarMaterialPropio"]>(
    (id) =>
      aplicar(
        (db) => ({
          ...db,
          materiales_propios: db.materiales_propios.filter((m) => m.id !== id),
        }),
        () =>
          tablesDB.deleteRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABLA.materialesPropios,
            rowId: id,
          }),
      ),
    [aplicar, tablesDB],
  );

  const value = useMemo<AppwriteStoreValue>(
    () => ({
      db,
      listo,
      error,
      limpiarError,
      actualizarPerfil,
      crearCliente,
      actualizarCliente,
      cambiarEstadoCliente,
      crearObra,
      actualizarObra,
      cambiarEstadoObra,
      crearPresupuesto,
      actualizarNotasPresupuesto,
      cambiarEstadoPresupuesto,
      crearCapitulo,
      renombrarCapitulo,
      eliminarCapitulo,
      agregarPartidaDesdeTrabajo,
      agregarPartidaDesdeMaterialPropio,
      eliminarPartida,
      fijarPrecioMaterial,
      quitarPrecioMaterial,
      crearMaterialPropio,
      eliminarMaterialPropio,
    }),
    [
      db,
      listo,
      error,
      limpiarError,
      actualizarPerfil,
      crearCliente,
      actualizarCliente,
      cambiarEstadoCliente,
      crearObra,
      actualizarObra,
      cambiarEstadoObra,
      crearPresupuesto,
      actualizarNotasPresupuesto,
      cambiarEstadoPresupuesto,
      crearCapitulo,
      renombrarCapitulo,
      eliminarCapitulo,
      agregarPartidaDesdeTrabajo,
      agregarPartidaDesdeMaterialPropio,
      eliminarPartida,
      fijarPrecioMaterial,
      quitarPrecioMaterial,
      crearMaterialPropio,
      eliminarMaterialPropio,
    ],
  );

  return <AppwriteStoreContext.Provider value={value}>{children}</AppwriteStoreContext.Provider>;
}

export function useAppwriteStore() {
  const ctx = useContext(AppwriteStoreContext);
  if (!ctx) throw new Error("useAppwriteStore must be used within AppwriteDataProvider");
  return ctx;
}
