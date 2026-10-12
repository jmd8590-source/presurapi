"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  createPresupuesto,
  updatePresupuesto,
  cambiarEstadoPresupuesto,
  deletePresupuesto,
  duplicarPresupuesto,
  PresupuestoInput,
} from "@/lib/data";
import type { EstadoPresupuesto } from "@/db/schema";

export async function crearPresupuestoAccion(input: PresupuestoInput) {
  const ses = await getSession();
  if (!ses) return { ok: false, error: "No autenticado" };
  if (!input.clienteId) return { ok: false, error: "Debes seleccionar un cliente" };
  if (!input.titulo.trim()) return { ok: false, error: "El título es obligatorio" };

  try {
    const id = await createPresupuesto(ses.empresa.id, input);
    revalidatePath("/panel/presupuestos");
    revalidatePath("/panel");
    return { ok: true, id };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Error al crear presupuesto" };
  }
}

export async function actualizarPresupuestoAccion(id: string, input: PresupuestoInput) {
  const ses = await getSession();
  if (!ses) return { ok: false, error: "No autenticado" };
  if (!input.clienteId) return { ok: false, error: "Debes seleccionar un cliente" };
  if (!input.titulo.trim()) return { ok: false, error: "El título es obligatorio" };

  try {
    const ok = await updatePresupuesto(ses.empresa.id, id, input);
    revalidatePath(`/panel/presupuestos/${id}`);
    revalidatePath(`/panel/presupuestos`);
    revalidatePath("/panel");
    return { ok };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Error al actualizar presupuesto" };
  }
}

export async function cambiarEstadoPresupuestoAccion(id: string, estado: EstadoPresupuesto) {
  const ses = await getSession();
  if (!ses) return { ok: false, error: "No autenticado" };

  try {
    const ok = await cambiarEstadoPresupuesto(ses.empresa.id, id, estado);
    revalidatePath("/panel/presupuestos");
    revalidatePath("/panel");
    return { ok };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Error al cambiar estado" };
  }
}

export async function duplicarPresupuestoAccion(id: string) {
  const ses = await getSession();
  if (!ses) return { ok: false, error: "No autenticado" };

  try {
    const nuevoId = await duplicarPresupuesto(ses.empresa.id, id);
    revalidatePath("/panel/presupuestos");
    return { ok: true, id: nuevoId };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Error al duplicar presupuesto" };
  }
}

export async function eliminarPresupuestoAccion(id: string) {
  const ses = await getSession();
  if (!ses) return { ok: false, error: "No autenticado" };

  try {
    const ok = await deletePresupuesto(ses.empresa.id, id);
    revalidatePath("/panel/presupuestos");
    revalidatePath("/panel");
    return { ok };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Error al eliminar presupuesto" };
  }
}
