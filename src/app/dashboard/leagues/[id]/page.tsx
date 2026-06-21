import Image from "next/image";
import { notFound } from "next/navigation";
import { FootballRepository } from "@/server/repositories/football.repository";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function LeagueDetailPage({ params }: PageProps) {
	const { id } = await params;
	const leagueId = parseInt(id, 10);

	// Use your clean repository function
	const league = await FootballRepository.getLeague(leagueId);

	if (!league) {
		notFound(); // Triggers Next.js 404 UI natively if ID doesn't exist
	}

	return (
		<main className="p-6">
			<div className="flex items-center gap-4">
				{league.logoUrl && (
					<Image
						src={league.logoUrl}
						alt={league.name}
						width={64}
						height={64}
					/>
				)}
				<div>
					<h1 className="text-2xl font-bold">{league.name}</h1>
					<p className="text-muted-foreground">{league.country}</p>
				</div>
			</div>
		</main>
	);
}
