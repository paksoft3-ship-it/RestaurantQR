import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "yp_admin_session";

/**
 * Lightweight edge guard:
 *  - redirects unauthenticated admin requests to the login page
 *  - marks admin routes as noindex
 * Full cryptographic session verification happens in the admin layout.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";

  if (isAdmin && !isLogin) {
    const hasSession = request.cookies.has(COOKIE_NAME);
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("reason", "auth");
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  if (isAdmin) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
