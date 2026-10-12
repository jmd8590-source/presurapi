import { describe, it, expect } from "vitest";
import {
  calcularTotales,
  formatearEuros,
  eurosACentimos,
  centimosAEuros,
  calcularImporteLinea,
  LineaCalculo,
} from "@/lib/calculo";

describe("Motor canónico de cálculo de presupuestos", () => {
  it("convierte euros a céntimos y viceversa sin errores de coma flotante", () => {
    expect(eurosACentimos(10.55)).toBe(1055);
    expect(eurosACentimos("10,55")).toBe(1055);
    expect(eurosACentimos("1.250,50")).toBe(125050);
    expect(centimosAEuros(1055)).toBe(10.55);
    expect(formatearEuros(1055)).toContain("10,55");
  });

  it("calcula líneas con redondeo exacto", () => {
    // 3.5 m2 a 45.30 € = 158.55 € = 15855 céntimos
    const precioCents = 4530;
    const importe = calcularImporteLinea(3.5, precioCents);
    expect(importe).toBe(15855);
  });

  it("separa líneas base de opcionales y calcula IVA 21%", () => {
    const lineas: LineaCalculo[] = [
      {
        cantidad: 10,
        precioUnitario: 5000, // 50 € -> 500 € total
        costeUnitario: 3000,  // 30 € -> 300 € total coste
        esOpcional: false,
      },
      {
        cantidad: 1,
        precioUnitario: 12000, // 120 € opcional
        costeUnitario: 8000,   // 80 € opcional
        esOpcional: true,
      },
    ];

    const totales = calcularTotales(lineas, { ivaPct: 21 });

    // Subtotal base venta: 500 € = 50000 céntimos
    expect(totales.subtotalBaseVenta).toBe(50000);
    // Subtotal opcionales venta: 120 € = 12000 céntimos
    expect(totales.subtotalOpcionalesVenta).toBe(12000);

    // Base imponible: 500 €
    expect(totales.baseImponible).toBe(50000);
    // IVA 21%: 105 € = 10500 céntimos
    expect(totales.ivaCents).toBe(10500);
    // Total presupuesto: 605 € = 60500 céntimos
    expect(totales.totalPresupuesto).toBe(60500);

    // Margen: (500 - 300) / 500 = 40% -> verde
    expect(totales.beneficioBruto).toBe(20000);
    expect(totales.margenPct).toBe(40);
    expect(totales.semaforo).toBe("verde");
  });

  it("calcula semáforos de rentabilidad (ámbar y rojo) correctamente", () => {
    // Caso ámbar: venta 100 €, coste 78 € -> margen 22%
    const lineasAmbar: LineaCalculo[] = [
      {
        cantidad: 1,
        precioUnitario: 10000,
        costeUnitario: 7800,
        esOpcional: false,
      },
    ];
    const totAmbar = calcularTotales(lineasAmbar);
    expect(totAmbar.margenPct).toBe(22);
    expect(totAmbar.semaforo).toBe("ambar");

    // Caso rojo: venta 100 €, coste 92 € -> margen 8%
    const lineasRojo: LineaCalculo[] = [
      {
        cantidad: 1,
        precioUnitario: 10000,
        costeUnitario: 9200,
        esOpcional: false,
      },
    ];
    const totRojo = calcularTotales(lineasRojo);
    expect(totRojo.margenPct).toBe(8);
    expect(totRojo.semaforo).toBe("rojo");
  });
});
