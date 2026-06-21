"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";
export function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<NextThemesProvider
				attribute="class"
				defaultTheme="dark"
				enableSystem={false}
				disableTransitionOnChange
			>
				{children}
			</NextThemesProvider>
		</SessionProvider>
	);
}
