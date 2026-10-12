import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { resumen } from "@/lib/data";
import { T } from "@/components/T";
import { getT } from "@/lib/i18n/server";
import { IconUsers, IconHammer, IconPlus, IconFileText, IconDatabase } from "@/components/Icons";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("home.title") };
}

export default async function PanelInicioPage() {
  const session = await requireSession();
  const data = await resumen(session.empresa.id);

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1 style={{ marginBottom: 4 }}>
            <T k="home.hello" vars={{ name: session.usuario.nombre.split(" ")[0] }} />
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            <T k="home.sub" vars={{ company: session.empresa.nombre }} />
          </p>
        </div>
      </div>

      <div className="grid grid-3" data-tour="home-kpi">
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <span className="muted" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              <T k="quotes.title" />
            </span>
            <IconFileText />
          </div>
          <p className="num" style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>
            {data.presupuestosTotal}
          </p>
          <div className="flex justify-between items-center mt-2">
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              Aceptados: <strong className="num text-success">{data.presupuestosAceptado}</strong>
            </span>
            <Link href="/panel/presupuestos" style={{ fontSize: "0.85rem" }}>
              Ver todos →
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <span className="muted" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              <T k="home.works" />
            </span>
            <IconHammer />
          </div>
          <p className="num" style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>
            {data.obras}
          </p>
          <div className="flex justify-between items-center mt-2">
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              <T k="home.activeWorks" />: <strong className="num">{data.obrasEnCurso}</strong>
            </span>
            <Link href="/panel/obras" style={{ fontSize: "0.85rem" }}>
              Ver todas →
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <span className="muted" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              <T k="home.clients" />
            </span>
            <IconUsers />
          </div>
          <p className="num" style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>
            {data.clientes}
          </p>
          <div className="flex justify-between items-center mt-2">
            <Link href="/panel/clientes" style={{ fontSize: "0.85rem" }}>
              Ver todos →
            </Link>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 6 }}>
          Acciones Rápidas
        </h2>
        <p className="muted" style={{ fontSize: "0.95rem" }}>
          Crea presupuestos en 3 pasos con cálculo en vivo, gestiona tus clientes o actualiza precios.
        </p>

        <div className="row" style={{ marginTop: 16, flexWrap: "wrap", gap: 12 }}>
          <Link href="/panel/presupuestos/nuevo" className="btn btn-primary">
            <IconPlus />
            <span>Nuevo Presupuesto</span>
          </Link>
          <Link href="/panel/banco" className="btn btn-outline">
            <IconDatabase />
            <span>Banco de Precios</span>
          </Link>
          <Link href="/panel/clientes" className="btn btn-outline">
            <IconUsers />
            <span><T k="home.addClient" /></span>
          </Link>
          <Link href="/panel/obras" className="btn btn-outline">
            <IconHammer />
            <span><T k="home.addWork" /></span>
          </Link>
        </div>
      </div>
    </div>
  );
}

