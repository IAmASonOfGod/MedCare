import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Allow unauthenticated access to password and signup flows under /admin
  if (
    pathname.startsWith("/admin/forgot-password") ||
    pathname.startsWith("/admin/reset-password") ||
    pathname.startsWith("/admin/signup")
  ) {
    return NextResponse.next();
  }
  const token = req.cookies.get("admin_token")?.value;
  if (!token) {
    const loginUrl = new URL("/admin-login", req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};


