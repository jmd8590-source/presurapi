"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useDemoStore } from "@/lib/demo/store";

export default function PanelDashboard() {
  const { t } = useLocale();
  const { db, listo } = useDemoStore();

  if (!listo) return null;

  const clientesActivos = db.clientes.filter((c) => c.estado === "activo").length;
  const obrasActivas = db.obras.filter((o) => o.estado === "activa").length;
  const presupuestosBorrador = db.presupuestos.filter((p) => p.estado === "borrador").length;

  const tarjetas = [
    { href: "/panel/clientes", label: t("panel.nav.clientes"), valor: clientesActivos },
    { href: "/panel/obras", label: t("panel.nav.obras"), valor: obrasActivas },
    { href: "/panel/presupuestos", label: t("panel.nav.presupuestos"), valor: presupuestosBorrador },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">
        {t("panel.nav.dashboard")}
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {tarjetas.map((tarjeta) => (
          <Link
            key={tarjeta.href}
            href={tarjeta.href}
            className="rounded-sm border border-(--color-border) bg-(--color-surface) p-5 transition-colors hover:border-(--color-brass)"
          >
            <div className="font-mono-nums text-3xl font-semibold text-(--color-ink)">
              {tarjeta.valor}
            </div>
            <div className="mt-1 text-sm text-(--color-ink-muted)">{tarjeta.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/panel/clientes"
          className="rounded-sm bg-(--color-brass) px-5 py-2.5 text-sm font-semibold text-(--color-brass-contrast) hover:bg-(--color-brass-hover)"
        >
          + {t("panel.nav.clientes")}
        </Link>
        <Link
          href="/panel/ajustes"
          className="rounded-sm border border-(--color-border-strong) px-5 py-2.5 text-sm font-medium text-(--color-ink) hover:border-(--color-brass)"
        >
          {t("panel.nav.ajustes")}
        </Link>
      </div>
    </div>
  );
}
