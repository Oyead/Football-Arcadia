import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { apiCache } from "@/server/db/schema";

export async function getCachedFootballData(
	cacheKey: string,
	apiEndpoint: string,
) {
	// 1. Check Neon Database Cache
	const cachedRecord = await db
		.select()
		.from(apiCache)
		.where(eq(apiCache.key, cacheKey))
		.limit(1)
		.then((res) => res[0]);

	const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
	const isFresh =
		cachedRecord &&
		Date.now() - cachedRecord.updatedAt.getTime() < ONE_DAY_IN_MS;

	// 2. Cache Hit: Return the stored database data
	if (isFresh) {
		console.log(`Cache HIT for key: ${cacheKey}`);
		return cachedRecord.data;
	}

	// 3. Cache Miss: Fetch from RapidAPI
	console.log(`Cache MISS for key: ${cacheKey}. Fetching from live API...`);
	try {
		const response = await fetch(apiEndpoint, {
			method: "GET",
			headers: {
				"x-rapidapi-key": process.env.FOOTBALL_API_KEY!,
				"x-rapidapi-host": "api-football-v1.p.rapidapi.com",
			},
		});

		if (!response.ok) throw new Error("API call failed");
		const freshData = await response.json();

		// 4. Save to Neon database (Upsert)
		await db
			.insert(apiCache)
			.values({
				key: cacheKey,
				data: freshData,
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: apiCache.key,
				set: {
					data: freshData,
					updatedAt: new Date(),
				},
			});

		return freshData;
	} catch (error) {
		console.error(
			"Failed to fetch fresh API data, falling back to old cache:",
			error,
		);
		// Fallback to old cache data if API fails so the user sees no downtime
		return cachedRecord ? cachedRecord.data : null;
	}
}
