import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "thl_admin";

/* Optimistic check only: a missing cookie means a redirect. Real authorisation
   happens in requireAdmin(), which validates the session and loads the user. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !request.cookies.has(COOKIE)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
