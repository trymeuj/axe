import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Allow extension origins for API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin") ?? "";
    const isExtension = origin.startsWith("chrome-extension://");
    const isLocalhost = origin.includes("localhost");

    const res = NextResponse.next();

    if (isExtension || isLocalhost) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Credentials", "true");
      res.headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,DELETE,OPTIONS"
      );
      res.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    }

    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: res.headers });
    }

    return res;
  }

  return NextResponse.next();
}

export const config = {
  // The disabled legacy auth route does not need CORS handling.
  matcher: ["/api/((?!auth).*)"],
};
