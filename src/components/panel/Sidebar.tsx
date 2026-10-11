"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/acciones/auth";
import { useT } from "@/components/PrefsProvider";
import { IconHome, IconUsers, IconHammer, IconSettings, IconLogout } from "@/components/Icons";

export function Sidebar({ empresaNombre, usuarioNombre }: { empresaNombre: string; usuarioNombre: string }) {
  const { t } = useT();
  const pathname = usePathname();

  const links = [
    { href: "/panel", label: t("nav.home"), icon: <IconHome />, exact: true },
    { href: "/panel/clientes", label: t("nav.clients"), icon: <IconUsers /> },
    { href: "/panel/obras", label: t("nav.works"), icon: <IconHammer /> },
    { href: "/panel/ajustes", label: t("nav.settings"), icon: <IconSettings /> },
  ];

  return (
    <aside className="sidebar" aria-label={t("nav.main")}>
      <div>
        <Link href="/panel" className="brand" style={{ padding: "0 8px" }}>
          <span className="brand-mark">P</span>
          <span>Presurapi</span>
        </Link>
        <div style={{ padding: "8px", marginTop: 8 }}>
          <span className="badge badge-info" style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {empresaNombre || "Presurapi"}
          </span>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        <ul className="nav-list">
          {links.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="nav-link"
                  aria-current={active ? "page" : undefined}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
        <div style={{ padding: "0 8px 12px 8px" }}>
          <p className="muted" style={{ margin: 0, fontSize: "0.85rem", color: "var(--nav-muted)" }}>
            {usuarioNombre}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="nav-link"
            style={{ width: "100%", border: 0, cursor: "pointer", textAlign: "left" }}
          >
            <IconLogout />
            <span>{t("nav.logout")}</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
