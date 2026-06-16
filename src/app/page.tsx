import Image from "next/image";
import { fetchFootballData } from "@/server/services/football-api";
// Configure Next.js ISR: Revalidate the static page at most every 5 minutes
export const revalidate = 300;

// Define the API-Football match shape interfaces
interface MatchFixture {
	fixture: {
		id: number;
		date: string;
		status: { short: string };
	};
	league: {
		id: number;
		name: string;
		logo: string;
	};
	teams: {
		home: { name: string; logo: string };
		away: { name: string; logo: string };
	};
	goals: {
		home: number | null;
		away: number | null;
	};
}

interface ApiResponse {
	response: MatchFixture[];
}

type GroupedMatches = Record<
	string,
	{
		leagueName: string;
		leagueLogo: string;
		fixtures: MatchFixture[];
	}
>;

async function getGroupedTodayMatches(): Promise<GroupedMatches> {
	// Get today's date formatted as YYYY-MM-DD
	const todayString = new Date().toISOString().split("T")[0];

	// 1. Create a dynamic cache key and the full endpoint URL for today
	const cacheKey = `fixtures-${todayString}`;
	const apiEndpoint = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${todayString}`;

	// 2. Fetch using your high-performance Neon cache wrapper
	const data = await fetchFootballData<ApiResponse>(cacheKey, apiEndpoint);
	const fixtures = data?.response || [];

	// 3. Group fixtures by their unique League ID
	const grouped: GroupedMatches = {};

	fixtures.forEach((match) => {
		const leagueId = match.league.id.toString();
		if (!grouped[leagueId]) {
			grouped[leagueId] = {
				leagueName: match.league.name,
				leagueLogo: match.league.logo,
				fixtures: [],
			};
		}
		grouped[leagueId].fixtures.push(match);
	});

	return grouped;
}

export default async function HomePage() {
	const groupedMatches = await getGroupedTodayMatches();
	const hasMatches = Object.keys(groupedMatches).length > 0;

	return (
		<main className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors">
			<div className="max-w-4xl mx-auto space-y-8">
				<header className="border-b pb-4 dark:border-zinc-800">
					<h1 className="text-3xl font-bold tracking-tight">
						Today's Fixtures
					</h1>
					<p className="text-muted-foreground text-sm">
						Live match scoring updated incrementally.
					</p>
				</header>

				{!hasMatches ? (
					<div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed bg-white dark:bg-zinc-900 dark:border-zinc-800">
						No matches scheduled for today.
					</div>
				) : (
					<div className="space-y-6">
						{Object.entries(groupedMatches).map(([leagueId, data]) => (
							<section
								key={leagueId}
								className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden"
							>
								{/* League Header */}
								<div className="flex items-center gap-3 p-4 bg-zinc-100/50 dark:bg-zinc-800/40 border-b dark:border-zinc-800">
									<div className="relative w-6 h-6">
										<Image
											src={data.leagueLogo}
											alt={data.leagueName}
											fill
											className="object-contain"
										/>
									</div>
									<h2 className="font-semibold text-base">{data.leagueName}</h2>
								</div>

								{/* Fixture Rows */}
								<div className="divide-y dark:divide-zinc-800">
									{data.fixtures.map((match) => (
										<div
											key={match.fixture.id}
											className="grid grid-cols-3 items-center p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
										>
											{/* Home Team */}
											<div className="flex items-center gap-3 justify-end text-right">
												<span className="text-sm font-medium truncate max-w-[120px] sm:max-w-none">
													{match.teams.home.name}
												</span>
												<img
													src={match.teams.home.logo}
													alt={match.teams.home.name}
													className="w-6 h-6 object-contain"
												/>
											</div>

											{/* Score / Status Center Node */}
											<div className="flex flex-col items-center justify-center px-2">
												<div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded text-sm font-bold tracking-wider tabular-nums min-w-[50px] text-center">
													{match.fixture.status.short === "NS"
														? new Date(match.fixture.date).toLocaleTimeString(
																[],
																{ hour: "2-digit", minute: "2-digit" },
															)
														: `${match.goals.home ?? 0} - ${match.goals.away ?? 0}`}
												</div>
												<span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">
													{match.fixture.status.short}
												</span>
											</div>

											{/* Away Team */}
											<div className="flex items-center gap-3 justify-start text-left">
												<img
													src={match.teams.away.logo}
													alt={match.teams.away.name}
													className="w-6 h-6 object-contain"
												/>
												<span className="text-sm font-medium truncate max-w-[120px] sm:max-w-none">
													{match.teams.away.name}
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
	);
}
