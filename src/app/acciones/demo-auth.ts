"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DEMO_SESSION_COOKIE } from "@/lib/demo/session";

// Acciones de la sesión de demostración: NO verifican contraseña ni email
// real, solo guardan el email en una cookie para poder enseñar el panel.
// El login/registro de verdad (Supabase Auth, verificación de email) llega
// cuando exista el proyecto Supabase.

const credencialesSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type EstadoAccionDemo = { error: string | null };

async function crearSesionDemo(formData: FormData): Promise<EstadoAccionDemo> {
  const resultado = credencialesSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!resultado.success) {
    return { error: "invalid" };
  }

  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE, resultado.data.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/panel");
}

export async function iniciarSesionDemo(
  _prevState: EstadoAccionDemo,
  formData: FormData,
): Promise<EstadoAccionDemo> {
  return crearSesionDemo(formData);
}

export async function registrarDemo(
  _prevState: EstadoAccionDemo,
  formData: FormData,
): Promise<EstadoAccionDemo> {
  return crearSesionDemo(formData);
}

export async function cerrarSesionDemo() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE);
  redirect("/");
}
