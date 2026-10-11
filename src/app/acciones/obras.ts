"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { createObra, updateObra, deleteObra } from "@/lib/data";
import { obraSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

export type ObraActionResult = {
  ok: boolean;
  errors?: FieldErrors;
  generalError?: string;
};

export async function createObraAction(
  _prev: ObraActionResult | null,
  formData: FormData
): Promise<ObraActionResult> {
  const session = await requireSession();
  const parsed = obraSchema.safeParse({
    clienteId: formData.get("clienteId"),
    nombre: formData.get("nombre"),
    direccion: formData.get("direccion"),
    estado: formData.get("estado"),
    notas: formData.get("notas"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const id = await createObra(session.empresa.id, parsed.data);
  if (!id) {
    return { ok: false, generalError: "works.needClient" };
  }

  revalidatePath("/panel/obras");
  revalidatePath("/panel");
  return { ok: true };
}

export async function updateObraAction(
  id: string,
  _prev: ObraActionResult | null,
  formData: FormData
): Promise<ObraActionResult> {
  const session = await requireSession();
  const parsed = obraSchema.safeParse({
    clienteId: formData.get("clienteId"),
    nombre: formData.get("nombre"),
    direccion: formData.get("direccion"),
    estado: formData.get("estado"),
    notas: formData.get("notas"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const updated = await updateObra(session.empresa.id, id, parsed.data);
  if (!updated) {
    return { ok: false, generalError: "common.error" };
  }

  revalidatePath("/panel/obras");
  revalidatePath("/panel");
  return { ok: true };
}

export async function deleteObraAction(id: string): Promise<{ ok: boolean }> {
  const session = await requireSession();
  await deleteObra(session.empresa.id, id);
  revalidatePath("/panel/obras");
  revalidatePath("/panel");
  return { ok: true };
}
