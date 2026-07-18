import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { MatchTime } from "@/components/match-time";
import { auth } from "@/lib/auth";
import { LEAGUE_PRIORITIES } from "@/lib/constants/leagues";
import { fetchFootballData } from "@/server/services/football-api";
export const dynamic = "force-dynamic";

interface MatchData {
	id: string;
	status: string;
	utcDate: string;
	homeTeam: { name: string; logo: string };
	awayTeam: { name: string; logo: string };
	homeScore: number | null;
	awayScore: number | null;
	leagueName: string;
	leagueLogo: string;
	leagueId: string;
}

type GroupedMatches = Record<
	string,
	{
		leagueName: string;
		leagueLogo: string;
		leagueId: string;
		fixtures: MatchData[];
	}
>;

const NOT_STARTED = new Set([
	"SCHEDULED",
	"TIMED",
	"POSTPONED",
	"SUSPENDED",
	"CANCELLED",
]);

interface ApiCompetition {
	id: number;
	name: string;
	emblem: string;
	type?: string;
}

interface ApiTeam {
	id: number;
	name: string;
	crest: string;
}

interface ApiScore {
	fullTime: { home: number | null; away: number | null } | null;
}

interface ApiMatch {
	id: number;
	status: string;
	utcDate: string;
	competition: ApiCompetition;
	homeTeam: ApiTeam;
	awayTeam: ApiTeam;
	score: ApiScore;
}

interface ApiMatchesResponse {
	filters: Record<string, unknown>;
	resultSet: Record<string, unknown>;
	matches: ApiMatch[];
}

async function getGroupedTodayMatches(): Promise<GroupedMatches> {
	const data = await fetchFootballData<ApiMatchesResponse>("/matches", {}, 0);

	const grouped: GroupedMatches = {};

	if (!data) return grouped;

	const matches: ApiMatch[] = data.matches ?? [];
	if (!matches.length) return grouped;

	matches.forEach((entry) => {
		if (!entry?.competition) return;

		const comp = entry.competition;
		const compId = String(comp.id ?? "");
		const compName = String(comp.name ?? "").trim() || "Unknown";
		const compLogo = String(comp.emblem ?? "");
		const key = compId ? `${compId}-${compName}` : compName;

		if (!grouped[key]) {
			grouped[key] = {
				leagueName: compName,
				leagueLogo: compLogo,
				leagueId: compId,
				fixtures: [],
			};
		}

		const status = String(entry.status ?? "").trim() || "SCHEDULED";
		const utcDate = String(entry.utcDate ?? "");

		const ht = entry.homeTeam ?? {};
		const at = entry.awayTeam ?? {};
		const score = entry.score ?? {};

		grouped[key].fixtures.push({
			id: String(entry.id ?? Math.random()),
			status,
			utcDate,
			homeTeam: {
				name: String(ht.name ?? "Home Team"),
				logo: String(ht.crest ?? ""),
			},
			awayTeam: {
				name: String(at.name ?? "Away Team"),
				logo: String(at.crest ?? ""),
			},
			homeScore: score.fullTime?.home ?? null,
			awayScore: score.fullTime?.away ?? null,
			leagueName: compName,
			leagueLogo: compLogo,
			leagueId: compId,
		});
	});

	const nameToPriority: Record<string, number> = {};
	const idToPriority: Record<string, number> = {};
	LEAGUE_PRIORITIES.forEach((l) => {
		nameToPriority[l.name] = l.priority;
		idToPriority[String(l.id)] = l.priority;
	});

	const matched: [string, GroupedMatches[string]][] = [];
	const unmatched: [string, GroupedMatches[string]][] = [];

	for (const entry of Object.entries(grouped)) {
		const [, dataEntry] = entry;
		const prio = nameToPriority[entry[0]] ?? idToPriority[dataEntry.leagueId];
		(prio !== undefined ? matched : unmatched).push(entry);
	}

	matched.sort(([aName, aData], [bName, bData]) => {
		const aPrio = nameToPriority[aName] ?? idToPriority[aData.leagueId] ?? 999;
		const bPrio = nameToPriority[bName] ?? idToPriority[bData.leagueId] ?? 999;
		return aPrio - bPrio;
	});

	unmatched.sort(([aName], [bName]) => aName.localeCompare(bName));

	return Object.fromEntries([...matched, ...unmatched]);
}

export default async function HomePage() {
	const session = await auth();
	const groupedMatches = await getGroupedTodayMatches();

	const hasMatches = Object.keys(groupedMatches).length > 0;

	return (
		<AppShell user={session?.user}>
			<div className="w-full space-y-8">
				<header className="border-b pb-4 dark:border-zinc-800">
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
						Today&apos;s Fixtures
					</h1>
				</header>

				{!hasMatches ? (
					<div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed bg-white dark:bg-zinc-900 dark:border-zinc-800">
						No matches scheduled for today.
					</div>
				) : (
					<div className="space-y-8">
						{Object.entries(groupedMatches).map(([leagueName, data]) => (
							<section
								key={leagueName}
								className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden"
							>
								<Link href={`/dashboard/leagues/${data.leagueId}`}>
									<div className="flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 bg-zinc-100/50 dark:bg-zinc-800/40 border-b dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors">
										{data.leagueLogo && (
											<img
												src={data.leagueLogo}
												alt=""
												className="w-7 h-7 object-contain shrink-0"
												style={{ contentVisibility: "auto" }}
											/>
										)}
										<h2 className="font-semibold text-base sm:text-lg tracking-tight truncate">
											{data.leagueName}
										</h2>
									</div>
								</Link>
								<div className="divide-y dark:divide-zinc-800">
									{data.fixtures.map((match) => (
										<Link
											href={`/dashboard/matches/${match.id}`}
											key={match.id}
										>
											<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 px-4 py-4 sm:px-6 sm:py-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors cursor-pointer">
												<div className="flex items-center gap-2.5 sm:gap-3 justify-end text-right min-w-0">
													<span className="text-sm sm:text-base font-medium truncate">
														{match.homeTeam.name}
													</span>
													{match.homeTeam.logo && (
														<img
															src={match.homeTeam.logo}
															alt=""
															className="w-9 h-6 sm:w-10 sm:h-7 object-cover rounded-sm shrink-0"
														/>
													)}
												</div>

												<div className="relative flex items-center justify-center px-2 sm:px-3 shrink-0">
													<div className="flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 w-20 h-9 sm:w-24 sm:h-10 rounded-lg text-sm sm:text-base font-bold tracking-wider tabular-nums text-center">
														{NOT_STARTED.has(match.status) ? (
															<MatchTime utcDate={match.utcDate} />
														) : match.homeScore != null &&
															match.awayScore != null ? (
															`${match.homeScore} - ${match.awayScore}`
														) : (
															"? - ?"
														)}
													</div>
													<span className="absolute top-full mt-1 left-0 right-0 text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-muted-foreground text-center">
														{match.status === "FINISHED"
															? "FT"
															: match.status === "LIVE" ||
																	match.status === "IN_PLAY"
																? "LIVE"
																: match.status === "PAUSED"
																	? "HT"
																	: match.status}
													</span>
												</div>

												<div className="flex items-center gap-2.5 sm:gap-3 justify-start text-left min-w-0">
													{match.awayTeam.logo && (
														<img
															src={match.awayTeam.logo}
															alt=""
															className="w-9 h-6 sm:w-10 sm:h-7 object-cover rounded-sm shrink-0"
														/>
													)}
													<span className="text-sm sm:text-base font-medium truncate">
														{match.awayTeam.name}
													</span>
												</div>
											</div>
										</Link>
									))}
								</div>
							</section>
						))}
					</div>
				)}
			</div>
		</AppShell>
	);
}
