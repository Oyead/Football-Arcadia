import { fetchFootballData } from "@server/services/football-api";
import type { PageProps } from "next/types";

interface ApiMatch {
	id: number;
	status: string;
	utcDate: string;
	competition: ApiCompetition;
	homeTeam: ApiTeam;
	awayTeam: ApiTeam;
	score: ApiScore;
}
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
	fullTime: { home: number | null; away: number | null };
}
async function MatchesDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const matchId = parseInt(id, 10);
	const matchRes = await fetchFootballData<ApiMatch>(`/matches/${matchId}`);
	if (!matchRes) {
		return <div>No match found</div>;
	}
	const match = matchRes;
	return (
		<div>
			page
			<h1>{match.competition.name}</h1>
			<h2>
				{match.homeTeam.name} vs {match.awayTeam.name}
			</h2>
			<p>{match.utcDate}</p>
			<p>
				{match.score.fullTime.home} - {match.score.fullTime.away}
			</p>
		</div>
	);
}

export default MatchesDetailPage;
