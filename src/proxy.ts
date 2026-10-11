import { NextResponse, type NextRequest } from "next/server";

// Rutas protegidas que requieren sesión activa
const PROTECTED_PREFIXES = ["/panel", "/bienvenida"];
// Rutas de autenticación (si ya tiene sesión, no hace falta que las vea)
const AUTH_ROUTES = ["/entrar", "/registro", "/recuperar", "/restablecer"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Comprobar presencia de cookie de sesión (__Host-pr_session en prod HTTPS o pr_session en dev)
  const sessionToken =
    request.cookies.get("__Host-pr_session")?.value ||
    request.cookies.get("pr_session")?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/entrar", request.url);
    loginUrl.searchParams.set("redir", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto archivos estáticos, imágenes y favicon
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
