// Iconos de línea minimalistas para la navegación del panel (Sidebar y
// BottomNav): un único trazo en el color actual, sin librería externa — son
// pocos y simples, no merece la pena una dependencia solo por esto.
export function IconResumen({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1" />
    </svg>
  );
}

export function IconClientes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-3.6 3.35-6.5 7.5-6.5s7.5 2.9 7.5 6.5" />
    </svg>
  );
}

export function IconObras({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 20V10l8-5 8 5v10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export function IconPresupuestos({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 3.5h9l3 3V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20z" />
      <path d="M9 10h6M9 13.5h6M9 17h3.5" />
    </svg>
  );
}

export function IconBanco({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M9 9.8c0-1.3 1.3-2.3 3-2.3s3 .8 3 2c0 2.7-6 1.3-6 4 0 1.2 1.3 2 3 2s3-1 3-2.3" />
    </svg>
  );
}

export function IconAjustes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l1.9-1.3-2-3.4-2.2.7a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.6 7.6 0 0 0-2.6 1.5l-2.2-.7-2 3.4L4.6 10.5a7.7 7.7 0 0 0 0 3l-1.9 1.3 2 3.4 2.2-.7a7.6 7.6 0 0 0 2.6 1.5l.5 2.5h4l.5-2.5a7.6 7.6 0 0 0 2.6-1.5l2.2.7 2-3.4z" />
    </svg>
  );
}

export const NAV_ICONS: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  "/panel": IconResumen,
  "/panel/clientes": IconClientes,
  "/panel/obras": IconObras,
  "/panel/presupuestos": IconPresupuestos,
  "/panel/banco": IconBanco,
  "/panel/ajustes": IconAjustes,
};
