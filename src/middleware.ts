import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get("token")?.value;

  // Extract path and check if it's a protected path
  const path = request.nextUrl.pathname;
  const isLoginPage = path === "/login";
  const isRegisterPage = path === "/register";
  const isAuthPage = isLoginPage || isRegisterPage;
  const isProtectedPage = path.startsWith("/movies");

  // Debug with minimal logging
  console.log(`Middleware: Path=${path}, Token=${!!token}`);

  // Redirect unauthenticated users away from protected pages
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/movies", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/movies/:path*", "/login", "/register"],
};
