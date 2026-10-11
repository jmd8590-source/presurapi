import { describe, it, expect } from "vitest";
import { DatabaseSync } from "node:sqlite";

describe("Aislamiento multiempresa (Tenant Isolation)", () => {
  it("aísla estrictamente los datos entre empresas A y B a nivel de consulta SQL", () => {
    const db = new DatabaseSync(":memory:");

    // Crear tablas
    db.exec(`
      CREATE TABLE empresa (id TEXT PRIMARY KEY, nombre TEXT NOT NULL);
      CREATE TABLE cliente (id TEXT PRIMARY KEY, empresa_id TEXT NOT NULL, nombre TEXT NOT NULL);
      CREATE TABLE obra (id TEXT PRIMARY KEY, empresa_id TEXT NOT NULL, cliente_id TEXT NOT NULL, nombre TEXT NOT NULL);
    `);

    const empresaA = "empresa-a-uuid";
    const empresaB = "empresa-b-uuid";

    // Insertar clientes para empresa A y B
    const insert = db.prepare("INSERT INTO cliente (id, empresa_id, nombre) VALUES (?, ?, ?)");
    insert.run("c1", empresaA, "Cliente de A");
    insert.run("c2", empresaB, "Cliente de B");

    // Consulta de empresa A: solo ve sus clientes
    const clientesDeA = db.prepare("SELECT * FROM cliente WHERE empresa_id = ?").all(empresaA) as Array<{ id: string; nombre: string }>;
    expect(clientesDeA.length).toBe(1);
    expect(clientesDeA[0].id).toBe("c1");
    expect(clientesDeA[0].nombre).toBe("Cliente de A");

    // Intento de empresa B de acceder o borrar el cliente de A con su empresaId
    const resDelete = db.prepare("DELETE FROM cliente WHERE id = ? AND empresa_id = ?").run("c1", empresaB);
    expect(resDelete.changes).toBe(0);

    // El cliente de A sigue existiendo intacto
    const clienteAStillExists = db.prepare("SELECT * FROM cliente WHERE id = ?").all("c1");
    expect(clienteAStillExists.length).toBe(1);

    db.close();
  });
});
