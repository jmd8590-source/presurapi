import { describe, it, expect } from "vitest";
import { generarPdfPresupuesto } from "@/lib/pdf";

describe("Generación de PDF de presupuestos", () => {
  it("genera un PDF válido comenzando por la cabecera %PDF", async () => {
    const bytes = await generarPdfPresupuesto(
      {
        nombre: "Reformas Jesús S.L.",
        cif: "B12345678",
        telefono: "600123456",
        emailContacto: "contacto@reformasjesus.es",
        direccion: "Calle Mayor 10",
        cp: "28001",
        poblacion: "Madrid",
        provincia: "Madrid",
        piePdf: "Presupuesto válido según condiciones generales.",
      },
      {
        codigo: "PRE-2026-001",
        titulo: "Reforma Integral de Baño",
        validezDias: 30,
        fechaEmision: new Date("2026-05-10"),
        ivaPct: 21,
        retencionPct: 0,
        descuentoPct: 0,
        condiciones: "Forma de pago: 50% al inicio, 50% a la finalización.",
        notasCliente: "Incluye desescombro y retirada a punto limpio.",
        cliente: {
          nombre: "Antonio Gómez",
          email: "antonio@ejemplo.com",
          telefono: "611222333",
          direccion: "Av. Constitución 4",
          poblacion: "Madrid",
        },
        obra: {
          nombre: "Piso Centro",
          direccion: "Av. Constitución 4, 3ºB",
        },
        opciones: [
          {
            id: "opc_1",
            nombre: "Estándar",
            esSeleccionada: true,
            lineas: [
              {
                id: "lin_1",
                concepto: "Alicatado de paredes",
                descripcion: "Azulejo porcelánico rectificado",
                unidad: "m²",
                cantidad: 25,
                precioUnitario: 3500, // 35,00 €
                esOpcional: false,
              },
              {
                id: "lin_2",
                concepto: "Mampara de cristal templado",
                descripcion: "Fijo + corredera antical",
                unidad: "ud",
                cantidad: 1,
                precioUnitario: 42000, // 420,00 €
                esOpcional: true,
              },
            ],
          },
        ],
      }
    );

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(1000);
    // Verificamos cabecera mágica de PDF (%PDF)
    const header = String.fromCharCode(...bytes.subarray(0, 5));
    expect(header).toBe("%PDF-");
  });
});
