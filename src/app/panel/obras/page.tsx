import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { listObras, listClientes } from "@/lib/data";
import { ObrasView } from "@/components/obras/ObrasView";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("works.title") };
}

export default async function ObrasPage() {
  const session = await requireSession();
  const [obras, clientes] = await Promise.all([
    listObras(session.empresa.id),
    listClientes(session.empresa.id),
  ]);

  return <ObrasView obras={obras} clientes={clientes} />;
}
