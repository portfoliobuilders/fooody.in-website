import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractSubdomain, RESERVED_SLUGS } from "@/lib/tenant/host";
import { SESSION_COOKIE } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request.headers.get("host"));

  if (subdomain && !pathname.startsWith(`/${subdomain}`) && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  const isDashboard = pathname.startsWith("/dashboard");
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (isDashboard && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  const first = pathname.split("/").filter(Boolean)[0];
  if (first && RESERVED_SLUGS.has(first)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
