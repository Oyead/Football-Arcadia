import { NextResponse } from "next/server";
import { fetchFootballData } from "@/server/services/football-api";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	try {
		console.log("Cron Job Started: Syncing Matches...");

		const today = new Date().toISOString().split("T")[0];
		const matches = await fetchFootballData(
			`/competitions/2021/matches`,
			{ dateFrom: today, dateTo: today },
			3600,
		);

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
