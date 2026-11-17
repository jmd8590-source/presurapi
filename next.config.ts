import type { NextConfig } from "next";

// CSP sin nonce (no forzamos renderizado dinámico en toda la app para
// conservar el shell estático de Cache Components): bloquea orígenes de
// script/estilo/conexión no propios, que es el núcleo de la protección
// frente a inyección. `'unsafe-inline'` en script-src cubre el único script
// inline (corrección del tema antes del pintado, ver src/app/layout.tsx);
// en style-src cubre los estilos de Tailwind. connect-src se ampliará con
// la URL del proyecto Supabase cuando exista (Fase 2 pendiente de conectar).
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  // 'unsafe-eval' solo en desarrollo: React lo usa para reconstruir la pila
  // de errores del servidor en el navegador; nunca se usa en producción.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Sin mapas de fuente públicos en producción.
  productionBrowserSourceMaps: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
