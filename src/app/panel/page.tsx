import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { resumen } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { DashboardView } from "@/components/dashboard/DashboardView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("home.title") };
}

export default async function PanelInicioPage() {
  const session = await requireSession();
  const data = await resumen(session.empresa.id);

  return (
    <DashboardView
      data={{
        usuarioNombre: session.usuario.nombre,
        empresaNombre: session.empresa.nombre,
        clientes: data.clientes,
        obras: data.obras,
        obrasEnCurso: data.obrasEnCurso,
        presupuestosTotal: data.presupuestosTotal,
        presupuestosBorrador: data.presupuestosBorrador,
        presupuestosEnviado: data.presupuestosEnviado,
        presupuestosAceptado: data.presupuestosAceptado,
        presupuestosRechazado: data.presupuestosRechazado,
        totalAceptadoCents: data.totalAceptadoCents,
        totalEnviadoCents: data.totalEnviadoCents,
        tasaConversion: data.tasaConversion,
        recientes: data.recientes,
        alertas: data.alertas,
      }}
    />
  );
}
