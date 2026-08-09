import { fetchFootballData } from "@server/services/football-api";
import { and, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { userFavourites } from "@/server/db/schema";

interface ApiTeam {
	id: number;
	name: string;
	crest: string;
}

interface FollowedTeam {
	id: number;
	name: string;
	crest: string;
}

export default async function DashboardPage() {
	const session = await auth();
	const userId = session?.user?.id ?? "";

	const favourites = await db.query.userFavourites.findMany({
		where: and(
			eq(userFavourites.userId, userId),
			eq(userFavourites.entityType, "team"),
		),
	});

	const teams = await Promise.all(
		favourites.map(async (favourite) => {
			const team = await fetchFootballData<ApiTeam>(
				`/teams/${favourite.entityId}`,
			);
			return team ? { id: team.id, name: team.name, crest: team.crest } : null;
		}),
	);

	const followedTeams: FollowedTeam[] = teams.filter(
		(team): team is FollowedTeam => team !== null,
	);

	return (
		<div className="space-y-6">
			<header>
				<h1 className="text-2xl sm:text-3xl font-bold">
					Welcome, {session?.user?.name}!
				</h1>
				<p className="text-muted-foreground">
					Here are the teams you&apos;re following.
				</p>
			</header>

			{followedTeams.length === 0 ? (
				<div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed bg-white dark:bg-zinc-900 dark:border-zinc-800">
					<p className="font-medium text-foreground">No followed teams yet</p>
					<p className="text-sm mt-1">
						Browse{" "}
						<Link
							href="/leagues"
							className="text-blue-600 dark:text-blue-400 underline"
						>
							leagues
						</Link>{" "}
						or search for a team to follow.
					</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{followedTeams.map((team) => (
						<Link
							key={team.id}
							href={`/teams/${team.id}`}
							className="rounded-xl border bg-card p-6 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors"
						>
							<div className="w-12 h-12 flex items-center justify-center shrink-0 mb-3">
								{team.crest ? (
									<Image
										src={team.crest}
										alt=""
										width={48}
										height={48}
										className="object-contain"
									/>
								) : (
									<span className="text-xs font-bold text-muted-foreground uppercase">
										{team.name.slice(0, 3)}
									</span>
								)}
							</div>
							<h3 className="font-semibold text-sm truncate">{team.name}</h3>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
