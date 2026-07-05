"use client";

import { Menu, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import SearchBar from "./SearchBar";

export default function Navbar({
	user: propUser,
	onMenuToggle,
}: {
	user?: { name?: string | null; image?: string | null };
	onMenuToggle?: () => void;
}) {
	const [isDivVisible, setIsDivVisible] = useState(false);
	const [mounted, setMounted] = useState(false);
	const { data: session, status } = useSession();
	const user = propUser ?? session?.user;
	const isAuthenticated = !!user && (status === "authenticated" || !!propUser);
	const isLoading = status === "loading" && !propUser;
	const { theme, setTheme } = useTheme();
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/" });
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsDivVisible(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<nav className="sticky top-0 z-30 flex w-full h-14 sm:h-16 items-center justify-between border-b px-4 sm:px-8 bg-white dark:bg-zinc-950 dark:border-zinc-800 transition-colors duration-200">
			<div className="flex items-center gap-2 sm:gap-4 shrink-0">
				<button
					type="button"
					onClick={onMenuToggle}
					className="md:hidden p-2 -ml-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer shrink-0"
					aria-label="Open navigation menu"
				>
					<Menu className="w-5 h-5" />
				</button>

				<Link href="/" className="shrink-0 p-1 sm:p-2 cursor-pointer">
					<div className="font-bold text-base sm:text-xl dark:text-white whitespace-nowrap">
						Football Arcadia
					</div>
				</Link>
			</div>

			<div className="flex-1 max-w-2xl mx-4 hidden sm:block">
				<SearchBar />
			</div>

			<div
				ref={menuRef}
				className="relative flex items-center gap-1 sm:gap-4 shrink-0"
			>
				<button
					type="button"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 cursor-pointer"
					aria-label="Toggle theme"
				>
					{mounted &&
						(theme === "dark" ? (
							<Sun className="w-5 h-5 text-yellow-500" />
						) : (
							<Moon className="w-5 h-5 text-indigo-600" />
						))}
				</button>

				{isAuthenticated ? (
					<>
						<button
							type="button"
							onClick={() => setIsDivVisible(!isDivVisible)}
							className="flex items-center gap-2 sm:gap-4 focus:outline-none dark:text-white cursor-pointer"
						>
							<span className="hidden sm:inline text-sm truncate max-w-[120px]">
								Hello!, {user.name}
							</span>
							<div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
								{user.image ? (
									<Image
										src={user.image}
										alt={user.name || "User profile"}
										fill
										className="rounded-full cursor-pointer object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-xs font-bold uppercase">
										{user.name?.slice(0, 2) || "U"}
									</div>
								)}
							</div>
						</button>

						{isDivVisible && (
							<div className="absolute right-0 top-12 z-50 w-48 rounded-md shadow-lg p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
								<Button
									className="w-full cursor-pointer"
									variant="destructive"
									onClick={handleSignOut}
								>
									Log Out
								</Button>
							</div>
						)}
					</>
				) : isLoading ? (
					<div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-600 animate-spin" />
				) : (
					<Link href="/login">
						<Button
							variant="outline"
							size="sm"
							className="cursor-pointer text-xs sm:text-sm"
						>
							Sign In
						</Button>
					</Link>
				)}
			</div>
		</nav>
	);
}
