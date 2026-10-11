import { z } from "zod";

// Los mensajes de error son CLAVES de traducción (val.*): la interfaz las traduce.
const text = (max: number) => z.string().trim().max(max, "val.tooLong");
const required = (max: number) => z.string().trim().min(1, "val.required").max(max, "val.tooLong");

/** Valida DNI, NIE y CIF españoles con su dígito de control. */
export function isValidSpanishTaxId(raw: string): boolean {
  const id = raw.replace(/[\s.-]/g, "").toUpperCase();
  const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
  if (/^\d{8}[A-Z]$/.test(id)) return letters[Number(id.slice(0, 8)) % 23] === id[8];
  if (/^[XYZ]\d{7}[A-Z]$/.test(id)) {
    const n = Number("XYZ".indexOf(id[0]) + id.slice(1, 8));
    return letters[n % 23] === id[8];
  }
  if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(id)) {
    const digits = id.slice(1, 8).split("").map(Number);
    let sum = 0;
    digits.forEach((d, i) => {
      if (i % 2 === 0) {
        const doubled = d * 2;
        sum += Math.floor(doubled / 10) + (doubled % 10);
      } else sum += d;
    });
    const control = (10 - (sum % 10)) % 10;
    const letter = "JABCDEFGHI"[control];
    const kind = id[0];
    const last = id[8];
    if ("PQRSNW".includes(kind)) return last === letter;
    if ("ABEH".includes(kind)) return last === String(control);
    return last === String(control) || last === letter;
  }
  return false;
}

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "val.required")
  .max(254, "val.tooLong")
  .email("val.email");

/** Mínimo 10 caracteres y no solo letras ni solo números. */
export const passwordSchema = z
  .string()
  .min(10, "val.passwordShort")
  .max(200, "val.tooLong")
  .refine((v) => /[A-Za-z]/.test(v) && /[^A-Za-z]/.test(v), "val.passwordWeak");

export const registerSchema = z
  .object({
    nombre: required(80),
    email: emailSchema,
    password: passwordSchema,
    password2: z.string(),
    acepto: z.literal("on", "auth.err.terms"),
  })
  .refine((v) => v.password === v.password2, { path: ["password2"], message: "auth.err.mismatch" });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "val.required").max(200),
});

export const resetSchema = z
  .object({ password: passwordSchema, password2: z.string() })
  .refine((v) => v.password === v.password2, { path: ["password2"], message: "auth.err.mismatch" });

const phone = text(25).refine((v) => v === "" || /^[+\d][\d\s().-]{5,}$/.test(v), "val.phone");

export const onboardingSchema = z.object({
  nombre: required(120),
  cif: required(20).refine(isValidSpanishTaxId, "val.cif"),
  direccion: required(200),
  cp: text(10),
  poblacion: text(80),
  provincia: text(80),
  telefono: phone,
  emailContacto: z.union([z.literal(""), emailSchema]),
  ivaPct: z.coerce.number("val.vat").min(0, "val.vat").max(100, "val.vat"),
  condiciones: text(4000),
  piePdf: text(500),
});

export const clienteSchema = z.object({
  nombre: required(120),
  nif: text(20),
  email: z.union([z.literal(""), emailSchema]),
  telefono: phone,
  direccion: text(200),
  notas: text(2000),
});

export const obraSchema = z.object({
  clienteId: z.string().min(1, "val.required").max(64),
  nombre: required(120),
  direccion: text(200),
  estado: z.enum(["pendiente", "en_curso", "terminada", "cancelada"]),
  notas: text(2000),
});

export const cambioPasswordSchema = z
  .object({ actual: z.string().min(1, "val.required").max(200), password: passwordSchema, password2: z.string() })
  .refine((v) => v.password === v.password2, { path: ["password2"], message: "auth.err.mismatch" });

export type FieldErrors = Record<string, string>;

/** Convierte los errores de zod en { campo: claveDeTraducción }. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/** Pasa un FormData a objeto de textos (solo valores string; ficheros descartados). */
export function formToObject(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") out[k] = v;
  return out;
}
