import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { SESSION_COOKIE } from "@/lib/appwrite/config";
import { AppwriteDataProvider } from "@/lib/appwrite/store";
import Topbar from "@/components/panel/Topbar";
import Sidebar from "@/components/panel/Sidebar";
import BottomNav from "@/components/panel/BottomNav";
import ErrorBanner from "@/components/panel/ErrorBanner";

// Zona autenticada y totalmente dinámica (depende de la cookie de sesión en
// cada petición): no tiene sentido como shell estático, así que se excluye
// de la validación de "instant navigation" de Cache Components.
export const instant = false;

// Título por defecto para toda /panel/*: las páginas del panel son
// componentes cliente y no pueden exportar su propio `metadata`, así que
// como mínimo se distinguen del resto del sitio con "Panel · Presurapi" en
// vez del título genérico de la portada.
export const metadata: Metadata = { title: "Panel" };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getLoggedInUser();
  if (!usuario) {
    redirect("/entrar");
  }

  // getLoggedInUser ya comprobó que la cookie es una sesión válida en
  // Appwrite; se vuelve a leer aquí solo para pasar el secreto al cliente
  // del navegador (ver AppwriteDataProvider).
  const sessionSecret = (await cookies()).get(SESSION_COOKIE)!.value;

  return (
    <AppwriteDataProvider userId={usuario.$id} sessionSecret={sessionSecret} email={usuario.email}>
      <div className="flex min-h-dvh flex-1 flex-col">
        <ErrorBanner />
        <Topbar />
        <div className="flex flex-1">
          <Sidebar />
          <main id="main-content" className="flex-1 overflow-x-hidden px-4 py-6 pb-24 sm:px-6 md:pb-6">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </AppwriteDataProvider>
  );
}
