import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema"; // 1. Import your schema

// We use the neon-http driver for better performance on Vercel
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
