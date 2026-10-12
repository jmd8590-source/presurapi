import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listPresupuestos } from "@/lib/data";
import { PresupuestosListView } from "@/components/presupuestos/PresupuestosListView";

export default async function PresupuestosPage() {
  const ses = await getSession();
  if (!ses) redirect("/entrar");

  const presupuestos = await listPresupuestos(ses.empresa.id);

  return <PresupuestosListView presupuestos={presupuestos} />;
}
