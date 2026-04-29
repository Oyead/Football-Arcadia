CREATE TABLE "leagues" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text,
	"logo_url" text,
	"season" integer,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "match_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer,
	"type" text NOT NULL,
	"minute" integer NOT NULL,
	"player_id" integer,
	"team_id" integer,
	"detail" text
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" integer PRIMARY KEY NOT NULL,
	"league_id" integer,
	"home_team_id" integer,
	"away_team_id" integer,
	"kickoff_at" timestamp NOT NULL,
	"status" text DEFAULT 'NS',
	"home_score" integer DEFAULT 0,
	"away_score" integer DEFAULT 0,
	"minute" integer,
	"venue" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nationality" text,
	"position" text,
	"team_id" integer,
	"photo_url" text,
	"market_value" numeric(12, 2)
);
--> statement-breakpoint
CREATE TABLE "standings" (
	"id" serial PRIMARY KEY NOT NULL,
	"league_id" integer,
	"team_id" integer,
	"rank" integer NOT NULL,
	"played" integer DEFAULT 0,
	"won" integer DEFAULT 0,
	"drawn" integer DEFAULT 0,
	"lost" integer DEFAULT 0,
	"goals_for" integer DEFAULT 0,
	"goals_against" integer DEFAULT 0,
	"points" integer DEFAULT 0,
	"form" text
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"badge_url" text,
	"league_id" integer,
	"venue_name" text,
	"founded" integer
);
--> statement-breakpoint
CREATE TABLE "user_favourites" (
	"user_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	CONSTRAINT "user_favourites_user_id_entity_type_entity_id_pk" PRIMARY KEY("user_id","entity_type","entity_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image" text,
	"push_subscription" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standings" ADD CONSTRAINT "standings_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standings" ADD CONSTRAINT "standings_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favourites" ADD CONSTRAINT "user_favourites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "league_idx" ON "standings" USING btree ("league_id");