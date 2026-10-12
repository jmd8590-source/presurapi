import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { Sidebar } from "@/components/panel/Sidebar";
import { Topbar } from "@/components/panel/Topbar";
import { BottomNav } from "@/components/panel/BottomNav";
import { T } from "@/components/T";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  if (!session.empresa.onboardingHecho) {
    redirect("/bienvenida");
  }

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        <T k="common.skipToContent" />
      </a>

      <Sidebar
        empresaNombre={session.empresa.nombre}
        usuarioNombre={session.usuario.nombre}
      />

      <div className="app-shell">
        <Topbar usuario={session.usuario} empresa={session.empresa} />
        <main id="main-content" className="main">
          <div className="content">{children}</div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
