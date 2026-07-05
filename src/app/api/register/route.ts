import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

export async function POST(req: Request) {
	try {
		const { name, email, password } = await req.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 },
			);
		}

		const existing = await db.query.users.findFirst({
			where: eq(users.email, email),
		});

		if (existing) {
			return NextResponse.json(
				{ error: "A user with this email already exists" },
				{ status: 409 },
			);
		}

		const hashedPassword = await hash(password, 12);
		const id = crypto.randomUUID();

		await db.insert(users).values({
			id,
			name: name || email.split("@")[0],
			email,
			password: hashedPassword,
		});

		return NextResponse.json({ id, name, email }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 },
		);
	}
}
