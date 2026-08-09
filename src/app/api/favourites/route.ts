import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { userFavourites } from "@/server/db/schema";

const VALID_TYPES = ["team", "league", "player"] as const;
type EntityType = (typeof VALID_TYPES)[number];

function isEntityType(value: unknown): value is EntityType {
	return (
		typeof value === "string" &&
		(VALID_TYPES as readonly string[]).includes(value)
	);
}

function parseEntityId(value: unknown): number | null {
	if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
		return null;
	}
	return value;
}

export async function POST(req: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json(
			{ error: "Invalid request body" },
			{ status: 400 },
		);
	}

	const { entityType, entityId } = (body ?? {}) as {
		entityType?: unknown;
		entityId?: unknown;
	};

	if (!isEntityType(entityType) || parseEntityId(entityId) === null) {
		return NextResponse.json(
			{ error: "Invalid entityType or entityId" },
			{ status: 400 },
		);
	}

	await db
		.insert(userFavourites)
		.values({
			userId: session.user.id,
			entityType,
			entityId: parseEntityId(entityId) as number,
		})
		.onConflictDoNothing();

	return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const url = new URL(req.url);
	const entityType = url.searchParams.get("entityType");
	const entityId = parseEntityId(Number(url.searchParams.get("entityId")));

	if (!isEntityType(entityType) || entityId === null) {
		return NextResponse.json(
			{ error: "Invalid entityType or entityId" },
			{ status: 400 },
		);
	}

	await db
		.delete(userFavourites)
		.where(
			and(
				eq(userFavourites.userId, session.user.id),
				eq(userFavourites.entityType, entityType),
				eq(userFavourites.entityId, entityId),
			),
		);

	return NextResponse.json({ ok: true });
}
