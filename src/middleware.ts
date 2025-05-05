import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Check if the user is trying to access protected routes without token
  if (!token && request.nextUrl.pathname.startsWith("/movies")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect logged in users away from auth pages
  if (
    token &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    return NextResponse.redirect(new URL("/movies", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/movies/:path*", "/login", "/register"],
};
