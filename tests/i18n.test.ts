import { describe, it, expect } from "vitest";
import { es } from "@/lib/i18n/es";
import { en } from "@/lib/i18n/en";

describe("i18n paridad bilingüe", () => {
  it("todas las claves de español existen en inglés", () => {
    const esKeys = Object.keys(es);
    const enKeys = Object.keys(en);
    for (const k of esKeys) {
      expect(en).toHaveProperty(k);
    }
  });

  it("todas las claves de inglés existen en español", () => {
    const esKeys = Object.keys(es);
    const enKeys = Object.keys(en);
    for (const k of enKeys) {
      expect(es).toHaveProperty(k);
    }
  });

  it("ninguna clave tiene valor vacío", () => {
    for (const [k, v] of Object.entries(es)) {
      expect(v.length, `Clave ${k} en español está vacía`).toBeGreaterThan(0);
    }
    for (const [k, v] of Object.entries(en)) {
      expect(v.length, `Clave ${k} en inglés está vacía`).toBeGreaterThan(0);
    }
  });
});
