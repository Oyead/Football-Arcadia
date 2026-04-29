import type { User } from "next-auth";

export default function Navbar({ user }: { user?: User }) {
	return (
		<nav className="flex h-16 items-center justify-between border-b px-6 bg-background">
			<div className="font-bold text-xl">Dashboard</div>
			<div className="flex items-center gap-4">
				<span>{user?.name}</span>
				<div className="h-8 w-8 rounded-full bg-primary/10 border" />
			</div>
		</nav>
	);
}
