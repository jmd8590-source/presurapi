"use client";

// Almacén de datos de la demo: vive en localStorage del navegador, nunca en
// un servidor. Expone las mismas operaciones que tendría un repositorio
// sobre Supabase, para que sea sencillo sustituirlo más adelante.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  calcularPartidaDesdeTrabajo,
  calcularTotalesPresupuesto,
} from "./calculo";
import type {
  Capitulo,
  Cliente,
  DemoDb,
  EstadoCliente,
  EstadoObra,
  Obra,
  Partida,
  Presupuesto,
  PrecioMaterialUsuario,
} from "./types";

const STORAGE_KEY = "presurapi_demo_db_v1";

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

function dbVacia(email: string): DemoDb {
  return {
    perfil: perfilVacio(email),
    clientes: [],
    obras: [],
    presupuestos: [],
    capitulos: [],
    partidas: [],
    precios_usuario: [],
  };
}

function cargar(): DemoDb | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoDb;
  } catch {
    return null;
  }
}

function guardar(db: DemoDb) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Cuota de localStorage llena o modo privado: se pierde la persistencia,
    // pero la sesión en memoria sigue funcionando.
  }
}

function nuevoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

const ahora = () => new Date().toISOString();

type DemoStoreValue = {
  db: DemoDb;
  listo: boolean;
  actualizarPerfil: (cambios: Partial<DemoDb["perfil"]>) => void;
  crearCliente: (datos: Pick<Cliente, "nombre" | "nif" | "email" | "telefono" | "direccion" | "notas">) => Cliente;
  actualizarCliente: (id: string, cambios: Partial<Cliente>) => void;
  cambiarEstadoCliente: (id: string, estado: EstadoCliente) => void;
  crearObra: (datos: Pick<Obra, "cliente_id" | "nombre" | "direccion" | "descripcion">) => Obra;
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
  eliminarPartida: (id: string) => void;
  fijarPrecioMaterial: (materialNombre: string, precio: number) => void;
  quitarPrecioMaterial: (materialNombre: string) => void;
};

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

function recalcularPresupuesto(db: DemoDb, presupuestoId: string): DemoDb {
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

export function DemoDataProvider({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const [db, setDb] = useState<DemoDb>(() => dbVacia(email));
  const [listo, setListo] = useState(false);

  useEffect(() => {
    // localStorage no existe durante el SSR: cargar aquí (no en un
    // inicializador perezoso) mantiene el primer render del cliente igual
    // que el del servidor (ambos "no listo"), sin error de hidratación.
    const existente = cargar();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDb(existente ?? dbVacia(email));
    setListo(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = useCallback((actualizar: (db: DemoDb) => DemoDb) => {
    setDb((prev) => {
      const siguiente = actualizar(prev);
      guardar(siguiente);
      return siguiente;
    });
  }, []);

  const actualizarPerfil = useCallback<DemoStoreValue["actualizarPerfil"]>(
    (cambios) => set((db) => ({ ...db, perfil: { ...db.perfil, ...cambios } })),
    [set],
  );

  const crearCliente = useCallback<DemoStoreValue["crearCliente"]>(
    (datos) => {
      const cliente: Cliente = {
        id: nuevoId(),
        ...datos,
        estado: "activo",
        created_at: ahora(),
        updated_at: ahora(),
      };
      set((db) => ({ ...db, clientes: [...db.clientes, cliente] }));
      return cliente;
    },
    [set],
  );

  const actualizarCliente = useCallback<DemoStoreValue["actualizarCliente"]>(
    (id, cambios) =>
      set((db) => ({
        ...db,
        clientes: db.clientes.map((c) =>
          c.id === id ? { ...c, ...cambios, updated_at: ahora() } : c,
        ),
      })),
    [set],
  );

  const cambiarEstadoCliente = useCallback<DemoStoreValue["cambiarEstadoCliente"]>(
    (id, estado) => actualizarCliente(id, { estado }),
    [actualizarCliente],
  );

  const crearObra = useCallback<DemoStoreValue["crearObra"]>(
    (datos) => {
      const obra: Obra = {
        id: nuevoId(),
        ...datos,
        estado: "activa",
        created_at: ahora(),
        updated_at: ahora(),
      };
      set((db) => ({ ...db, obras: [...db.obras, obra] }));
      return obra;
    },
    [set],
  );

  const actualizarObra = useCallback<DemoStoreValue["actualizarObra"]>(
    (id, cambios) =>
      set((db) => ({
        ...db,
        obras: db.obras.map((o) => (o.id === id ? { ...o, ...cambios, updated_at: ahora() } : o)),
      })),
    [set],
  );

  const cambiarEstadoObra = useCallback<DemoStoreValue["cambiarEstadoObra"]>(
    (id, estado) => actualizarObra(id, { estado }),
    [actualizarObra],
  );

  const crearPresupuesto = useCallback<DemoStoreValue["crearPresupuesto"]>(
    (obraId) => {
      let creado!: Presupuesto;
      set((db) => {
        const siguienteNumero =
          db.presupuestos.reduce((max, p) => Math.max(max, p.numero), 0) + 1;
        creado = {
          id: nuevoId(),
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
        return { ...db, presupuestos: [...db.presupuestos, creado] };
      });
      return creado;
    },
    [set],
  );

  const actualizarNotasPresupuesto = useCallback<DemoStoreValue["actualizarNotasPresupuesto"]>(
    (id, notas) =>
      set((db) => ({
        ...db,
        presupuestos: db.presupuestos.map((p) =>
          p.id === id ? { ...p, notas, updated_at: ahora() } : p,
        ),
      })),
    [set],
  );

  const cambiarEstadoPresupuesto = useCallback<DemoStoreValue["cambiarEstadoPresupuesto"]>(
    (id, estado) =>
      set((db) => ({
        ...db,
        presupuestos: db.presupuestos.map((p) =>
          p.id === id ? { ...p, estado, updated_at: ahora() } : p,
        ),
      })),
    [set],
  );

  const crearCapitulo = useCallback<DemoStoreValue["crearCapitulo"]>(
    (presupuestoId, nombre) => {
      let creado!: Capitulo;
      set((db) => {
        const posiciones = db.capitulos
          .filter((c) => c.presupuesto_id === presupuestoId)
          .map((c) => c.posicion);
        creado = {
          id: nuevoId(),
          presupuesto_id: presupuestoId,
          nombre,
          posicion: (posiciones.length ? Math.max(...posiciones) : 0) + 1,
        };
        return { ...db, capitulos: [...db.capitulos, creado] };
      });
      return creado;
    },
    [set],
  );

  const renombrarCapitulo = useCallback<DemoStoreValue["renombrarCapitulo"]>(
    (id, nombre) =>
      set((db) => ({
        ...db,
        capitulos: db.capitulos.map((c) => (c.id === id ? { ...c, nombre } : c)),
      })),
    [set],
  );

  const eliminarCapitulo = useCallback<DemoStoreValue["eliminarCapitulo"]>(
    (id) =>
      set((db) => {
        const partidasDelCapitulo = db.partidas.filter((p) => p.capitulo_id === id);
        const presupuestoId = db.capitulos.find((c) => c.id === id)?.presupuesto_id;
        const siguiente = {
          ...db,
          capitulos: db.capitulos.filter((c) => c.id !== id),
          partidas: db.partidas.filter((p) => p.capitulo_id !== id),
        };
        void partidasDelCapitulo;
        return presupuestoId ? recalcularPresupuesto(siguiente, presupuestoId) : siguiente;
      }),
    [set],
  );

  const agregarPartidaDesdeTrabajo = useCallback<DemoStoreValue["agregarPartidaDesdeTrabajo"]>(
    (capituloId, trabajoSlug, descripcion, medicion) =>
      set((db) => {
        const desglose = calcularPartidaDesdeTrabajo(
          trabajoSlug,
          medicion,
          db.perfil,
          db.precios_usuario,
        );
        if (!desglose) return db;
        const posiciones = db.partidas
          .filter((p) => p.capitulo_id === capituloId)
          .map((p) => p.posicion);
        const partida: Partida = {
          id: nuevoId(),
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
        const siguiente = { ...db, partidas: [...db.partidas, partida] };
        const presupuestoId = db.capitulos.find((c) => c.id === capituloId)?.presupuesto_id;
        return presupuestoId ? recalcularPresupuesto(siguiente, presupuestoId) : siguiente;
      }),
    [set],
  );

  const eliminarPartida = useCallback<DemoStoreValue["eliminarPartida"]>(
    (id) =>
      set((db) => {
        const partida = db.partidas.find((p) => p.id === id);
        const capitulo = partida && db.capitulos.find((c) => c.id === partida.capitulo_id);
        const siguiente = { ...db, partidas: db.partidas.filter((p) => p.id !== id) };
        return capitulo ? recalcularPresupuesto(siguiente, capitulo.presupuesto_id) : siguiente;
      }),
    [set],
  );

  const fijarPrecioMaterial = useCallback<DemoStoreValue["fijarPrecioMaterial"]>(
    (materialNombre, precio) =>
      set((db) => {
        const sinEsteMaterial: PrecioMaterialUsuario[] = db.precios_usuario.filter(
          (p) => p.material_nombre !== materialNombre,
        );
        return {
          ...db,
          precios_usuario: [...sinEsteMaterial, { material_nombre: materialNombre, precio }],
        };
      }),
    [set],
  );

  const quitarPrecioMaterial = useCallback<DemoStoreValue["quitarPrecioMaterial"]>(
    (materialNombre) =>
      set((db) => ({
        ...db,
        precios_usuario: db.precios_usuario.filter((p) => p.material_nombre !== materialNombre),
      })),
    [set],
  );

  const value = useMemo<DemoStoreValue>(
    () => ({
      db,
      listo,
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
      eliminarPartida,
      fijarPrecioMaterial,
      quitarPrecioMaterial,
    }),
    [
      db,
      listo,
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
      eliminarPartida,
      fijarPrecioMaterial,
      quitarPrecioMaterial,
    ],
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error("useDemoStore must be used within DemoDataProvider");
  return ctx;
}
