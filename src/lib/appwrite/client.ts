"use client";

// Cliente de Appwrite para el navegador: se hidrata con el secreto de la
// cookie de sesión (leído en el servidor y pasado como prop, nunca accesible
// directamente desde JS porque la cookie es httpOnly) para que las llamadas a
// TablesDB desde el store queden autenticadas como el usuario, y así los
// permisos por documento de Appwrite se aplican de verdad.
import { Client, Account, TablesDB } from "appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "./config";

export function crearClienteNavegador(sessionSecret: string) {
  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
  client.setSession(sessionSecret);

  return {
    account: new Account(client),
    tablesDB: new TablesDB(client),
  };
}
