import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { listClientes } from "@/lib/data";
import { ClientesView } from "@/components/clientes/ClientesView";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("clients.title") };
}

export default async function ClientesPage() {
  const session = await requireSession();
  const clientes = await listClientes(session.empresa.id);

  return <ClientesView clientes={clientes} />;
}
