import { LEAGUE_PRIORITIES } from "../../lib/constants/leagues";
import { db } from "./index";
import { leagues } from "./schema";

async function seed() {
	console.log("Seeding leagues...");

	try {
		for (const { logo, priority, ...league } of LEAGUE_PRIORITIES) {
			await db
				.insert(leagues)
				.values({ ...league, logoUrl: logo })
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
