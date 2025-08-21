import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    const fullUrlMatch = url.match(/http:\/\/([^.]+(?:\.[^.]+)*)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    if (hostname.includes(".localhost")) {
      const parts = hostname.split(".localhost")[0];
      return parts;
    }

    return null;
  }

  const rootDomainFormatted =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.split(":")[0] || "localhost";

  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

export const config = {
  matcher: [
    "/",
    "/authentication/:path*",
    "/verify-email/:path*",
    "/reset-password/:path*",
    "/home/:path*",
    "/bytes/:path*",
    "/marketplace/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
    "/star/:path*",
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (subdomain) {
    const appRoutes = [
      "/home",
      "/bytes",
      "/marketplace",
      "/leaderboard",
      "/profile",
      "/authentication",
      "/verify-email",
      "/reset-password",
    ];
    const isAppRoute = appRoutes.some((route) => pathname.startsWith(route));

    if (!pathname.startsWith("/star") && !isAppRoute) {
      return NextResponse.rewrite(
        new URL(`/star/${subdomain}${pathname}`, request.url)
      );
    }
  }

  const publicRoutes = [
    "/",
    "/authentication",
    "/verify-email",
    "/reset-password",
  ];

  const authOnlyRoutes = ["/authentication", "/verify-email"];

  const protectedRoutePatterns = [
    "/home",
    "/bytes",
    "/marketplace",
    "/leaderboard",
    "/profile",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isProtectedRoute =
    protectedRoutePatterns.some((route) => pathname.startsWith(route)) ||
    (pathname.startsWith("/star") && !subdomain);

  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (
    token &&
    authOnlyRoutes.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    )
  ) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (!token && isProtectedRoute && !isPublicRoute && !subdomain) {
    return NextResponse.redirect(new URL("/authentication", request.url));
  }

  return NextResponse.next();
}
