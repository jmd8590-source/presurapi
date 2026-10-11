"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { createCliente, updateCliente, deleteCliente } from "@/lib/data";
import { clienteSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

export type ClienteActionResult = {
  ok: boolean;
  errors?: FieldErrors;
  generalError?: string;
};

export async function createClienteAction(
  _prev: ClienteActionResult | null,
  formData: FormData
): Promise<ClienteActionResult> {
  const session = await requireSession();
  const parsed = clienteSchema.safeParse({
    nombre: formData.get("nombre"),
    nif: formData.get("nif"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    direccion: formData.get("direccion"),
    notas: formData.get("notas"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  await createCliente(session.empresa.id, parsed.data);
  revalidatePath("/panel/clientes");
  revalidatePath("/panel");
  return { ok: true };
}

export async function updateClienteAction(
  id: string,
  _prev: ClienteActionResult | null,
  formData: FormData
): Promise<ClienteActionResult> {
  const session = await requireSession();
  const parsed = clienteSchema.safeParse({
    nombre: formData.get("nombre"),
    nif: formData.get("nif"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    direccion: formData.get("direccion"),
    notas: formData.get("notas"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const updated = await updateCliente(session.empresa.id, id, parsed.data);
  if (!updated) {
    return { ok: false, generalError: "common.error" };
  }

  revalidatePath("/panel/clientes");
  return { ok: true };
}

export async function deleteClienteAction(id: string): Promise<{ ok: boolean; errorKey?: string }> {
  const session = await requireSession();
  const res = await deleteCliente(session.empresa.id, id);
  if (res === "has_works") {
    return { ok: false, errorKey: "clients.hasWorks" };
  }
  if (!res) {
    return { ok: false, errorKey: "common.error" };
  }

  revalidatePath("/panel/clientes");
  revalidatePath("/panel");
  return { ok: true };
}
