import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, type JWTPayload } from "@phena/schema";
import { NextResponse } from "next/server";

const PUBLIC_PATH_REGEX = /^\/(?:admin|contest\/battle-map|contest\/rankings)?$/;
const PARTICIPANT_PATH_REGEX = /^\/contest/;
const ADMIN_PATH_REGEX = /^\/admin\//;

const getToken = (request: NextRequest) => {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookie) {
    return cookie;
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return null;
  }

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) {
    return null;
  }

  return token;
};

const decodeAuthToken = (token: string) => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const payloadBase64 = parts[1];
  if (!payloadBase64) {
    return null;
  }

  try {
    const payload = atob(payloadBase64);
    return JSON.parse(payload) satisfies JWTPayload;
  } catch {
    return null;
  }
};

const redirectToLogin = (isPublic: boolean, request: NextRequest) => {
  if (isPublic) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
};

const redirectToAdmin = (isPublic: boolean, request: NextRequest) => {
  if (isPublic) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/admin", request.url));
};

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPublic = PUBLIC_PATH_REGEX.test(pathname);
  const isParticipant = PARTICIPANT_PATH_REGEX.test(pathname);
  const isAdmin = ADMIN_PATH_REGEX.test(pathname);

  const token = getToken(request);
  if (!token) {
    return isAdmin ? redirectToAdmin(isPublic, request) : redirectToLogin(isPublic, request);
  }

  const decoded = decodeAuthToken(token);
  if (!decoded) {
    return isAdmin ? redirectToAdmin(isPublic, request) : redirectToLogin(isPublic, request);
  }

  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp && decoded.exp < now) {
    const response = isPublic
      ? NextResponse.next()
      : NextResponse.redirect(new URL(decoded.role === "admin" ? "/admin" : "/", request.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  const role = decoded.role;
  if (!role) {
    return isAdmin ? redirectToAdmin(isPublic, request) : redirectToLogin(isPublic, request);
  }

  if (isPublic) {
    return NextResponse.next();
  }

  if (isAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isParticipant && role !== "team") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/contest", "/contest/:path*"],
};
