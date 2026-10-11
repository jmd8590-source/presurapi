// Ampliación de los tipos generados por Wrangler: secretos que no aparecen en wrangler.jsonc.
interface CloudflareEnv {
  /** Secreto: clave de Resend. En local, en .dev.vars; en producción, `wrangler secret put RESEND_API_KEY`. */
  RESEND_API_KEY?: string;
}
