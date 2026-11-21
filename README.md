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

## Logo e identidad

Monogramo "P" geométrico sobre una ficha redondeada en el latón de marca
(`#a9752e`), diseñado a mano en SVG (`public/logo.svg`), sin ningún
generador de imágenes — legible desde 16 px (pestaña del navegador) hasta
512 px (icono de instalación). `public/logo-maskable.svg` es la misma marca
a sangre completa, para los sistemas que recortan el icono en círculo o
"squircle". Todos los PNG de favicon/app-icon/manifest se generan desde
esos dos SVG (ver más abajo); si se cambia el diseño, basta con editar los
SVG y regenerar.

## PWA (instalable, con soporte offline básico)

- `src/app/manifest.ts` — manifest.webmanifest con nombre, colores e iconos.
- `src/app/icon.png` / `apple-icon.png` / `favicon.ico` — generados desde `public/logo.svg` (favicon multi-resolución 16/32/48 vía ImageMagick).
- `public/icon-192.png`, `icon-512.png`, `icon-maskable-{192,512}.png` — iconos del manifest.
- `public/sw.js` + `src/components/ui/ServiceWorkerRegister.tsx` — service worker mínimo: nunca intercepta llamadas a Appwrite (otro origen), solo cachea estáticos inmutables de Next y, para la navegación, red primero con `/offline` (`src/app/offline/page.tsx`) como último recurso sin conexión.

Para regenerar los PNG tras cambiar el logo:

```bash
node -e "
const sharp = require('sharp');
(async () => {
  await Promise.all([16,32,48].map(s => sharp('public/logo.svg').resize(s,s).png().toFile('/tmp/fav-'+s+'.png')));
  await sharp('public/logo.svg').resize(512,512).png().toFile('src/app/icon.png');
  await sharp('public/logo.svg').resize(180,180).png().toFile('src/app/apple-icon.png');
  await sharp('public/logo.svg').resize(192,192).png().toFile('public/icon-192.png');
  await sharp('public/logo.svg').resize(512,512).png().toFile('public/icon-512.png');
  await sharp('public/logo-maskable.svg').resize(192,192).png().toFile('public/icon-maskable-192.png');
  await sharp('public/logo-maskable.svg').resize(512,512).png().toFile('public/icon-maskable-512.png');
})();
"
convert /tmp/fav-16.png /tmp/fav-32.png /tmp/fav-48.png src/app/favicon.ico
```

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

1. Envío del PDF por email (Resend) cuando haya dominio propio verificado.
2. Enlace público de presupuesto (`/p/[token]`), resuelto en servidor con la API key, sin dar permiso de lectura público sobre todo el documento.
3. Títulos por página dentro de `/panel/*`: hoy todas comparten "Panel · Presurapi" porque son componentes cliente y no pueden exportar `metadata` por separado; requeriría dividir cada página en un envoltorio de servidor + contenido cliente, como se hizo con `cookies/page.tsx`.
