import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Explicitly load the .env.local file
dotenv.config({ path: ".env.local" });

export default defineConfig({
	schema: "./src/server/db/schema.ts",
	out: "./src/server/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
