import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function HomePage() {
	const session = await auth();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6">
			<div className="max-w-2xl text-center space-y-6">
				<h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl">
					Football <span className="text-primary">Arcadia</span>
				</h1>
				<p className="text-xl text-muted-foreground">
					Real-time scores, deep stats, and personalized football feeds.
				</p>

				<div className="flex gap-4 justify-center">
					{session ? (
						<Button asChild size="lg">
							<Link href="/dashboard">Enter Dashboard</Link>
						</Button>
					) : (
						<>
							<Button asChild size="lg">
								<Link href="/login">Sign In to Start</Link>
							</Button>
							<Button variant="outline" size="lg" asChild>
								<Link href="/leagues">Browse Leagues</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
