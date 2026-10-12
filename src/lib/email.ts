import { getEnv } from "@/db";

type Mail = {
  to: string;
  subject: string;
  text: string;
  /** Las respuestas del cliente van al albañil. */
  replyTo?: string;
  /** Nombre visible del remitente (p. ej. la empresa del albañil). */
  fromName?: string;
  attachments?: Array<{ filename: string; content: Uint8Array }>;
};

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

/** Quita comillas y saltos para que el nombre no rompa la cabecera From. */
function safeName(s: string): string {
  return s.replace(/[\r\n"<>]/g, "").trim().slice(0, 80);
}

/** Envío por Resend (HTTP, válido en Workers). Nunca lanza: devuelve si ha salido. */
export async function sendEmail({ to, subject, text, replyTo, fromName, attachments }: Mail): Promise<boolean> {
  const env = getEnv();
  const key = env.RESEND_API_KEY;
  if (!key) {
    // Solo en desarrollo: se muestra en consola el contenido (p. ej. el enlace de recuperación).
    if (process.env.NODE_ENV !== "production") {
      const adj = attachments?.length ? `\nAdjuntos: ${attachments.map((a) => `${a.filename} (${a.content.length} bytes)`).join(", ")}` : "";
      console.log(`[correo de desarrollo] Para: ${to}\nAsunto: ${subject}${replyTo ? `\nReply-To: ${replyTo}` : ""}${adj}\n${text}`);
      return true;
    }
    console.error("Falta RESEND_API_KEY: no se ha enviado el correo.");
    return false;
  }
  try {
    const base = env.EMAIL_FROM ?? "";
    const name = fromName ? safeName(fromName) : "";
    // Si EMAIL_FROM ya trae "Nombre <correo>", se respeta; si es solo el correo, se le pone el nombre de la empresa.
    const from = name && !base.includes("<") ? `${name} <${base}>` : base;
    const body: Record<string, unknown> = { from, to: [to], subject, text };
    if (replyTo) body.reply_to = replyTo;
    if (attachments?.length) {
      body.attachments = attachments.map((a) => ({ filename: a.filename, content: toBase64(a.content) }));
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error(`Resend respondió ${res.status}`);
    return res.ok;
  } catch (e) {
    console.error("Resend no respondió:", (e as Error).message);
    return false;
  }
}
