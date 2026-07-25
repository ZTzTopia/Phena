import { AUTH_COOKIE_NAME } from "@phena/schema";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_EXACT = new Set(["/", "/admin", "/contest/battle-map", "/contest/rankings"]);

function withNoStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_EXACT.has(pathname)) {
    return withNoStore(NextResponse.next());
  }

  const inProtectedArea = pathname.startsWith("/admin/") || pathname.startsWith("/contest");
  if (inProtectedArea && !req.cookies.has(AUTH_COOKIE_NAME)) {
    const loginPath = pathname.startsWith("/admin") ? "/admin" : "/";
    return NextResponse.redirect(new URL(loginPath, req.url));
  }

  return withNoStore(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)).*)",
  ],
};
