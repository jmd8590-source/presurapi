import type { TranslationKey } from "@/lib/i18n/paths";

export const NAV_ITEMS: { href: string; labelKey: TranslationKey }[] = [
  { href: "/panel", labelKey: "panel.nav.dashboard" },
  { href: "/panel/clientes", labelKey: "panel.nav.clientes" },
  { href: "/panel/obras", labelKey: "panel.nav.obras" },
  { href: "/panel/presupuestos", labelKey: "panel.nav.presupuestos" },
  { href: "/panel/banco", labelKey: "panel.nav.banco" },
  { href: "/panel/ajustes", labelKey: "panel.nav.ajustes" },
];
