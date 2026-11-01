import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Ensure public catalog routes (/books) are never intercepted
  if (pathname === "/books" || pathname === "/books/") {
    return NextResponse.next();
  }

  // Check BetterAuth session cookie
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    const callbackUrl = `${pathname}${search}`;
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/add-book/:path*",
    "/my-books/:path*",
    "/my-borrows/:path*",
    "/books/:id+",
    "/profile/:path*",
  ],
};

