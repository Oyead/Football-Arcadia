import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/server/db";
import {
	accounts,
	sessions,
	users,
	verificationTokens,
} from "@/server/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
	// @ts-expect-error - Mismatched drizzle-orm versions between Auth.js adapter and local dependencies
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens,
	}),
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
		}),
	],
	callbacks: {
		async session({ session, user }) {
			if (session.user) {
				session.user.id = user.id;
			}
			return session;
		},
	},
});
