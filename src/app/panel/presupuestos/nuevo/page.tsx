import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  listClientes,
  listObras,
  listCapitulos,
  listPartidas,
} from "@/lib/data";
import { PresupuestoEditor } from "@/components/presupuestos/PresupuestoEditor";
import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";

export default async function NuevoPresupuestoPage() {
  const ses = await getSession();
  if (!ses) redirect("/entrar");

  const [clientes, obras, capitulos, bancoPartidas, [emp]] = await Promise.all([
    listClientes(ses.empresa.id),
    listObras(ses.empresa.id),
    listCapitulos(ses.empresa.id),
    listPartidas(ses.empresa.id),
    getDb().select().from(schema.empresa).where(eq(schema.empresa.id, ses.empresa.id)).limit(1),
  ]);

  return (
    <PresupuestoEditor
      clientes={clientes.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        nif: "",
        email: c.email,
        telefono: c.telefono,
      }))}
      obras={obras.map((o) => ({
        id: o.id,
        nombre: o.nombre,
        clienteId: o.clienteId,
      }))}
      capitulos={capitulos.map((c) => ({
        id: c.id,
        nombre: c.nombre,
      }))}
      bancoPartidas={bancoPartidas}
      empresaIvaDefault={emp?.ivaPct ?? 21}
      empresaCondicionesDefault={emp?.condiciones ?? ""}
    />
  );
}
