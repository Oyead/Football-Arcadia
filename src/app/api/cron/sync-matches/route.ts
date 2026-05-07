import { NextResponse } from "next/server";
import { fetchFootballData } from "@/server/services/football-api";

export async function GET(request: Request) {
	// 1. Protect the route with CRON_SECRET
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	try {
		console.log("Cron Job Started: Syncing Matches...");

		// 2. Fetch fresh data (e.g., Premier League matches for today)
		// We set TTL to 0 or a very low number here to force the API call
		// and update the Redis cache for everyone else.
		const today = new Date().toISOString().split("T")[0];
		const matches = await fetchFootballData(
			"/fixtures",
			{
				league: "39",
				season: "2023",
				date: today,
			},
			3600,
		); // Cache for 1 hour

		if (!matches) {
			throw new Error("Failed to fetch matches from Football API");
		}

		return NextResponse.json({
			success: true,
			message: `Synced matches for ${today}`,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Cron Sync Error:", error);
		return NextResponse.json(
			{ success: false, error: "Sync failed" },
			{ status: 500 },
		);
	}
}
