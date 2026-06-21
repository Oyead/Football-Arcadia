import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
	const session = await auth();
	const { pathname } = request.nextUrl;

	if (session && (pathname === "/login" || pathname === "/signup")) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	if (!session && pathname.startsWith("/dashboard")) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/login", "/signup", "/dashboard/:path*"],
};
