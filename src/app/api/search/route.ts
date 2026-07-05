import { NextResponse } from "next/server";
import { fetchFootballData } from "@/server/services/football-api";

interface ApiArea {
	name: string;
}

interface ApiCompetition {
	id: number;
	name: string;
	emblem: string;
	area?: ApiArea;
}

interface ApiCompetitionsResponse {
	competitions: ApiCompetition[];
}

interface ApiTeam {
	id: number;
	name: string;
	crest: string;
}

interface ApiTeamsResponse {
	teams: ApiTeam[];
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q")?.trim() ?? "";

	if (query.length < 2) {
		return NextResponse.json({ leagues: [], teams: [] });
	}

	const normalized = query.toLowerCase();

	const [teamsData, competitionsData] = await Promise.all([
		fetchFootballData<ApiTeamsResponse>("/teams", { name: query }, 3600),
		fetchFootballData<ApiCompetitionsResponse>("/competitions", {}, 86400),
	]);

	const teams = (teamsData?.teams ?? []).slice(0, 8).map((team) => ({
		id: team.id,
		name: team.name,
		crest: team.crest,
	}));

	const leagues = (competitionsData?.competitions ?? [])
		.filter(
			(league) =>
				league.name.toLowerCase().includes(normalized) ||
				league.area?.name?.toLowerCase().includes(normalized),
		)
		.slice(0, 8)
		.map((league) => ({
			id: league.id,
			name: league.name,
			emblem: league.emblem,
			area: league.area?.name ?? null,
		}));

	return NextResponse.json({ leagues, teams });
}
