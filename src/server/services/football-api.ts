import axios from "axios";
import Redis from "ioredis";

// Initialize Redis client
// On Vercel, use your Upstash Redis URL; locally, use 'redis://localhost:6379'
const redis = new Redis(process.env.REDIS_URL || "");

const FOOTBALL_API_BASE = "https://api-football-v1.p.rapidapi.com/v3";

const apiClient = axios.create({
	baseURL: FOOTBALL_API_BASE,
	headers: {
		"x-rapidapi-key": process.env.FOOTBALL_API_KEY,
		"x-rapidapi-host": "api-football-v1.p.rapidapi.com",
	},
});

/**
 * @param endpoint The API endpoint (e.g., '/leagues')
 * @param params Query parameters
 * @param ttl Time-to-live in seconds (default 24 hours)
 */
export async function fetchFootballData<T>(
	endpoint: string,
	params: Record<string, unknown> = {},
	ttl: number = 86400,
): Promise<T | null> {
	// Create a unique cache key based on endpoint and params
	const cacheKey = `football:${endpoint}:${JSON.stringify(params)}`;

	try {
		// 1. Try to get data from Redis
		const cachedData = await redis.get(cacheKey);
		if (cachedData) {
			console.log(`[Redis] Cache Hit: ${cacheKey}`);
			return JSON.parse(cachedData) as T;
		}

		// 2. Cache Miss - Fetch from API-Football
		console.log(`[API] Cache Miss: ${cacheKey}. Fetching live...`);
		const response = await apiClient.get(endpoint, { params });
		const data = response.data;

		// 3. Store in Redis with Expiry
		// 'EX' sets the expiration in seconds
		await redis.set(cacheKey, JSON.stringify(data), "EX", ttl);

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
