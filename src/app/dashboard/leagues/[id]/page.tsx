import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchFootballData } from "@/server/services/football-api";

interface PageProps {
	params: Promise<{ id: string }>;
}

interface LeagueDisplay {
	id: number;
	name: string;
	country: string | null;
	logoUrl: string | null;
}

interface StandingTeam {
	rank: number;
	team: { id: number; name: string; logo: string };
	points: number;
	goalsDiff: number;
	form: string;
	group: string;
	all: {
		played: number;
		win: number;
		draw: number;
		lose: number;
		goalsFor: number;
		goalsAgainst: number;
	};
}

interface ApiStandingTableEntry {
	position: number;
	team: { id: number; name: string; crest: string };
	points: number;
	goalDifference: number;
	form: string;
	playedGames: number;
	won: number;
	draw: number;
	lost: number;
	goalsFor: number;
	goalsAgainst: number;
}

interface ApiStandingGroup {
	group: string;
	table: ApiStandingTableEntry[];
}

interface ApiCompetition {
	id: number;
	name: string;
	emblem: string;
	type?: string;
	area?: { name: string };
}

interface ApiStandingsResponse {
	competition: ApiCompetition;
	standings: ApiStandingGroup[];
}

interface ApiCompetitionResponse {
	id: number;
	name: string;
	emblem: string;
	area?: { name: string };
}

export default async function LeagueDetailPage({ params }: PageProps) {
	const { id } = await params;
	const leagueId = parseInt(id, 10);

	const standingsRes = await fetchFootballData<ApiStandingsResponse>(
		`/competitions/${leagueId}/standings`,
	);

	let league: LeagueDisplay | null = null;
	let groups: StandingTeam[][] = [];
	let competitionType = "";

	if (standingsRes?.competition) {
		const c = standingsRes.competition;
		const area = standingsRes.competition.area;
		league = {
			id: c.id,
			name: c.name,
			country: area?.name ?? null,
			logoUrl: c.emblem ?? null,
		};
		competitionType = String(c.type ?? "");

		const rawGroups: ApiStandingGroup[] = standingsRes.standings ?? [];
		groups = rawGroups.map((g) =>
			(g.table || []).map((t) => ({
				rank: t.position,
				team: { id: t.team.id, name: t.team.name, logo: t.team.crest },
				points: t.points,
				goalsDiff: t.goalDifference,
				form: t.form || "",
				group: g.group || "",
				all: {
					played: t.playedGames,
					win: t.won,
					draw: t.draw,
					lose: t.lost,
					goalsFor: t.goalsFor,
					goalsAgainst: t.goalsAgainst,
				},
			})),
		);
	} else {
		const compRes = await fetchFootballData<ApiCompetitionResponse>(
			`/competitions/${leagueId}`,
		);
		if (compRes?.name) {
			league = {
				id: compRes.id,
				name: compRes.name,
				country: compRes.area?.name ?? null,
				logoUrl: compRes.emblem ?? null,
			};
		}
	}

	if (!league) {
		notFound();
	}

	const hasStandings = groups.length > 0;
	const isTournament = competitionType === "CUP" || groups.length > 1;

	return (
		<div className="space-y-6 sm:space-y-8">
			<div className="flex items-center gap-3 sm:gap-4">
				{league.logoUrl && (
					<div className="w-14 h-14 flex items-center justify-center shrink-0">
						<Image
							src={league.logoUrl}
							alt={league.name}
							width={56}
							height={56}
							className="object-contain"
						/>
					</div>
				)}
				<div>
					<h1 className="text-xl sm:text-2xl font-bold">{league.name}</h1>
					<p className="text-sm text-muted-foreground">{league.country}</p>
				</div>
			</div>

			{hasStandings ? (
				<section>
					<h2 className="text-lg sm:text-xl font-semibold mb-4">Standings</h2>
					{isTournament ? (
						<TournamentGroups groups={groups} />
					) : (
						<LeagueTable teams={groups[0]} />
					)}
				</section>
			) : (
				<section className="text-center py-12 text-muted-foreground border rounded-lg border-dashed bg-white dark:bg-zinc-900 dark:border-zinc-800">
					Standings not available for this competition.
				</section>
			)}
		</div>
	);
}

function FormBadge({ letter }: { letter: string }) {
	const colors: Record<string, string> = {
		W: "bg-green-500",
		D: "bg-yellow-500",
		L: "bg-red-500",
	};
	return (
		<span
			className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white ${colors[letter] || "bg-gray-400"}`}
		>
			{letter}
		</span>
	);
}

function FormIndicator({ form }: { form: string }) {
	if (!form) return null;
	const letters = form.split("");
	return (
		<div className="flex gap-0.5">
			{letters.map((letter, idx) => (
				<FormBadge key={idx} letter={letter} />
			))}
		</div>
	);
}

function LeagueTable({ teams }: { teams: StandingTeam[] }) {
	return (
		<div className="overflow-x-auto bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-muted-foreground">
						<th className="p-2 sm:p-3 text-left">#</th>
						<th className="p-2 sm:p-3 text-left">Team</th>
						<th className="p-2 sm:p-3 text-center hidden sm:table-cell">P</th>
						<th className="p-2 sm:p-3 text-center hidden lg:table-cell">W</th>
						<th className="p-2 sm:p-3 text-center hidden lg:table-cell">D</th>
						<th className="p-2 sm:p-3 text-center hidden lg:table-cell">L</th>
						<th className="p-2 sm:p-3 text-center hidden xl:table-cell">GF</th>
						<th className="p-2 sm:p-3 text-center hidden xl:table-cell">GA</th>
						<th className="p-2 sm:p-3 text-center hidden md:table-cell">GD</th>
						<th className="p-2 sm:p-3 text-center">Pts</th>
						<th className="p-2 sm:p-3 text-center hidden sm:table-cell">
							Form
						</th>
					</tr>
				</thead>
				<tbody>
					{teams.map((team) => (
						<tr
							key={team.team.id}
							className="border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors"
						>
							<td className="p-2 sm:p-3 font-medium">{team.rank}</td>
							<td className="p-2 sm:p-3">
								<Link
									href={`/dashboard/teams/${team.team.id}`}
									className="flex items-center gap-2 min-w-0"
								>
									{team.team.logo && (
										<div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shrink-0">
											<Image
												src={team.team.logo}
												alt=""
												width={24}
												height={24}
												className="object-contain"
											/>
										</div>
									)}
									<span className="font-medium truncate">{team.team.name}</span>
								</Link>
							</td>
							<td className="p-2 sm:p-3 text-center hidden sm:table-cell">
								{team.all.played}
							</td>
							<td className="p-2 sm:p-3 text-center hidden lg:table-cell">
								{team.all.win}
							</td>
							<td className="p-2 sm:p-3 text-center hidden lg:table-cell">
								{team.all.draw}
							</td>
							<td className="p-2 sm:p-3 text-center hidden lg:table-cell">
								{team.all.lose}
							</td>
							<td className="p-2 sm:p-3 text-center hidden xl:table-cell">
								{team.all.goalsFor}
							</td>
							<td className="p-2 sm:p-3 text-center hidden xl:table-cell">
								{team.all.goalsAgainst}
							</td>
							<td className="p-2 sm:p-3 text-center hidden md:table-cell font-medium">
								{team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}
							</td>
							<td className="p-2 sm:p-3 text-center font-bold">
								{team.points}
							</td>
							<td className="p-2 sm:p-3 text-center hidden sm:table-cell">
								<FormIndicator form={team.form} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function TournamentGroups({ groups }: { groups: StandingTeam[][] }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{groups.map((group, idx) => {
				const groupName =
					group[0]?.group || `Group ${String.fromCharCode(65 + idx)}`;
				return (
					<div
						key={groupName}
						className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg overflow-hidden"
					>
						<div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b dark:border-zinc-800">
							<h3 className="font-semibold text-sm">{groupName}</h3>
						</div>
						<table className="w-full text-sm">
							<thead>
								<tr className="text-muted-foreground text-xs">
									<th className="p-2 text-left">#</th>
									<th className="p-2 text-left">Team</th>
									<th className="p-2 text-center">Pts</th>
									<th className="p-2 text-center">Form</th>
								</tr>
							</thead>
							<tbody>
								{group.map((team) => (
									<tr
										key={team.team.id}
										className="border-t dark:border-zinc-800"
									>
										<td className="p-2 font-medium">{team.rank}</td>
										<td className="p-2">
											<Link
												href={`/dashboard/teams/${team.team.id}`}
												className="flex items-center gap-2"
											>
												{team.team.logo && (
													<div className="w-6 h-6 flex items-center justify-center shrink-0">
														<Image
															src={team.team.logo}
															alt=""
															width={24}
															height={24}
															className="object-contain"
														/>
													</div>
												)}
												<span className="text-sm">{team.team.name}</span>
											</Link>
										</td>
										<td className="p-2 text-center font-bold">{team.points}</td>
										<td className="p-2 text-center">
											<FormIndicator form={team.form} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				);
			})}
		</div>
	);
}
