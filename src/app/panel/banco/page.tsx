import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listCapitulos, listPartidas } from "@/lib/data";
import { BancoView } from "@/components/banco/BancoView";

export default async function BancoPage() {
  const ses = await getSession();
  if (!ses) redirect("/entrar");

  const [capitulos, partidas] = await Promise.all([
    listCapitulos(ses.empresa.id),
    listPartidas(ses.empresa.id),
  ]);

  return <BancoView capitulos={capitulos} partidas={partidas} />;
}
