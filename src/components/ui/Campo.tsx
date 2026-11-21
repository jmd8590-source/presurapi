// Envuelve un control de formulario en un <label> visible: la asociación
// queda implícita por anidamiento (válida sin id/htmlFor), así los lectores
// de pantalla anuncian la etiqueta aunque el campo solo tuviera un
// placeholder. Reutilizado en ajustes, clientes, obras y el asistente de
// presupuesto.
export default function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-(--color-ink)">{label}</span>
      {children}
    </label>
  );
}
