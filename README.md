# Presurapi

Presupuestos de obra en minutos para albañiles y pequeñas empresas de reforma en España.

**Demo pública:** https://presurapi.vercel.app (modo demostración: acceso simulado, datos guardados solo en el navegador — ver más abajo).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Appwrite (base de datos, autenticación, almacenamiento) — diseño listo en [`appwrite/DISENO.md`](./appwrite/DISENO.md), conexión real pendiente
- Resend (envío de presupuestos por email) — pendiente de clave y dominio propio
- Despliegue en Vercel, con despliegue automático en cada push a `main`

## Estado actual: modo demostración

Mientras no hay backend conectado, la app funciona entera sin servidor:

- El login/registro (`src/app/acciones/demo-auth.ts`) no verifica contraseñas ni email reales, solo crea una cookie de sesión.
- Los datos (clientes, obras, presupuestos) se guardan en `localStorage` del navegador (`src/lib/demo/store.tsx`), con la misma forma que tendrán las colecciones de Appwrite.
- El banco de precios y el catálogo de trabajos (`src/lib/demo/catalog.ts`) son los mismos datos que se sembrarán en Appwrite.

Esto es intencional y está marcado en la propia interfaz ("modo demostración") y en la política de privacidad.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint

Los scripts de test (Vitest/Playwright) aún no existen; el CI (`.github/workflows/ci.yml`) corre lint, tipos y build en cada push/PR, más escaneo de secretos.

## Próximos pasos

1. Conectar Appwrite (requiere autenticación OAuth del usuario — ver `.mcp.json`) y crear las colecciones de `appwrite/DISENO.md`.
2. Sustituir la capa de datos de demostración por el cliente real de Appwrite.
3. Autenticación real (Appwrite Authentication) en vez del acceso simulado.
4. Envío del PDF por email (Resend) cuando haya dominio propio verificado.
