import Link from "next/link";

export default function Sidebar() {
	return (
		<aside className="w-64 border-r bg-muted/30 hidden md:flex flex-col h-screen">
			<div className="p-6 font-bold text-primary">Football Arcadia</div>

			<nav className="flex-1 px-4 space-y-2">
				<Link href="/dashboard" className="block p-2 hover:bg-accent rounded">
					Home
				</Link>
				<Link
					href="/dashboard/leagues"
					className="block p-2 hover:bg-accent rounded"
				>
					Leagues
				</Link>
				<Link
					href="/dashboard/matches"
					className="block p-2 hover:bg-accent rounded"
				>
					Matches
				</Link>
			</nav>
		</aside>
	);
}
