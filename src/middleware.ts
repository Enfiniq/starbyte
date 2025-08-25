import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { rootDomain } from "@/lib/utils";

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

  const rootDomainFormatted = rootDomain.split(":")[0];
  if (
    hostname.endsWith(`.${rootDomainFormatted}`) &&
    hostname !== rootDomainFormatted
  ) {
    const subdomain = hostname.replace(`.${rootDomainFormatted}`, "");
    if (subdomain && subdomain !== "www" && subdomain !== "api") {
      return subdomain;
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

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

  const protectedRoutes = [
    "/home",
    "/bytes",
    "/marketplace",
    "/leaderboard",
    "/profile",
  ];

  const unauthenticatedOnlyRoutes = ["/", "/authentication", "/verify-email"];

  const isProtectedRoute =
    protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    ) ||
    (pathname.startsWith("/star") && !subdomain);

  const isUnauthenticatedOnlyRoute = unauthenticatedOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (token) {
    if (isUnauthenticatedOnlyRoute) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  } else {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
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
    "/admin/:path*",
  ],
};
