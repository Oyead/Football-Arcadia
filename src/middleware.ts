import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Your Auth.js instance

export async function middleware(request: NextRequest) {
	const session = await auth();
	const { pathname } = request.nextUrl;

	// 1. If logged in and trying to access login/register, redirect to dashboard
	if (
		session &&
		(pathname === "/login" || pathname === "/signup" || pathname === "/")
	) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// 2. If NOT logged in and trying to access the dashboard, redirect to login
	if (!session && pathname.startsWith("/dashboard")) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

// Limit the middleware to run ONLY on these specific paths for performance
export const config = {
	matcher: ["/", "/login", "/signup", "/dashboard/:path*"],
};
