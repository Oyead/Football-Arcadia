import { fetchFootballData } from "@server/services/football-api";
import Image from "next/image";
import Link from "next/link";
import { MatchTime } from "@/components/match-time";
export const dynamic = "force-dynamic";

interface ApiArea {
	id: number;
	name: string;
	code: string;
	flag: string;
}

interface ApiCompetition {
	id: number;
	name: string;
	code?: string;
	type?: string;
	emblem: string;
}

interface ApiSeason {
	id: number;
	startDate: string;
	endDate: string;
	currentMatchday?: number;
	winner?: string | null;
	stages?: string[];
}

interface ApiTeam {
	id: number;
	name: string;
	shortName?: string;
	tla?: string;
	crest: string;
}

interface ApiScore {
	fullTime: { home: number | null; away: number | null } | null;
	halfTime?: { home: number | null; away: number | null } | null;
	duration?: string;
	winner?: string;
}

interface ApiReferee {
	id: number;
	name: string;
	type: string;
	nationality?: string | null;
}

interface ApiMatch {
	area: ApiArea;
	competition: ApiCompetition;
	season: ApiSeason;
	id: number;
	utcDate: string;
	status: string;
	venue?: string | null;
	matchday?: number;
	stage?: string;
	group?: string | null;
	homeTeam: ApiTeam;
	awayTeam: ApiTeam;
	score: ApiScore;
	referees?: ApiReferee[];
}

const NOT_STARTED = new Set([
	"SCHEDULED",
	"TIMED",
	"POSTPONED",
	"SUSPENDED",
	"CANCELLED",
]);

const STATUS_LABELS: Record<string, string> = {
	FINISHED: "FT",
	IN_PLAY: "LIVE",
	LIVE: "LIVE",
	PAUSED: "HT",
	SCHEDULED: "SCHEDULED",
	TIMED: "TIMED",
	POSTPONED: "PPD",
	SUSPENDED: "SUS",
	CANCELLED: "CANC",
	AWARDED: "AWD",
};

const DURATION_LABELS: Record<string, string> = {
	REGULAR: "Regular time",
	EXTRA_TIME: "Extra time",
	PENALTY_SHOOTOUT: "Penalties",
};

const WINNER_LABELS: Record<string, string> = {
	HOME_TEAM: "Home win",
	AWAY_TEAM: "Away win",
	DRAW: "Draw",
};

function formatRefereeType(type: string) {
	if (!type) return "Referee";
	return type
		.toLowerCase()
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function InfoRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-baseline gap-2 text-sm">
			<span className="text-muted-foreground shrink-0 w-20">{label}</span>
			<span className="font-medium truncate">{children}</span>
		</div>
	);
}

async function MatchesDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const matchId = parseInt(id, 10);
	const match = await fetchFootballData<ApiMatch>(`/matches/${matchId}`, {}, 0);

	if (!match) {
		return (
			<div className="space-y-6">
				<Link
					href="/"
					className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					&larr; Back to fixtures
				</Link>
				<div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed bg-white dark:bg-zinc-900 dark:border-zinc-800">
					No match found
				</div>
			</div>
		);
	}

	const matchDate = match.utcDate
		? new Date(match.utcDate).toLocaleDateString([], {
				weekday: "long",
				day: "numeric",
				month: "long",
				year: "numeric",
			})
		: "";

	const isNotStarted = NOT_STARTED.has(match.status);
	const isLive =
		!isNotStarted && (match.status === "LIVE" || match.status === "IN_PLAY");
	const isFinished = match.status === "FINISHED" || match.status === "AWARDED";

	const halfTime = match.score?.halfTime;
	const hasHalfTime =
		isFinished && halfTime?.home != null && halfTime?.away != null;
	const seasonStart = match.season?.startDate?.split("-")[0] ?? "";
	const seasonEnd = match.season?.endDate?.split("-")[0] ?? "";

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Back link */}
			<Link
				href="/"
				className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				&larr; Back to fixtures
			</Link>

			{/* Competition header */}
			<div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
				<div className="flex items-center gap-3 p-4 bg-zinc-100/50 dark:bg-zinc-800/40 border-b dark:border-zinc-800">
					{match.competition.emblem && (
						<div className="w-6 h-6 flex items-center justify-center shrink-0 bg-zinc-200/60 dark:bg-zinc-800 rounded-full overflow-hidden">
							<Image
								src={match.competition.emblem}
								alt=""
								width={24}
								height={24}
								className="w-6 h-6 object-contain"
							/>
						</div>
					)}
					<div className="flex-1 min-w-0">
						<h1 className="font-semibold text-base truncate">
							{match.competition.name}
						</h1>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							{match.area && <span>{match.area.name}</span>}
							{match.competition.type && (
								<span className="uppercase">
									{match.competition.type.replace(/_/g, " ")}
								</span>
							)}
							{match.season && <span>Season {seasonStart}</span>}
						</div>
					</div>
					{match.matchday && (
						<span className="text-xs text-muted-foreground shrink-0">
							MD {match.matchday}
						</span>
					)}
				</div>

				{/* Scoreboard */}
				<div className="px-4 py-8 md:px-8 md:py-10">
					<div className="flex items-center justify-center gap-3 md:gap-8">
						<Link
							href={`/teams/${match.homeTeam.id}`}
							className="flex flex-col items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity group"
						>
							<div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-2 group-hover:ring-zinc-400 dark:group-hover:ring-zinc-500 transition-all">
								<Image
									src={match.homeTeam.crest}
									alt=""
									width={96}
									height={96}
									className="object-contain w-full h-full"
								/>
							</div>
							<span className="text-sm md:text-base font-semibold text-center truncate max-w-[100px] sm:max-w-[160px]">
								{match.homeTeam.name}
							</span>
							{match.homeTeam.shortName && (
								<span className="text-xs text-muted-foreground -mt-1.5 hidden sm:block">
									{match.homeTeam.shortName}
								</span>
							)}
						</Link>

						{/* Score / Time */}
						<div className="flex flex-col items-center gap-2 shrink-0">
							<div
								className={`
										px-4 py-2 rounded-lg text-xl md:text-3xl font-bold tracking-wider tabular-nums min-w-[90px] text-center
										${
											isNotStarted
												? "bg-zinc-100 dark:bg-zinc-800"
												: "bg-zinc-100 dark:bg-zinc-800"
										}
									`}
							>
								{isNotStarted ? (
									<MatchTime utcDate={match.utcDate} />
								) : (
									`${match.score?.fullTime?.home ?? "?"} - ${match.score?.fullTime?.away ?? "?"}`
								)}
							</div>
							{hasHalfTime && (
								<span className="text-xs font-medium text-muted-foreground tabular-nums">
									HT {halfTime.home} - {halfTime.away}
								</span>
							)}
							<span
								className={`
										text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded
										${
											isLive
												? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse"
												: isFinished
													? "bg-zinc-200 dark:bg-zinc-700 text-muted-foreground"
													: "text-muted-foreground"
										}
									`}
							>
								{STATUS_LABELS[match.status] ?? match.status}
							</span>
							<span className="text-xs text-muted-foreground text-center leading-tight">
								{matchDate}
							</span>
						</div>

						<Link
							href={`/teams/${match.awayTeam.id}`}
							className="flex flex-col items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity group"
						>
							<div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-2 group-hover:ring-zinc-400 dark:group-hover:ring-zinc-500 transition-all">
								<Image
									src={match.awayTeam.crest}
									alt=""
									width={96}
									height={96}
									className="object-contain w-full h-full"
								/>
							</div>
							<span className="text-sm md:text-base font-semibold text-center truncate max-w-[100px] sm:max-w-[160px]">
								{match.awayTeam.name}
							</span>
							{match.awayTeam.shortName && (
								<span className="text-xs text-muted-foreground -mt-1.5 hidden sm:block">
									{match.awayTeam.shortName}
								</span>
							)}
						</Link>
					</div>
				</div>
			</div>

			{/* Match info */}
			{(match.stage ||
				match.group ||
				match.venue ||
				match.matchday != null ||
				match.score?.duration ||
				match.score?.winner ||
				(match.season?.startDate && match.season?.endDate)) && (
				<div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
					<div className="flex items-center gap-3 p-4 bg-zinc-100/50 dark:bg-zinc-800/40 border-b dark:border-zinc-800">
						<h2 className="font-semibold text-base">Match Info</h2>
					</div>
					<div className="p-4 space-y-2">
						{match.stage && (
							<InfoRow label="Stage">{match.stage.replace(/_/g, " ")}</InfoRow>
						)}
						{match.group && (
							<InfoRow label="Group">Group {match.group}</InfoRow>
						)}
						{match.venue && <InfoRow label="Venue">{match.venue}</InfoRow>}
						{match.matchday != null && (
							<InfoRow label="Matchday">{match.matchday}</InfoRow>
						)}
						{match.score?.duration && (
							<InfoRow label="Duration">
								{DURATION_LABELS[match.score.duration] ??
									match.score.duration.replace(/_/g, " ")}
							</InfoRow>
						)}
						{match.score?.winner && (
							<InfoRow label="Result">
								{WINNER_LABELS[match.score.winner] ??
									match.score.winner.replace(/_/g, " ")}
							</InfoRow>
						)}
						{match.season?.startDate && match.season?.endDate && (
							<InfoRow label="Season">
								{seasonStart} &ndash; {seasonEnd}
							</InfoRow>
						)}
					</div>
				</div>
			)}

			{/* Referees */}
			{match.referees && match.referees.length > 0 && (
				<div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
					<div className="flex items-center gap-3 p-4 bg-zinc-100/50 dark:bg-zinc-800/40 border-b dark:border-zinc-800">
						<h2 className="font-semibold text-base">Referees</h2>
					</div>
					<div className="p-4 space-y-3">
						{match.referees.map((referee) => (
							<div
								key={referee.id}
								className="flex items-center justify-between gap-3"
							>
								<div className="min-w-0">
									<p className="text-sm font-medium truncate">{referee.name}</p>
									{referee.nationality && (
										<p className="text-xs text-muted-foreground">
											{referee.nationality}
										</p>
									)}
								</div>
								<span className="text-xs uppercase font-medium text-muted-foreground shrink-0">
									{formatRefereeType(referee.type)}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export default MatchesDetailPage;
