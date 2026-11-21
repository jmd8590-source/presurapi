// Service worker mínimo para que la app sea instalable como PWA, sin
// arriesgar servir datos obsoletos: solo cachea lo que es seguro cachear.
//
// - Peticiones a otros orígenes (Appwrite Cloud) nunca se tocan: siempre van
//   a la red, directas. Cachear respuestas de la API podría enseñar datos
//   de otro momento o de otro usuario.
// - Navegaciones (cargar una página): red primero; si falla por no haber
//   conexión, se sirve la copia en caché de esa misma página si existe, o
//   /offline si no. Así nunca se enseña una versión vieja habiendo red.
// - Estáticos de Next (/_next/static/*, iconos, favicon): caché primero,
//   llevan hash en el nombre de fichero, son inmutables por definición.
const CACHE_NAME = "presurapi-v1";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = ["/", OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function esEstaticoInmutable(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icon") ||
    pathname === "/favicon.ico" ||
    pathname === "/logo.svg" ||
    pathname === "/logo-maskable.svg"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copia = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))),
    );
    return;
  }

  if (esEstaticoInmutable(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copia = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
          return response;
        });
      }),
    );
  }
});
