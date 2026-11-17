import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { defaultLocale } from "@/lib/i18n";
import SkipLink from "@/components/ui/SkipLink";
import CookieBanner from "@/components/ui/CookieBanner";

// Next.js 16 "Cache Components" prerenders this layout into the static shell, so it
// never reads cookies()/headers() here (that would force the whole app dynamic).
// The theme is instead corrected client-side, before first paint, by the inline
// script below — see node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
const THEME_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )presurapi_theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;if(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches){t="dark"}if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Presurapi",
  description: "Presupuestos de obra en minutos para albañiles y reformas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={defaultLocale}
      suppressHydrationWarning
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-(--color-paper) text-(--color-ink)">
        <LocaleProvider>
          <ThemeProvider>
            <SkipLink />
            <div
              className="flex min-h-dvh flex-1 flex-col"
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
                paddingLeft: "env(safe-area-inset-left)",
                paddingRight: "env(safe-area-inset-right)",
              }}
            >
              {children}
            </div>
            <CookieBanner />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
