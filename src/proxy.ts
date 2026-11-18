import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/appwrite/config";

// Primera barrera para /panel: solo mira si existe la cookie de sesión (no
// hace ninguna llamada a Appwrite, el middleware corre en el edge en cada
// petición). La comprobación de verdad —si la sesión sigue siendo válida en
// Appwrite— la hace panel/layout.tsx con getLoggedInUser().
export function proxy(request: NextRequest) {
  const tieneCookieSesion = request.cookies.has(SESSION_COOKIE);

  if (!tieneCookieSesion && request.nextUrl.pathname.startsWith("/panel")) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
