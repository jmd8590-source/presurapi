// Identificadores compartidos de Appwrite (base de datos, tablas, cookie de
// sesión): un único sitio para no repetir literales entre server.ts,
// client.ts y store.tsx. Ver appwrite/DISENO.md para el porqué de cada tabla.
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
export const APPWRITE_DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "presurapi";

export const TABLA = {
  perfiles: "perfiles",
  clientes: "clientes",
  obras: "obras",
  presupuestos: "presupuestos",
  capitulos: "capitulos",
  partidas: "partidas",
  preciosUsuario: "precios_usuario",
} as const;

export const SESSION_COOKIE = "presurapi_session";
