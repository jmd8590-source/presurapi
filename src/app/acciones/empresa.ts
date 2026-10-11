"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, getEnv, schema } from "@/db";
import { requireSession } from "@/lib/session";
import { onboardingSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

export type OnboardingResult = {
  ok: boolean;
  errors?: FieldErrors;
  generalError?: string;
};

export async function saveOnboardingAction(
  _prev: OnboardingResult | null,
  formData: FormData
): Promise<OnboardingResult> {
  const session = await requireSession();
  const empresaId = session.empresa.id;

  const parsed = onboardingSchema.safeParse({
    nombre: formData.get("nombre"),
    cif: formData.get("cif"),
    direccion: formData.get("direccion"),
    cp: formData.get("cp"),
    poblacion: formData.get("poblacion"),
    provincia: formData.get("provincia"),
    telefono: formData.get("telefono"),
    emailContacto: formData.get("emailContacto"),
    ivaPct: formData.get("ivaPct"),
    condiciones: formData.get("condiciones"),
    piePdf: formData.get("piePdf"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  let logoKey = session.empresa.logoKey;

  // Manejo de subida de logotipo a R2 si se envió archivo
  const logoFile = formData.get("logo");
  if (logoFile && logoFile instanceof File && logoFile.size > 0) {
    if (logoFile.size > 1024 * 1024) {
      return { ok: false, errors: { logo: "onb.logoHint" } };
    }
    const env = getEnv();
    if (env.LOGOS) {
      const ext = logoFile.name.split(".").pop() || "png";
      const key = `logos/${empresaId}-${Date.now()}.${ext}`;
      const buffer = await logoFile.arrayBuffer();
      await env.LOGOS.put(key, buffer, {
        httpMetadata: { contentType: logoFile.type || "image/png" },
      });
      logoKey = key;
    }
  }

  const db = getDb();
  await db
    .update(schema.empresa)
    .set({
      nombre: data.nombre,
      cif: data.cif,
      direccion: data.direccion,
      cp: data.cp,
      poblacion: data.poblacion,
      provincia: data.provincia,
      telefono: data.telefono,
      emailContacto: data.emailContacto,
      logoKey,
      ivaPct: data.ivaPct,
      condiciones: data.condiciones,
      piePdf: data.piePdf,
      onboardingHecho: true,
    })
    .where(eq(schema.empresa.id, empresaId));

  redirect("/panel");
}

export async function updateEmpresaSettingsAction(
  _prev: OnboardingResult | null,
  formData: FormData
): Promise<OnboardingResult> {
  const session = await requireSession();
  const empresaId = session.empresa.id;

  const parsed = onboardingSchema.safeParse({
    nombre: formData.get("nombre"),
    cif: formData.get("cif"),
    direccion: formData.get("direccion"),
    cp: formData.get("cp"),
    poblacion: formData.get("poblacion"),
    provincia: formData.get("provincia"),
    telefono: formData.get("telefono"),
    emailContacto: formData.get("emailContacto"),
    ivaPct: formData.get("ivaPct"),
    condiciones: formData.get("condiciones"),
    piePdf: formData.get("piePdf"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  let logoKey = session.empresa.logoKey;

  const logoFile = formData.get("logo");
  if (logoFile && logoFile instanceof File && logoFile.size > 0) {
    if (logoFile.size > 1024 * 1024) {
      return { ok: false, errors: { logo: "onb.logoHint" } };
    }
    const env = getEnv();
    if (env.LOGOS) {
      const ext = logoFile.name.split(".").pop() || "png";
      const key = `logos/${empresaId}-${Date.now()}.${ext}`;
      const buffer = await logoFile.arrayBuffer();
      await env.LOGOS.put(key, buffer, {
        httpMetadata: { contentType: logoFile.type || "image/png" },
      });
      logoKey = key;
    }
  }

  const db = getDb();
  await db
    .update(schema.empresa)
    .set({
      nombre: data.nombre,
      cif: data.cif,
      direccion: data.direccion,
      cp: data.cp,
      poblacion: data.poblacion,
      provincia: data.provincia,
      telefono: data.telefono,
      emailContacto: data.emailContacto,
      logoKey,
      ivaPct: data.ivaPct,
      condiciones: data.condiciones,
      piePdf: data.piePdf,
    })
    .where(eq(schema.empresa.id, empresaId));

  return { ok: true };
}
