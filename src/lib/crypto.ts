// Utilidades criptográficas basadas en WebCrypto y @noble/hashes (válidas en Workers).
import { scryptAsync } from "@noble/hashes/scrypt.js";

// Parámetros estándar RFC 7914 para autenticación interactiva en servidor/edge:
// N=2^14 (16.384), r=8, p=1 (coste de memoria ≈ 16 MiB, tiempo ≈ 80 ms).
const N = 2 ** 14;
const R = 8;
const P = 1;
const KEYLEN = 32;

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
export function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function randomToken(bytes = 32): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toHex(new Uint8Array(digest));
}

/** Comparación en tiempo constante. */
export function safeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await scryptAsync(password.normalize("NFKC"), salt, { N, r: R, p: P, dkLen: KEYLEN });
  return `scrypt$${N}$${R}$${P}$${toHex(salt)}$${toHex(key)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltHex, keyHex] = parts;
  const key = await scryptAsync(password.normalize("NFKC"), fromHex(saltHex), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    dkLen: KEYLEN,
  });
  return safeEqual(key, fromHex(keyHex));
}

/** Hash ficticio para igualar tiempos cuando el usuario no existe (evita enumerar cuentas). */
let dummy: Promise<string> | null = null;
export function dummyHash(): Promise<string> {
  dummy ??= hashPassword("presurapi-dummy-password-0");
  return dummy;
}
