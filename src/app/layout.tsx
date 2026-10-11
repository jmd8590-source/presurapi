import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { PrefsProvider } from "@/components/PrefsProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { getLang } from "@/lib/i18n/server";

// Las fuentes se descargan en la compilación y se sirven desde el propio dominio
// (sin peticiones a Google desde el navegador del usuario, por RGPD).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Presurapi · Presupuestos y Seguimiento de Obras", template: "%s · Presurapi" },
  description:
    "Presupuestos y seguimiento de obras para albañiles y pequeñas empresas de reformas. Quotes and job tracking for builders.",
  applicationName: "Presurapi",
  robots: { index: true, follow: true },
};

// viewport-fit=cover permite usar las áreas seguras (notch, barra inferior).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6EE" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1713" },
  ],
};

// Aplica tema y accesibilidad antes de pintar para evitar parpadeos.
const initScript = `(function(){try{var d=document.documentElement;var raw=localStorage.getItem('pr_prefs')||sessionStorage.getItem('pr_prefs');var p=raw?JSON.parse(raw):{};var t=p.theme||(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');d.setAttribute('data-theme',t);if(p.scale)d.style.setProperty('--text-scale',p.scale);if(p.contrast)d.setAttribute('data-contrast','high');if(p.motion)d.setAttribute('data-motion','reduce');}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body>
        <PrefsProvider initialLang={lang}>
          {children}
          <CookieBanner />
        </PrefsProvider>
      </body>
    </html>
  );
}
