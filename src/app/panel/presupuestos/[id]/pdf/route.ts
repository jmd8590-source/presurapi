import { getSession } from "@/lib/session";
import { getEmpresa, getPresupuestoCompleto } from "@/lib/data";
import { pdfDe, pdfResponse } from "@/lib/presupuesto-doc";

/** PDF para el albañil (con sesión). El aislamiento por empresa lo aplica la capa de datos. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const ses = await getSession();
  if (!ses) return new Response("No autorizado", { status: 401 });
  const { id } = await ctx.params;
  const [p, empresa] = await Promise.all([getPresupuestoCompleto(ses.empresa.id, id), getEmpresa(ses.empresa.id)]);
  if (!p || !empresa) return new Response("No encontrado", { status: 404 });
  const bytes = await pdfDe(empresa, p);
  return pdfResponse(bytes, `${p.codigo}.pdf`);
}
