"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppShell({
	children,
	user,
}: {
	children: React.ReactNode;
	user?: { name?: string | null; image?: string | null };
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors flex flex-col">
			<Navbar
				user={user}
				onMenuToggle={() => setSidebarOpen((open) => !open)}
			/>
			<div className="flex flex-1 min-h-0">
				<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
				<main className="flex-1 overflow-y-auto overflow-x-hidden w-full min-w-0">
					<div className="mx-auto max-w-screen-2xl p-4 sm:p-6 2xl:p-10">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
