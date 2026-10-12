"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  createPartida,
  updatePartida,
  deletePartida,
  seedBancoBase,
  PartidaInput,
} from "@/lib/data";

export async function precargarCatalogoBaseAccion() {
  const ses = await getSession();
  if (!ses) return { ok: false, error: "No autenticado" };
  try {
    await seedBancoBase(ses.empresa.id);
    revalidatePath("/panel/banco");
    revalidatePath("/panel/presupuestos");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Error al cargar catálogo" };
  }
}

export async function crearPartidaAccion(data: PartidaInput) {
  const ses = await getSession();
  if (!ses) return { ok: false, error: "No autenticado" };
  if (!data.concepto.trim()) return { ok: false, error: "El concepto es obligatorio" };

  try {
    const id = await createPartida(ses.empresa.id, data);
    revalidatePath("/panel/banco");
    return { ok: true, id };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Error al crear partida" };
  }
}

export async function actualizarPartidaAccion(id: string, data: PartidaInput) {
  const ses = await getSession();
  if (!ses) return { ok: false, error: "No autenticado" };

  try {
    const ok = await updatePartida(ses.empresa.id, id, data);
    revalidatePath("/panel/banco");
    return { ok };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Error al actualizar" };
  }
}

export async function eliminarPartidaAccion(id: string) {
  const ses = await getSession();
  if (!ses) return { ok: false, error: "No autenticado" };

  try {
    const ok = await deletePartida(ses.empresa.id, id);
    revalidatePath("/panel/banco");
    return { ok };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Error al eliminar" };
  }
}
