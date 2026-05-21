import { TOP_LEAGUES } from "../../lib/constants/leagues";
import { db } from "./index";
import { leagues } from "./schema";

async function seed() {
	console.log("Seeding leagues...");

	try {
		for (const league of TOP_LEAGUES) {
			await db
				.insert(leagues)
				.values(league)
				.onConflictDoUpdate({
					target: leagues.id,
					set: { name: league.name, country: league.country },
				});
		}
		console.log("Seeding complete!");
	} catch (error) {
		console.error("Seeding failed:", error);
		process.exit(1);
	}
}

seed();
