import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { leagues, matches, players, teams } from "@/server/db/schema";

/**
 * Repository layer for handling application-safe database lookups
 */
export const FootballRepository = {
	/**
	 * Fetch a single league by its unique API ID
	 */
	async getLeague(id: number) {
		try {
			const result = await db
				.select()
				.from(leagues)
				.where(eq(leagues.id, id))
				.limit(1);

			return result[0] || null;
		} catch (error) {
			console.error(`Error in getLeague(${id}):`, error);
			throw new Error("Could not retrieve league records");
		}
	},

	/**
	 * Fetch a single match, automatically handling relational structures
	 */
	async getMatch(id: number) {
		try {
			const result = await db
				.select()
				.from(matches)
				.where(eq(matches.id, id))
				.limit(1);

			return result[0] || null;
		} catch (error) {
			console.error(`Error in getMatch(${id}):`, error);
			throw new Error("Could not retrieve match data");
		}
	},

	/**
	 * Fetch a specific team profile
	 */
	async getTeam(id: number) {
		try {
			const result = await db
				.select()
				.from(teams)
				.where(eq(teams.id, id))
				.limit(1);

			return result[0] || null;
		} catch (error) {
			console.error(`Error in getTeam(${id}):`, error);
			throw new Error("Could not retrieve team metrics");
		}
	},

	/**
	 * Fetch details for a specific player profile
	 */
	async getPlayer(id: number) {
		try {
			const result = await db
				.select()
				.from(players)
				.where(eq(players.id, id))
				.limit(1);

			return result[0] || null;
		} catch (error) {
			console.error(`Error in getPlayer(${id}):`, error);
			throw new Error("Could not retrieve player statistics");
		}
	},
};
