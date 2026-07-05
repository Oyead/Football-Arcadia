export type LeaguePriorityInfo = {
	id: number;
	name: string;
	country: string;
	logo: string;
	priority: number;
};

export const LEAGUE_PRIORITIES: LeaguePriorityInfo[] = [
	{
		id: 2001,
		name: "UEFA Champions League",
		country: "Europe",
		logo: "https://crests.football-data.org/CL.png",
		priority: 1,
	},
	{
		id: 2021,
		name: "Premier League",
		country: "England",
		logo: "https://crests.football-data.org/PL.png",
		priority: 2,
	},
	{
		id: 2014,
		name: "Primera Division",
		country: "Spain",
		logo: "https://crests.football-data.org/PD.png",
		priority: 3,
	},
	{
		id: 2002,
		name: "Bundesliga",
		country: "Germany",
		logo: "https://crests.football-data.org/BL1.png",
		priority: 4,
	},
	{
		id: 2019,
		name: "Serie A",
		country: "Italy",
		logo: "https://crests.football-data.org/SA.png",
		priority: 5,
	},
	{
		id: 2015,
		name: "Ligue 1",
		country: "France",
		logo: "https://crests.football-data.org/FL1.png",
		priority: 6,
	},
	{
		id: 2017,
		name: "Primeira Liga",
		country: "Portugal",
		logo: "https://crests.football-data.org/PPL.png",
		priority: 7,
	},
	{
		id: 2000,
		name: "FIFA World Cup",
		country: "World",
		logo: "https://crests.football-data.org/wm26.png",
		priority: 8,
	},
	{
		id: 2018,
		name: "European Championship",
		country: "Europe",
		logo: "https://crests.football-data.org/EC.png",
		priority: 9,
	},
];
