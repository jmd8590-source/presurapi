"use server";

// Acciones de autenticación real contra Appwrite: sustituyen al login
// simulado de la demo (ver el commit que retiró el modo demostración).
// Patrón de sesión: Appwrite crea la sesión con la API key de servidor
// (nunca desde el navegador) y el secreto va en una cookie httpOnly propia;
// ver src/lib/appwrite/server.ts.
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AppwriteException, ID, Permission, Query, Role, type Models } from "node-appwrite";
import { createAdminClient, createSessionClient, getLoggedInUser } from "@/lib/appwrite/server";
import { APPWRITE_DATABASE_ID, SESSION_COOKIE, TABLA } from "@/lib/appwrite/config";

export type EstadoAccion = { error: string | null };

async function establecerCookieSesion(secret: string, expire: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expire),
  });
}

async function origenApp(): Promise<string> {
  const origin = (await headers()).get("origin");
  return origin ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

const credencialesSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function iniciarSesion(
  _prevState: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const resultado = credencialesSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!resultado.success) return { error: "invalid" };

  const { account } = createAdminClient();
  try {
    const session = await account.createEmailPasswordSession({
      email: resultado.data.email,
      password: resultado.data.password,
    });
    await establecerCookieSesion(session.secret, session.expire);
  } catch {
    // No distinguir "no existe" de "contraseña incorrecta": evita que se
    // pueda usar el login para averiguar qué emails están registrados.
    return { error: "invalid" };
  }
  redirect("/panel");
}

const registroSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8),
    password_confirm: z.string().min(8),
  })
  .refine((datos) => datos.password === datos.password_confirm, { message: "mismatch" });

export async function registrar(
  _prevState: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const resultado = registroSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    password_confirm: formData.get("password_confirm"),
  });
  if (!resultado.success) {
    const esDesajuste = resultado.error.issues.some((i) => i.message === "mismatch");
    return { error: esDesajuste ? "mismatch" : "invalid" };
  }

  const { account, tablesDB } = createAdminClient();
  const userId = ID.unique();

  try {
    await account.create({
      userId,
      email: resultado.data.email,
      password: resultado.data.password,
    });
  } catch (err) {
    if (err instanceof AppwriteException && err.type === "user_already_exists") {
      return { error: "exists" };
    }
    return { error: "invalid" };
  }

  try {
    await tablesDB.createRow<Models.DefaultRow>({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLA.perfiles,
      rowId: userId,
      data: { email_cuenta: resultado.data.email },
      permissions: [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))],
    });
  } catch (err) {
    // El login sigue funcionando sin perfil: el store usa valores por
    // defecto y el usuario puede completarlos en Ajustes.
    console.error("No se pudo crear el perfil inicial:", err);
  }

  const session = await account.createEmailPasswordSession({
    email: resultado.data.email,
    password: resultado.data.password,
  });
  await establecerCookieSesion(session.secret, session.expire);
  redirect("/panel");
}

export async function cerrarSesion() {
  const sesion = await createSessionClient();
  if (sesion) {
    try {
      await sesion.account.deleteSession({ sessionId: "current" });
    } catch {
      // Sesión ya inválida en Appwrite (p. ej. caducada): no pasa nada, se
      // borra la cookie igual.
    }
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/");
}

const recuperacionSchema = z.object({ email: z.string().trim().toLowerCase().email() });

export type EstadoRecuperacion = { error: string | null; enviado: boolean };

export async function solicitarRecuperacion(
  _prevState: EstadoRecuperacion,
  formData: FormData,
): Promise<EstadoRecuperacion> {
  const resultado = recuperacionSchema.safeParse({ email: formData.get("email") });
  if (!resultado.success) return { error: "invalid", enviado: false };

  const { account } = createAdminClient();
  try {
    await account.createRecovery({
      email: resultado.data.email,
      url: `${await origenApp()}/recuperar/restablecer`,
    });
  } catch {
    // Igual que en el login: no revelar si el email existe o no.
  }
  return { error: null, enviado: true };
}

const restablecerSchema = z.object({
  userId: z.string().min(1),
  secret: z.string().min(1),
  password: z.string().min(8),
  password_confirm: z.string().min(8),
});

export async function restablecerContrasena(
  _prevState: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const resultado = restablecerSchema.safeParse({
    userId: formData.get("userId"),
    secret: formData.get("secret"),
    password: formData.get("password"),
    password_confirm: formData.get("password_confirm"),
  });
  if (!resultado.success) return { error: "invalid" };
  if (resultado.data.password !== resultado.data.password_confirm) {
    return { error: "mismatch" };
  }

  const { account } = createAdminClient();
  try {
    await account.updateRecovery({
      userId: resultado.data.userId,
      secret: resultado.data.secret,
      password: resultado.data.password,
    });
  } catch {
    return { error: "expired" };
  }
  redirect("/entrar?recuperada=1");
}

export async function borrarCuentaCompleta() {
  const usuario = await getLoggedInUser();
  if (!usuario) redirect("/entrar");

  const { tablesDB, users } = createAdminClient();
  const tablasPropias = [
    TABLA.clientes,
    TABLA.obras,
    TABLA.presupuestos,
    TABLA.capitulos,
    TABLA.partidas,
    TABLA.preciosUsuario,
  ];

  for (const tableId of tablasPropias) {
    for (;;) {
      const pagina = await tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId,
        queries: [Query.equal("user_id", usuario.$id), Query.limit(100)],
      });
      if (pagina.rows.length === 0) break;
      await Promise.all(
        pagina.rows.map((fila) =>
          tablesDB.deleteRow({ databaseId: APPWRITE_DATABASE_ID, tableId, rowId: fila.$id }),
        ),
      );
      if (pagina.rows.length < 100) break;
    }
  }

  await tablesDB
    .deleteRow({ databaseId: APPWRITE_DATABASE_ID, tableId: TABLA.perfiles, rowId: usuario.$id })
    .catch(() => {});
  await users.delete({ userId: usuario.$id });

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/");
}
