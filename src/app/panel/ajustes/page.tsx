import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { AjustesView } from "@/components/ajustes/AjustesView";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("settings.title") };
}

export default async function AjustesPage() {
  const session = await requireSession();

  return <AjustesView empresa={session.empresa} />;
}
