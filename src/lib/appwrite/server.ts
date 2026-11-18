// Clientes de Appwrite para usar en servidor (server actions, layouts).
// Patrón oficial de Appwrite para Next.js App Router: una instancia nueva de
// Client por función, nunca compartida entre peticiones (evita filtrar la
// sesión de un usuario a otro). Ver appwrite/DISENO.md.
import "server-only";
import { cookies } from "next/headers";
import { Client, Account, TablesDB, Users } from "node-appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, SESSION_COOKIE } from "./config";

export async function createSessionClient() {
  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

  const secreto = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!secreto) return null;

  client.setSession(secreto);

  return {
    account: new Account(client),
    tablesDB: new TablesDB(client),
  };
}

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY!);

  return {
    account: new Account(client),
    tablesDB: new TablesDB(client),
    users: new Users(client),
  };
}

export async function getLoggedInUser() {
  const sesion = await createSessionClient();
  if (!sesion) return null;
  try {
    return await sesion.account.get();
  } catch {
    return null;
  }
}
