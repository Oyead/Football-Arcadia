import axios from "axios";
import redis from "@/lib/redis";

// API-Football (api-sports.io) direct access — not via RapidAPI.
// Base URL and auth scheme are fixed by the provider, not configurable per-env
// the way the old RapidAPI host was, so they're hardcoded here rather than
// read from RAPIDAPI_HOST/RAPIDAPI_KEY env vars.
//
// Docs: https://www.api-football.com/documentation-v3
// Auth: single header `x-apisports-key: <your key>` — get a free key at
// https://dashboard.api-football.com after signing up, no card required.
const FOOTBALL_API_BASE = "https://v3.football.api-sports.io";

const apiClient = axios.create({
	baseURL: FOOTBALL_API_BASE,
	headers: {
		"x-apisports-key": process.env.API_FOOTBALL_KEY,
	},
});

/**
 * @param endpoint
 * @param params
 * @param ttl
 */
export async function fetchFootballData<T>(
	endpoint: string,
	params: Record<string, unknown> = {},
	ttl: number = 86400,
): Promise<T | null> {
	const cacheKey = `football-v3:${endpoint}:${JSON.stringify(params)}`;

	try {
		const cachedData = await redis.get<T>(cacheKey);
		if (cachedData) {
			console.log(`[Redis] Cache Hit: ${cacheKey}`);
			return cachedData;
		}

		console.log(`[API] Cache Miss: ${cacheKey}. Fetching live...`);
		const response = await apiClient.get(endpoint, { params });
		const data = response.data;

		const hasErrors =
			data?.errors &&
			(Array.isArray(data.errors)
				? data.errors.length > 0
				: Object.keys(data.errors).length > 0);

		if (hasErrors) {
			console.error(
				`[API-Football] Errors in response for ${cacheKey}:`,
				data.errors,
			);
			return null;
		}

		await redis.set(cacheKey, data, { ex: ttl });

		return data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(
				"Football API Error:",
				error.response?.data || error.message,
			);
		} else {
			console.error("Unexpected Error:", error);
		}
		return null;
	}
}
