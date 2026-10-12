import { getPresupuestoPublico } from "@/lib/data";
import { pdfDe, pdfResponse } from "@/lib/presupuesto-doc";
import { allow } from "@/lib/ratelimit";
import { clientIp } from "@/lib/session";

/** PDF para el cliente final: el token del enlace es el secreto. Sin costes ni margen. */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!/^[a-f0-9]{64}$/.test(token)) return new Response("No encontrado", { status: 404 });
  if (!(await allow("pdf_publico", await clientIp(), 60, 10 * 60_000))) {
    return new Response("Demasiadas peticiones", { status: 429 });
  }
  const p = await getPresupuestoPublico(token);
  if (!p) return new Response("No encontrado", { status: 404 });
  const bytes = await pdfDe(p.empresa, p);
  return pdfResponse(bytes, `${p.codigo}.pdf`);
}
