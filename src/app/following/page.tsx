import { FollowedTeams } from "@/components/FollowedTeams";
import { auth } from "@/lib/auth";

export default async function FollowingPage() {
	const session = await auth();
	const userId = session?.user?.id ?? "";

	return (
		<div className="space-y-6">
			<header className="border-b pb-4 dark:border-zinc-800">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
					Following
				</h1>
				<p className="text-sm text-muted-foreground mt-1">Teams you follow</p>
			</header>

			<FollowedTeams userId={userId} />
		</div>
	);
}
