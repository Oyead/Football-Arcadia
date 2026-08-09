import { fetchFootballData } from "@server/services/football-api";
import { and, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { FollowButton } from "@/components/FollowButton";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { userFavourites } from "@/server/db/schema";

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

interface ApiContract {
	start?: string;
	until?: string;
}

interface ApiCoach {
	id: number;
	firstName?: string;
	lastName?: string;
	name: string;
	dateOfBirth?: string;
	nationality?: string;
	contract?: ApiContract;
}

interface ApiPlayer {
	id: number;
	name: string;
	position?: string;
	dateOfBirth?: string;
	nationality?: string;
	shirtNumber?: number;
	marketValue?: number;
	contract?: ApiContract;
}

interface ApiTeamResponse {
	area: ApiArea;
	id: number;
	name: string;
	shortName?: string;
	tla?: string;
	crest: string;
	address?: string;
	website?: string;
	founded?: number;
	clubColors?: string;
	venue?: string;
	runningCompetitions?: ApiCompetition[];
	coach?: ApiCoach;
	marketValue?: number;
	squad?: ApiPlayer[];
	lastUpdated?: string;
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
			<span className="text-muted-foreground shrink-0 w-24">{label}</span>
			<span className="font-medium truncate">{children}</span>
		</div>
	);
}

function SquadTable({ players }: { players: ApiPlayer[] }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-muted-foreground">
						<th className="p-3 text-left">#</th>
						<th className="p-3 text-left">Player</th>
						<th className="p-3 text-left hidden sm:table-cell">Position</th>
						<th className="p-3 text-left hidden md:table-cell">Nationality</th>
						<th className="p-3 text-left hidden lg:table-cell">Age</th>
					</tr>
				</thead>
				<tbody>
					{players
						.sort((a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99))
						.map((player) => {
							const age = player.dateOfBirth
								? Math.floor(
										(Date.now() - new Date(player.dateOfBirth).getTime()) /
											(365.25 * 24 * 60 * 60 * 1000),
									)
								: null;

							return (
								<tr
									key={player.id}
									className="border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors"
								>
									<td className="p-3 text-muted-foreground font-medium tabular-nums">
										{player.shirtNumber ?? "-"}
									</td>
									<td className="p-3 font-medium">{player.name}</td>
									<td className="p-3 text-muted-foreground hidden sm:table-cell">
										{player.position ?? "-"}
									</td>
									<td className="p-3 text-muted-foreground hidden md:table-cell">
										{player.nationality ?? "-"}
									</td>
									<td className="p-3 text-muted-foreground hidden lg:table-cell tabular-nums">
										{age != null ? `${age}` : "-"}
									</td>
								</tr>
							);
						})}
				</tbody>
			</table>
		</div>
	);
}

async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const parsedId = parseInt(id, 10);
	const teamId = Number.isNaN(parsedId) ? 0 : parsedId;
	const team = await fetchFootballData<ApiTeamResponse>(`/teams/${teamId}`);

	const session = await auth();
	let following = false;
	if (team && session?.user?.id) {
		const favourite = await db.query.userFavourites.findFirst({
			where: and(
				eq(userFavourites.userId, session.user.id),
				eq(userFavourites.entityType, "team"),
				eq(userFavourites.entityId, teamId),
			),
		});
		following = !!favourite;
	}

	if (!team) {
		return (
			<div className="space-y-6">
				<Link
					href="/"
					className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					&larr; Back to fixtures
				</Link>
				<div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed bg-white dark:bg-zinc-900 dark:border-zinc-800">
					No team found
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			<Link
				href="/"
				className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				&larr; Back to fixtures
			</Link>

			<div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
				<div className="flex items-center gap-4 p-4 bg-zinc-100/50 dark:bg-zinc-800/40 border-b dark:border-zinc-800">
					<div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-zinc-200/60 dark:bg-zinc-800 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
						<Image
							src={team.crest}
							alt=""
							width={48}
							height={48}
							className="object-cover w-full h-full"
						/>
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<h1 className="font-bold text-lg md:text-xl truncate">
								{team.name}
							</h1>
							{team.tla && (
								<span className="text-xs uppercase font-bold text-muted-foreground shrink-0">
									{team.tla}
								</span>
							)}
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							{team.area && <span>{team.area.name}</span>}
							{team.shortName && team.shortName !== team.name && (
								<>
									<span className="text-muted-foreground/40">&middot;</span>
									<span>{team.shortName}</span>
								</>
							)}
						</div>
					</div>
					<div className="flex items-center gap-3 shrink-0">
						<FollowButton teamId={team.id} initiallyFollowing={following} />
						{team.founded && (
							<span className="text-xs text-muted-foreground shrink-0">
								Est. {team.founded}
							</span>
						)}
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-3">
					{team.venue && <InfoRow label="Stadium">{team.venue}</InfoRow>}
					{team.clubColors && (
						<InfoRow label="Colors">{team.clubColors}</InfoRow>
					)}
					{team.address && <InfoRow label="Address">{team.address}</InfoRow>}
					{team.website && (
						<InfoRow label="Website">
							<a
								href={`https://${team.website.replace(/^https?:\/\//, "")}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 dark:text-blue-400 hover:underline truncate block"
							>
								{team.website.replace(/^https?:\/\//, "")}
							</a>
						</InfoRow>
					)}
				</div>
			</div>

			{team.coach && (
				<div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
					<div className="flex items-center gap-3 p-4 bg-zinc-100/50 dark:bg-zinc-800/40 border-b dark:border-zinc-800">
						<h2 className="font-semibold text-base">Coach</h2>
					</div>
					<div className="p-4 space-y-2">
						<InfoRow label="Name">{team.coach.name}</InfoRow>
						{team.coach.nationality && (
							<InfoRow label="Nationality">{team.coach.nationality}</InfoRow>
						)}
						{team.coach.contract?.start && (
							<InfoRow label="Contract">
								{team.coach.contract.start}
								{team.coach.contract.until
									? ` \u2014 ${team.coach.contract.until}`
									: ""}
							</InfoRow>
						)}
					</div>
				</div>
			)}

			{team.runningCompetitions && team.runningCompetitions.length > 0 && (
				<div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
					<div className="flex items-center gap-3 p-4 bg-zinc-100/50 dark:bg-zinc-800/40 border-b dark:border-zinc-800">
						<h2 className="font-semibold text-base">Competitions</h2>
					</div>
					<div className="divide-y dark:divide-zinc-800">
						{team.runningCompetitions.map((comp) => (
							<Link
								key={comp.id}
								href={`/leagues/${comp.id}`}
								className="flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors"
							>
								{comp.emblem && (
									<div className="w-6 h-6 flex items-center justify-center shrink-0 bg-zinc-200/60 dark:bg-zinc-800 rounded-full overflow-hidden">
										<Image
											src={comp.emblem}
											alt=""
											width={24}
											height={24}
											className="w-6 h-6 object-contain"
										/>
									</div>
								)}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{comp.name}</p>
								</div>
								<span className="text-xs text-muted-foreground uppercase">
									{comp.type?.replace(/_/g, " ") ?? ""}
								</span>
							</Link>
						))}
					</div>
				</div>
			)}

			{team.squad && team.squad.length > 0 && (
				<div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
					<div className="flex items-center gap-3 p-4 bg-zinc-100/50 dark:bg-zinc-800/40 border-b dark:border-zinc-800">
						<h2 className="font-semibold text-base">Squad</h2>
						<span className="text-xs text-muted-foreground">
							{team.squad.length} players
						</span>
					</div>
					<SquadTable players={team.squad} />
				</div>
			)}
		</div>
	);
}

export default TeamDetailPage;
