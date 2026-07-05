import Image from "next/image";
import Link from "next/link";
import { fetchFootballData } from "@/server/services/football-api";

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
	area?: ApiArea;
}

interface ApiCompetitionsResponse {
	count: number;
	filters: Record<string, unknown>;
	competitions: ApiCompetition[];
}

export default async function LeaguesPage() {
	const data =
		await fetchFootballData<ApiCompetitionsResponse>("/competitions");
	const leagues = data?.competitions ?? [];

	return (
		<div className="space-y-6">
			<header className="border-b pb-4 dark:border-zinc-800">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
					Leagues
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{leagues.length} competitions available
				</p>
			</header>

			{leagues.length === 0 ? (
				<div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed bg-white dark:bg-zinc-900 dark:border-zinc-800">
					No competitions available.
				</div>
			) : (
				<div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
					{leagues.map((league) => (
						<Link
							key={league.id}
							href={`/dashboard/leagues/${league.id}`}
							className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-sm p-4 flex flex-col items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
						>
							<div className="w-14 h-14 flex items-center justify-center shrink-0">
								{league.emblem ? (
									<Image
										src={league.emblem}
										alt=""
										width={48}
										height={48}
										className="object-contain"
									/>
								) : (
									<span className="text-xs font-bold text-muted-foreground uppercase">
										{league.code ?? league.name.slice(0, 3)}
									</span>
								)}
							</div>
							<div className="text-center min-w-0">
								<p className="text-sm font-semibold truncate">{league.name}</p>
								{league.area?.name && (
									<p className="text-xs text-muted-foreground truncate">
										{league.area.name}
									</p>
								)}
							</div>
							{league.type && (
								<span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
									{league.type.replace(/_/g, " ")}
								</span>
							)}
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
