"use client";

import { useEffect } from "react";

// Registra el service worker (public/sw.js) tras la carga, para no competir
// con el arranque de la página. Sin esto la app no cumple los requisitos de
// instalación como PWA (manifest.ts por sí solo no basta).
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const registrar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sin service worker la app sigue funcionando con normalidad, solo
        // sin instalación/offline — no hace falta molestar al usuario.
      });
    };
    // El evento "load" puede haber ocurrido ya antes de que este efecto se
    // ejecute (hidratación después de la carga completa): si es así, no
    // llegaría nunca un segundo "load" y el service worker no se registraría.
    if (document.readyState === "complete") {
      registrar();
      return;
    }
    window.addEventListener("load", registrar);
    return () => window.removeEventListener("load", registrar);
  }, []);

  return null;
}
