# Presurapi

Presupuestos de obra en minutos para albañiles y pequeñas empresas de reforma en España.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Appwrite (base de datos y autenticación reales, región Frankfurt) — diseño en [`appwrite/DISENO.md`](./appwrite/DISENO.md), cliente en `src/lib/appwrite/`
- Resend (envío de presupuestos por email) — pendiente de clave y dominio propio
- Despliegue en Vercel, con despliegue automático en cada push a `main`

## Backend: Appwrite

La app usa Appwrite de verdad, sin modo demostración:

- **Autenticación real** (`src/app/acciones/auth.ts`): registro, login, cierre de sesión, recuperación de contraseña por email y borrado de cuenta (GDPR). La sesión se guarda en una cookie `httpOnly` propia (`presurapi_session`); ver `src/lib/appwrite/server.ts`.
- **Datos** (`src/lib/appwrite/store.tsx`): clientes, obras, presupuestos, capítulos y partidas se leen y escriben contra TablesDB de Appwrite desde el navegador (con permisos por documento, cada usuario solo ve los suyos), con actualizaciones optimistas y reversión si falla el guardado.
- **Banco de precios y catálogo de trabajos** (`src/lib/demo/catalog.ts`): siguen siendo datos estáticos empaquetados con la app, no una tabla de Appwrite — son de solo lectura para todo el mundo, así que no hay ninguna ventaja en moverlos a la base de datos (ver "Simplificaciones" más abajo).

Variables de entorno necesarias: copia `.env.example` a `.env.local` y rellena los valores de tu proyecto de Appwrite (`NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` con los scopes indicados en el propio fichero).

### Simplificaciones frente al diseño original

- Sin bucket de Storage: el logo de la empresa se guarda como `data:` URL en una columna `longtext` de `perfiles`, igual que en la demo. Evita montar subida de ficheros para una imagen pequeña.
- Sin colecciones `materiales`/`trabajos`/`trabajo_materiales`/`trabajo_mano_obra`: ese catálogo no lo edita ningún usuario, así que vive en código (`catalog.ts`) en vez de en la base de datos.
- `materiales` y `mano_obra` de cada partida se guardan como JSON embebido en la propia fila de `partidas` (columnas `materiales_json`/`mano_obra_json`) en vez de en tablas aparte: son 2-3 líneas por partida, nunca se consultan sueltas, y así se evitan N llamadas adicionales por presupuesto.
- Sin enlace público de presupuesto (`/p/[token]`): no llegó a construirse en la demo tampoco, así que no es una regresión.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El servidor de desarrollo necesita que el proceso de Node pueda llegar a `cloud.appwrite.io`; si tu entorno usa un proxy de salida, exporta `NODE_USE_ENV_PROXY=1` antes de `npm run dev` para que el SDK de Appwrite lo respete.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint

Los scripts de test (Vitest/Playwright) aún no existen; el CI (`.github/workflows/ci.yml`) corre lint, tipos y build en cada push/PR, más escaneo de secretos.

## Próximos pasos

1. Accesibilidad: los formularios de clientes/obras usan solo `placeholder` en varios campos, sin `<label>` visible asociado — conviene añadirlos en una pasada dedicada.
2. Envío del PDF por email (Resend) cuando haya dominio propio verificado.
3. Ofuscación/minificación reforzada del bundle de producción antes de un lanzamiento público.
