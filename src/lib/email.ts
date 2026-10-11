import { getEnv } from "@/db";

type Mail = { to: string; subject: string; text: string };

/** Envío por Resend (HTTP, válido en Workers). Nunca lanza: devuelve si ha salido. */
export async function sendEmail({ to, subject, text }: Mail): Promise<boolean> {
  const env = getEnv();
  const key = env.RESEND_API_KEY;
  if (!key) {
    // Solo en desarrollo: se muestra en consola el contenido (p. ej. el enlace de recuperación).
    if (process.env.NODE_ENV !== "production") {
      console.log(`[correo de desarrollo] Para: ${to}\nAsunto: ${subject}\n${text}`);
      return true;
    }
    console.error("Falta RESEND_API_KEY: no se ha enviado el correo.");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject, text }),
    });
    if (!res.ok) console.error(`Resend respondió ${res.status}`);
    return res.ok;
  } catch (e) {
    console.error("Resend no respondió:", (e as Error).message);
    return false;
  }
}
