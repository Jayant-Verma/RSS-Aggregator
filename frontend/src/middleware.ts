import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/_next", "/favicon.ico", "/api/public"];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("authToken")?.value;

    const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
    const isLoginPage = pathname === "/login";

    // If user is logged in and tries to visit login page, redirect to home
    if (token && isLoginPage) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // If not logged in and trying to access a protected route
    if (!token && !isPublic) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Otherwise continue
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api/|_next/|favicon.ico).*)"], // Match all paths except Next.js internals
};