import axios from "axios";
import redis from "@/lib/redis";

const BASE = "https://api.football-data.org/v4";

const apiClient = axios.create({
	baseURL: BASE,
	headers: {
		"X-Auth-Token": process.env.API_FOOTBALL_KEY,
	},
});

export async function fetchFootballData<T>(
	endpoint: string,
	params: Record<string, unknown> = {},
	ttl: number = 86400,
): Promise<T | null> {
	const cacheKey = `football-data:${endpoint}:${JSON.stringify(params)}`;

	try {
		if (ttl > 0) {
			const cached = await redis.get<T>(cacheKey);
			if (cached) return cached;
		}

		const response = await apiClient.get(endpoint, { params });
		const data = response.data;

		if (ttl > 0) {
			await redis.set(cacheKey, data, { ex: ttl });
		}
		return data as T;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const detail = error.response?.data?.message || error.message;
			console.error(`[football-data] ${endpoint}:`, detail);
		} else {
			console.error("[football-data] Unexpected:", error);
		}
		return null;
	}
}
