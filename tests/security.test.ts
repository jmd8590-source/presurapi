import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, sha256Hex, randomToken } from "@/lib/crypto";
import { isValidSpanishTaxId } from "@/lib/validation";

describe("Seguridad y validación", () => {
  it("valida DNI, NIE y CIF españoles correctamente", () => {
    // CIF válido de empresa (B)
    expect(isValidSpanishTaxId("B12345674")).toBe(true);
    // DNI válido con letra de control correcta
    expect(isValidSpanishTaxId("12345678Z")).toBe(true);
    // CIF erróneo
    expect(isValidSpanishTaxId("B66412907")).toBe(false);
    // Formato inválido
    expect(isValidSpanishTaxId("123")).toBe(false);
  });

  it("hashea y verifica contraseñas con scrypt", async () => {
    const password = "ContraseñaFuerte123!";
    const hash = await hashPassword(password);

    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("passwordErronea", hash)).toBe(false);
  });

  it("genera tokens criptográficos y sha256hex consistentes", async () => {
    const t1 = randomToken(32);
    const t2 = randomToken(32);
    expect(t1.length).toBe(64); // 32 bytes en hex = 64 chars
    expect(t1).not.toBe(t2);

    const hash = await sha256Hex("prueba");
    expect(hash).toBe("655e786674d9d3e77bc05ed1de37b4b6bc89f788829f9f3c679e7687b410c89b");
  });
});
