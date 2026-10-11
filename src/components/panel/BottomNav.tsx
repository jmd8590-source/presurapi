"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/PrefsProvider";
import { IconHome, IconUsers, IconHammer, IconSettings } from "@/components/Icons";

export function BottomNav() {
  const { t } = useT();
  const pathname = usePathname();

  const links = [
    { href: "/panel", label: t("nav.home"), icon: <IconHome />, exact: true },
    { href: "/panel/clientes", label: t("nav.clients"), icon: <IconUsers /> },
    { href: "/panel/obras", label: t("nav.works"), icon: <IconHammer /> },
    { href: "/panel/ajustes", label: t("nav.settings"), icon: <IconSettings /> },
  ];

  return (
    <nav className="bottom-nav" aria-label={t("nav.main")}>
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
