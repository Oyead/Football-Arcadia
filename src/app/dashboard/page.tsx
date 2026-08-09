import { FollowedTeams } from "@/components/FollowedTeams";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
	const session = await auth();

	return (
		<div className="space-y-6">
			<header>
				<h1 className="text-2xl sm:text-3xl font-bold">
					Welcome, {session?.user?.name}!
				</h1>
				<p className="text-muted-foreground">
					Here are the teams you&apos;re following.
				</p>
			</header>

			{session?.user?.id ? <FollowedTeams userId={session.user.id} /> : null}
		</div>
	);
}
