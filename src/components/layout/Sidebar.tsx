import Link from "next/link";

export default function Sidebar() {
	return (
		<aside className="w-64 border-r bg-muted/30 hidden md:flex flex-col h-screen">
			<nav className="flex-1 px-4 py-6 space-y-2">
				<Link href="/" className="block p-2 hover:bg-accent rounded">
					Home
				</Link>
				<Link
					href="/dashboard/leagues"
					className="block p-2 hover:bg-accent rounded"
				>
					Leagues
				</Link>
			</nav>
		</aside>
	);
}
