# Presurapi

Presupuestos de obra en minutos para albañiles y pequeñas empresas de reforma en España.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Postgres, Auth, Storage, RLS) — se añade en la Fase 2
- Resend (envío de presupuestos por email) — se añade en la Fase 5
- Despliegue en Vercel

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

Los scripts de test (Vitest/Playwright) y el pipeline de CI se añaden en la Fase 6.

## Estado del proyecto

Construido por fases: diseño → base de datos → autenticación → presupuestos → PDF/email → despliegue y cumplimiento. El detalle de qué está hecho y qué falta se comunica fase a fase.
