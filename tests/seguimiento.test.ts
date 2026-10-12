import { describe, it, expect } from "vitest";

describe("Lógica de Alertas de Seguimiento", () => {
  it("clasifica correctamente presupuestos según días transcurridos", () => {
    const ahora = Date.now();
    const emision = new Date(ahora - 5 * 86_400_000).getTime();
    const validezDias = 30;
    const caducaMs = emision + validezDias * 86_400_000;

    const diasEmitido = Math.floor((ahora - emision) / 86_400_000);
    const diasParaCaducar = Math.ceil((caducaMs - ahora) / 86_400_000);

    expect(diasEmitido).toBe(5);
    expect(diasParaCaducar).toBe(25);
    // Debe requerir seguimiento porque lleva >= 3 días y no ha caducado
    const requiereSeguimiento = diasEmitido >= 3 && diasParaCaducar > 0;
    expect(requiereSeguimiento).toBe(true);
  });

  it("detecta presupuestos próximos a caducar (< 7 días)", () => {
    const ahora = Date.now();
    const emision = new Date(ahora - 25 * 86_400_000).getTime();
    const validezDias = 30;
    const caducaMs = emision + validezDias * 86_400_000;

    const diasParaCaducar = Math.ceil((caducaMs - ahora) / 86_400_000);
    expect(diasParaCaducar).toBe(5);
    expect(diasParaCaducar <= 7 && diasParaCaducar > 0).toBe(true);
  });
});
