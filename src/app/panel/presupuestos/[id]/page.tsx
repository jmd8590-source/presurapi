import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  getPresupuestoCompleto,
  listClientes,
  listObras,
  listCapitulos,
  listPartidas,
} from "@/lib/data";
import { PresupuestoEditor } from "@/components/presupuestos/PresupuestoEditor";
import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";

export default async function EditarPresupuestoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ses = await getSession();
  if (!ses) redirect("/entrar");

  const [presupuesto, clientes, obras, capitulos, bancoPartidas, [emp]] =
    await Promise.all([
      getPresupuestoCompleto(ses.empresa.id, id),
      listClientes(ses.empresa.id),
      listObras(ses.empresa.id),
      listCapitulos(ses.empresa.id),
      listPartidas(ses.empresa.id),
      getDb().select().from(schema.empresa).where(eq(schema.empresa.id, ses.empresa.id)).limit(1),
    ]);

  if (!presupuesto) {
    notFound();
  }

  return (
    <PresupuestoEditor
      presupuestoExistente={presupuesto}
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
