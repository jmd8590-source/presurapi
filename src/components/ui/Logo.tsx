// Marca de Presurapi (ver public/logo.svg) junto al nombre de la app. Es
// decorativo —el texto de al lado ya dice "Presurapi"— así que lleva
// aria-hidden en vez de un alt redundante para los lectores de pantalla.
export default function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.svg" alt="" aria-hidden="true" className={`shrink-0 rounded-sm ${className}`} />
  );
}
