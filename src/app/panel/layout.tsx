import { redirect } from "next/navigation";
import { getDemoSessionEmail } from "@/lib/demo/session";
import { DemoDataProvider } from "@/lib/demo/store";
import Topbar from "@/components/panel/Topbar";
import Sidebar from "@/components/panel/Sidebar";
import BottomNav from "@/components/panel/BottomNav";
import DemoBanner from "@/components/panel/DemoBanner";

// Zona autenticada y totalmente dinámica (depende de la cookie de sesión de
// demo en cada petición): no tiene sentido como shell estático, así que se
// excluye de la validación de "instant navigation" de Cache Components.
export const instant = false;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const email = await getDemoSessionEmail();
  if (!email) {
    redirect("/entrar");
  }

  return (
    <DemoDataProvider email={email}>
      <div className="flex min-h-dvh flex-1 flex-col">
        <DemoBanner />
        <Topbar />
        <div className="flex flex-1">
          <Sidebar />
          <main id="main-content" className="flex-1 overflow-x-hidden px-4 py-6 pb-24 sm:px-6 md:pb-6">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </DemoDataProvider>
  );
}
