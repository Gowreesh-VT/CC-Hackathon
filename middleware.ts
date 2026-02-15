import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAuth = !!token;
    const isLoginPage = req.nextUrl.pathname.startsWith("/login");
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
    const isJudgePage = req.nextUrl.pathname.startsWith("/judge");
    const isTeamPage = req.nextUrl.pathname.startsWith("/team");

    // Redirect authenticated users away from login page
    if (isLoginPage) {
        if (isAuth) {
            if (token?.role === "admin") {
                return NextResponse.redirect(new URL("/admin/judges", req.url));
            } else if (token?.role === "judge") {
                return NextResponse.redirect(new URL("/judge", req.url));
            } else if (token?.role === "team") {
                return NextResponse.redirect(new URL("/team/dashboard", req.url));
            }
        }
        return NextResponse.next();
    }

    // Protect Admin routes
    if (isAdminPage) {
        if (!isAuth) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        if (token?.role !== "admin") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // Protect Judge routes
    if (isJudgePage) {
        if (!isAuth) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        if (token?.role !== "judge") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // Protect Team routes
    if (isTeamPage) {
        if (!isAuth) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        if (token?.role !== "team") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/judge/:path*", "/team/:path*", "/login"],
};
