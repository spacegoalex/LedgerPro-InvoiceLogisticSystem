import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "ledgerpro_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) return null;
  return new TextEncoder().encode(secret);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes: login and auth API
  if (pathname === "/" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Protect /app/*: require valid session cookie
  if (pathname.startsWith("/app")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const login = new URL("/", request.url);
      return NextResponse.redirect(login);
    }
    const secret = getSecret();
    if (!secret) {
      return NextResponse.next();
    }
    try {
      jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      const login = new URL("/", request.url);
      const res = NextResponse.redirect(login);
      res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/"],
};
