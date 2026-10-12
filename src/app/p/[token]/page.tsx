import { getPresupuestoPublico } from "@/lib/data";
import { PresupuestoPublico } from "@/components/presupuestos/PresupuestoPublico";
import { T } from "@/components/T";

export const dynamic = "force-dynamic";
export const metadata = { title: "Presupuesto · Presurapi", robots: { index: false, follow: false } };

export default async function PaginaPublica({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const p = /^[a-f0-9]{64}$/.test(token) ? await getPresupuestoPublico(token) : null;

  if (!p) {
    return (
      <main className="auth-page">
        <div className="card auth-card rise" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem" }}><T k="pub.notFound.title" /></h1>
          <p className="muted"><T k="pub.notFound.text" /></p>
        </div>
      </main>
    );
  }

  // Datos serializables y sin ningún campo interno.
  const data = {
    codigo: p.codigo,
    titulo: p.titulo,
    estado: p.estado,
    ivaPct: p.ivaPct,
    retencionPct: p.retencionPct,
    descuentoPct: p.descuentoPct,
    condiciones: p.condiciones,
    notasCliente: p.notasCliente,
    validezDias: p.validezDias,
    fechaEmision: new Date(p.fechaEmision).toISOString(),
    caducado: p.caducado,
    cliente: p.cliente,
    obra: p.obra,
    empresa: { nombre: p.empresa.nombre, telefono: p.empresa.telefono, emailContacto: p.empresa.emailContacto },
    opciones: p.opciones,
  };
  return <PresupuestoPublico token={token} p={data} />;
}
