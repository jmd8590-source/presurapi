import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_SESSION_COOKIE } from "@/lib/demo/session";

// Protege /panel mientras no hay Appwrite Authentication: exige la cookie de
// sesión de demostración (ver src/lib/demo/session.ts). Cuando se conecte
// Appwrite, esto se sustituye por la comprobación de sesión real.
export function proxy(request: NextRequest) {
  const tieneSesionDemo = request.cookies.has(DEMO_SESSION_COOKIE);

  if (!tieneSesionDemo && request.nextUrl.pathname.startsWith("/panel")) {
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
