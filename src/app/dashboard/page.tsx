import { auth } from "@/lib/auth";

export default async function DashboardPage() {
	const session = await auth();

	return (
		<div className="space-y-6">
			<header>
				<h1 className="text-3xl font-bold">Welcome, {session?.user?.name}!</h1>
				<p className="text-muted-foreground">
					Here is what&apos;s happening today in your favorite leagues.
				</p>
			</header>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{/* Placeholder cards for Favourites, Live Scores, etc. */}
				<div className="rounded-xl border bg-card p-6 shadow-sm">
					<h3 className="font-semibold text-sm">Followed Teams</h3>
					<p className="text-2xl font-bold">12</p>
				</div>
			</div>
		</div>
	);
}
