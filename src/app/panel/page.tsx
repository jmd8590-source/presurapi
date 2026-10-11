import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { resumen } from "@/lib/data";
import { T } from "@/components/T";
import { getT } from "@/lib/i18n/server";
import { IconUsers, IconHammer, IconPlus } from "@/components/Icons";

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

      <div className="grid grid-2" data-tour="home-kpi">
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
          <Link href="/panel/clientes" style={{ fontSize: "0.85rem", marginTop: 8, display: "inline-block" }}>
            Ver todos los clientes →
          </Link>
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
          <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
            <T k="home.activeWorks" />: <strong className="num">{data.obrasEnCurso}</strong>
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 6 }}>
          <T k="home.start" />
        </h2>
        <p className="muted" style={{ fontSize: "0.95rem" }}>
          <T k="home.startText" />
        </p>

        <div className="row" style={{ marginTop: 16 }}>
          <Link href="/panel/clientes" className="btn btn-primary">
            <IconPlus />
            <span><T k="home.addClient" /></span>
          </Link>
          <Link href="/panel/obras" className="btn btn-secondary">
            <IconPlus />
            <span><T k="home.addWork" /></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
