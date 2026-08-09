"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const links = [
	{ href: "/", label: "Home" },
	{ href: "/leagues", label: "Leagues" },
	{ href: "/following", label: "Following", requiresAuth: true },
];

export default function Sidebar({
	open,
	onClose,
}: {
	open?: boolean;
	onClose?: () => void;
}) {
	const pathname = usePathname();
	const { status } = useSession();
	const isSignedIn = status === "authenticated";

	return (
		<>
			{open && (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-black/50 md:hidden cursor-default"
					onClick={onClose}
					aria-label="Close navigation menu"
				/>
			)}
			<aside
				className={cn(
					"fixed md:static inset-y-0 left-0 z-50 w-64 border-r bg-muted/30 flex flex-col h-full md:h-auto md:min-h-0 shrink-0 transition-transform duration-200 md:transition-none",
					open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
				)}
			>
				<nav className="flex-1 px-4 py-6 space-y-1 pt-20 md:pt-6">
					{links
						.filter((link) => !link.requiresAuth || isSignedIn)
						.map((link) => {
							const isActive =
								link.href === "/"
									? pathname === "/"
									: pathname.startsWith(link.href);

							return (
								<Link
									key={link.href}
									href={link.href}
									onClick={onClose}
									className={cn(
										"block p-2 rounded-md text-sm font-medium transition-colors",
										isActive
											? "bg-accent text-accent-foreground"
											: "hover:bg-accent/50",
									)}
								>
									{link.label}
								</Link>
							);
						})}
				</nav>
			</aside>
		</>
	);
}
