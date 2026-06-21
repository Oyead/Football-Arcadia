import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/lib/auth";
import { fetchFootballData } from "@/server/services/football-api";

export const revalidate = 300;

interface FreeApiMatch {
	id: string;
	status: string;
	time: string;
	homeTeam: { name: string; logo: string };
	awayTeam: { name: string; logo: string };
	homeScore?: number | null;
	awayScore?: number | null;
	leagueName?: string;
	leagueLogo?: string;
}

type GroupedMatches = Record<
	string,
	{
		leagueName: string;
		leagueLogo: string;
		fixtures: FreeApiMatch[];
	}
>;

// API-Football fixture status codes that mean "not started yet" — used to
// decide whether to show kickoff time or a live/final score in the UI.
// Reference: https://www.api-football.com/documentation-v3#operation/get-fixtures (Status mapping)
const NOT_STARTED_STATUS_CODES = new Set(["NS", "TBD", "PST", "CANC", "ABD"]);

type LeagueInfo = { name: string; logo: string };
type LeagueMap = Record<string, LeagueInfo>;

// In-memory cache for the leagues list, shared across requests on the same
// server instance. Avoids re-fetching on every page load — league rosters
// don't change within a day. Reset happens naturally on redeploy/cold start;
// `revalidate`-driven ISR on this route also bounds how stale it can get.
// Redis layer in fetchFootballData already caches the raw response for 24h
// (default ttl) too — this is an additional in-process cache on top of that
// to avoid even the Redis round-trip on every request.
let leagueMapCache: LeagueMap | null = null;
let leagueMapCacheAt = 0;
const LEAGUE_MAP_TTL_MS = 24 * 60 * 60 * 1000; // 24h

async function getLeagueMap(): Promise<LeagueMap> {
	const isFresh =
		leagueMapCache && Date.now() - leagueMapCacheAt < LEAGUE_MAP_TTL_MS;
	if (isFresh) return leagueMapCache as LeagueMap;

	try {
		// Per API-Football docs, GET /leagues returns the full catalog with
		// no params required. Response shape: { response: [ { league: {...},
		// country: {...}, seasons: [...] }, ... ] }. fetchFootballData's
		// default ttl (24h) is appropriate here — league rosters barely change.
		const data = await fetchFootballData<any>("/leagues", {});

		let leaguesList: any[] = [];
		if (Array.isArray(data?.response)) leaguesList = data.response;
		else if (Array.isArray(data?.leagues)) leaguesList = data.leagues;
		else if (Array.isArray(data)) leaguesList = data;
		else {
			console.warn(
				"[getLeagueMap] Unrecognized /leagues response shape, keys:",
				data ? Object.keys(data) : data,
			);
		}

		const map: LeagueMap = {};
		leaguesList.forEach((entry: any) => {
			if (!entry) return;
			// Documented shape nests the actual league fields under `.league`.
			// Fall back to the entry itself in case a flatter shape is returned.
			const league = entry.league ?? entry;
			const id = String(league?.id ?? "");
			const name = String(league?.name ?? "").trim();
			const logo = String(league?.logo ?? "");
			if (!id || !name) return;
			map[id] = { name, logo };
		});

		if (Object.keys(map).length > 0) {
			leagueMapCache = map;
			leagueMapCacheAt = Date.now();
			return map;
		}

		console.warn(
			"[getLeagueMap] Parsed leagues list was empty; falling back to stale/empty cache.",
		);
		return leagueMapCache ?? {};
	} catch (err) {
		console.error("[getLeagueMap] Failed to fetch leagues list:", err);
		// Serve stale cache rather than breaking the whole page on a transient failure.
		return leagueMapCache ?? {};
	}
}

async function getGroupedTodayMatches(): Promise<GroupedMatches> {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	// API-Football's documented date format for /fixtures is YYYY-MM-DD
	// (hyphenated) — different from the old provider's compact YYYYMMDD.
	const apiDateParam = `${year}-${month}-${day}`;

	const [data, leagueMap] = await Promise.all([
		// Short ttl here (5 min) since fixtures/scores change during live play —
		// overrides fetchFootballData's 24h default. Matches the page's own
		// `revalidate = 300`. NOTE: API-Football's free tier recommends
		// calling fixtures at most ~1x/hour; a 5-minute cache window across
		// many concurrent users may burn through the daily request quota
		// faster than expected — revisit this ttl once real usage is known.
		fetchFootballData<any>("/fixtures", { date: apiDateParam }, 300),
		getLeagueMap(),
	]);

	const grouped: GroupedMatches = {};

	if (!data) return grouped;

	// API-Football documented shape for GET /fixtures:
	// { response: [ { fixture: {id, date, status:{short,long,elapsed}},
	//                 league: {id, name, country, logo, season, round},
	//                 teams: {home:{id,name,logo,winner}, away:{...}},
	//                 goals: {home, away}, score: {...} }, ... ] }
	// Unlike the previous provider, each fixture already carries its own
	// league name + logo directly — no need to cross-reference leagueMap
	// for grouping. We still fetch /leagues (leagueMap) as a fallback for
	// cases where a fixture's embedded league name is missing/blank.
	let flatFixtures: any[] = [];
	if (Array.isArray(data.response)) flatFixtures = data.response;
	else if (Array.isArray(data.fixtures)) flatFixtures = data.fixtures;
	else if (Array.isArray(data)) flatFixtures = data;
	else {
		console.warn(
			"[getGroupedTodayMatches] Unrecognized /fixtures response shape, keys:",
			Object.keys(data),
		);
	}

	flatFixtures.forEach((entry: any) => {
		if (!entry) return;

		const fixture = entry.fixture ?? {};
		const league = entry.league ?? {};
		const teams = entry.teams ?? {};
		const goals = entry.goals ?? {};

		const apiLeagueId = String(league.id ?? "");

		// Prefer the league info embedded directly on the fixture; fall back
		// to the /leagues lookup if it's missing for some reason.
		const dynamicNameKey =
			String(league.name ?? "").trim() ||
			leagueMap[apiLeagueId]?.name ||
			`League ${apiLeagueId || "Unknown"}`;
		const leagueLogoUrl =
			String(league.logo ?? "") || leagueMap[apiLeagueId]?.logo || "";

		if (!grouped[dynamicNameKey]) {
			grouped[dynamicNameKey] = {
				leagueName: dynamicNameKey,
				leagueLogo: leagueLogoUrl,
				fixtures: [],
			};
		}

		// Status: API-Football gives a short code (NS, 1H, HT, 2H, FT, PST,
		// CANC, etc.) directly — no nested cancelled/finished/started flags
		// to interpret like the old provider, so this is much simpler now.
		const statusShort = String(fixture.status?.short ?? "NS");

		// Kickoff time: fixture.date is a full ISO 8601 timestamp, e.g.
		// "2026-06-21T22:00:00+00:00" — extract HH:MM in UTC for display.
		// (If local-timezone kickoff time matters, convert with the user's
		// timezone instead of slicing the ISO string directly.)
		let matchTime = "00:00";
		if (typeof fixture.date === "string" && fixture.date.includes("T")) {
			matchTime = fixture.date.split("T")[1]?.slice(0, 5) ?? "00:00";
		}

		const homeId = teams.home?.id;
		const awayId = teams.away?.id;
		const homeName = teams.home?.name || "Home Team";
		const awayName = teams.away?.name || "Away Team";

		grouped[dynamicNameKey].fixtures.push({
			id: String(fixture.id ?? Math.random()),
			status: statusShort,
			time: matchTime,
			homeTeam: {
				name: homeName,
				logo: String(teams.home?.logo ?? ""),
			},
			awayTeam: {
				name: awayName,
				logo: String(teams.away?.logo ?? ""),
			},
			homeScore: goals.home ?? null,
			awayScore: goals.away ?? null,
			leagueName: dynamicNameKey,
		});
	});

	return grouped;
}

export default async function HomePage() {
	const [session, groupedMatches] = await Promise.all([
		auth(),
		getGroupedTodayMatches(),
	]);

	const hasMatches = Object.keys(groupedMatches).length > 0;

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors">
			<Navbar />

			<div className="flex">
				<Sidebar />

				<main className="flex-1 p-6 md:pl-6 w-full">
					<div className="w-full max-w-7xl space-y-6">
						<header className="border-b pb-4 dark:border-zinc-800">
							<h1 className="text-3xl font-bold tracking-tight">
								Today&apos;s Fixtures
							</h1>
							<p className="text-muted-foreground text-sm mt-1">
								Live match scoring updated incrementally.
							</p>
						</header>

						{session?.user && (
							<div className="flex flex-col gap-4 p-4 rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
								<div>
									<h2 className="text-base font-semibold">
										Welcome back, {session.user.name}!
									</h2>
									<p className="text-xs text-muted-foreground">
										Here is what&apos;s happening in your pinned leagues.
									</p>
								</div>
								<div className="border-t dark:border-zinc-800 pt-3 grid grid-cols-2 gap-4">
									<div>
										<h3 className="text-xs font-medium text-muted-foreground">
											Followed Teams
										</h3>
										<p className="text-xl font-bold">12</p>
									</div>
								</div>
							</div>
						)}

						{!hasMatches ? (
							<div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed bg-white dark:bg-zinc-900 dark:border-zinc-800">
								No matches scheduled for today.
							</div>
						) : (
							<div className="space-y-6">
								{Object.entries(groupedMatches).map(([leagueName, data]) => (
									<section
										key={leagueName}
										className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden"
									>
										<div className="flex items-center gap-3 p-4 bg-zinc-100/50 dark:bg-zinc-800/40 border-b dark:border-zinc-800">
											{data.leagueLogo && (
												<div className="w-6 h-6 flex items-center justify-center shrink-0 bg-zinc-200/60 dark:bg-zinc-800 rounded-full overflow-hidden">
													<img
														src={data.leagueLogo}
														alt=""
														className="w-6 h-6 object-contain"
														style={{ contentVisibility: "auto" }}
													/>
												</div>
											)}
											<h2 className="font-semibold text-base">
												{data.leagueName}
											</h2>
										</div>

										<div className="divide-y dark:divide-zinc-800">
											{data.fixtures.map((match) => (
												<div
													key={match.id}
													className="grid grid-cols-3 items-center p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
												>
													{/* Home Team */}
													<div className="flex items-center gap-3 justify-end text-right">
														<span className="text-sm font-medium truncate max-w-[120px] sm:max-w-none">
															{match.homeTeam.name}
														</span>
														{match.homeTeam.logo && (
															<img
																src={match.homeTeam.logo}
																alt=""
																className="w-6 h-6 object-contain shrink-0"
															/>
														)}
													</div>

													{/* Score Status Block */}
													<div className="flex flex-col items-center justify-center px-2">
														<div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded text-sm font-bold tracking-wider tabular-nums min-w-[50px] text-center">
															{NOT_STARTED_STATUS_CODES.has(match.status)
																? match.time
																: `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`}
														</div>
														<span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1 text-center">
															{match.status}
														</span>
													</div>

													{/* Away Team */}
													<div className="flex items-center gap-3 justify-start text-left">
														{match.awayTeam.logo && (
															<img
																src={match.awayTeam.logo}
																alt=""
																className="w-6 h-6 object-contain shrink-0"
															/>
														)}
														<span className="text-sm font-medium truncate max-w-[120px] sm:max-w-none">
															{match.awayTeam.name}
														</span>
													</div>
												</div>
											))}
										</div>
									</section>
								))}
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}
