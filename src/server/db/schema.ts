import { relations } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	numeric,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters"; // Add this to your imports at the top

// --- USERS & AUTH ---
export const users = pgTable("users", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	name: text("name"),
	image: text("image"),
	emailVerified: timestamp("email_verified", { mode: "date" }), // ADD THIS LINE
	pushSubscription: jsonb("push_subscription"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userFavourites = pgTable(
	"user_favourites",
	{
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		entityType: text("entity_type").notNull(), // 'team' | 'league' | 'player'
		entityId: integer("entity_id").notNull(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.entityType, t.entityId] }),
	}),
);

// --- LEAGUES ---
export const leagues = pgTable("leagues", {
	id: integer("id").primaryKey(), // API-Football league ID
	name: text("name").notNull(),
	country: text("country"),
	logoUrl: text("logo_url"),
	season: integer("season"),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// --- TEAMS ---
export const teams = pgTable("teams", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	shortName: text("short_name"), // e.g., "MCI"
	badgeUrl: text("badge_url"),
	leagueId: integer("league_id").references(() => leagues.id),
	venueName: text("venue_name"),
	founded: integer("founded"),
});

// --- PLAYERS ---
export const players = pgTable("players", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	nationality: text("nationality"),
	position: text("position"), // GK / DEF / MID / FWD
	teamId: integer("team_id").references(() => teams.id, {
		onDelete: "set null",
	}),
	photoUrl: text("photo_url"),
	marketValue: numeric("market_value", { precision: 12, scale: 2 }),
});

// --- MATCHES ---
export const matches = pgTable("matches", {
	id: integer("id").primaryKey(),
	leagueId: integer("league_id").references(() => leagues.id),
	homeTeamId: integer("home_team_id").references(() => teams.id),
	awayTeamId: integer("away_team_id").references(() => teams.id),
	kickoffAt: timestamp("kickoff_at").notNull(),
	status: text("status").default("NS"), // NS, 1H, HT, 2H, FT, etc.
	homeScore: integer("home_score").default(0),
	awayScore: integer("away_score").default(0),
	minute: integer("minute"),
	venue: text("venue"),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// --- MATCH EVENTS ---
export const matchEvents = pgTable("match_events", {
	id: serial("id").primaryKey(),
	matchId: integer("match_id").references(() => matches.id, {
		onDelete: "cascade",
	}),
	type: text("type").notNull(), // Goal, Card, Sub, VAR
	minute: integer("minute").notNull(),
	playerId: integer("player_id").references(() => players.id),
	teamId: integer("team_id").references(() => teams.id),
	detail: text("detail"), // e.g., "Yellow Card", "Normal Goal"
});

// --- STANDINGS ---
export const standings = pgTable(
	"standings",
	{
		id: serial("id").primaryKey(),
		leagueId: integer("league_id").references(() => leagues.id),
		teamId: integer("team_id").references(() => teams.id),
		rank: integer("rank").notNull(),
		played: integer("played").default(0),
		won: integer("won").default(0),
		drawn: integer("drawn").default(0),
		lost: integer("lost").default(0),
		goalsFor: integer("goals_for").default(0),
		goalsAgainst: integer("goals_against").default(0),
		points: integer("points").default(0),
		form: text("form"), // e.g., "WWDLW"
	},
	(t) => ({
		leagueIdx: index("league_idx").on(t.leagueId),
	}),
);

// --- RELATIONS ---
export const matchRelations = relations(matches, ({ one }) => ({
	homeTeam: one(teams, {
		fields: [matches.homeTeamId],
		references: [teams.id],
		relationName: "homeTeam",
	}),
	awayTeam: one(teams, {
		fields: [matches.awayTeamId],
		references: [teams.id],
		relationName: "awayTeam",
	}),
	league: one(leagues, {
		fields: [matches.leagueId],
		references: [leagues.id],
	}),
}));

export const teamRelations = relations(teams, ({ many, one }) => ({
	players: many(players),
	league: one(leagues, { fields: [teams.leagueId], references: [leagues.id] }),
}));
export const accounts = pgTable(
	"account",
	{
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").$type<AdapterAccount["type"]>().notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("providerAccountId").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state"),
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
	}),
);

export const sessions = pgTable("session", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
	"verificationToken",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(vt) => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
	}),
);
export const apiCache = pgTable("api_cache", {
	key: text("key").primaryKey(), // e.g., 'leagues_v3' or 'fixtures_live'
	data: jsonb("data").notNull(), // Stores the raw JSON response
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
