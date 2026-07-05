"use client";

import DOMPurify from "dompurify";
import { Moon, SearchIcon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
export default function Navbar() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isDivVisible, setIsDivVisible] = useState(false);
	const [mounted, setMounted] = useState(false);
	const { data: session, status } = useSession();
	const { theme, setTheme } = useTheme();
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawInput = e.target.value;
		if (typeof window !== "undefined") {
			const cleanInput = DOMPurify.sanitize(rawInput);
			setSearchQuery(cleanInput);
		} else {
			setSearchQuery(rawInput);
		}
	};

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
	const user = session?.user;
	return (
		<nav className="grid grid-cols-[1fr_2fr_1fr] w-full h-16 items-center border-b px-6 bg-white dark:bg-zinc-950 dark:border-zinc-800 transition-colors duration-200">
			<Link href="/" className="block p-2 cursor-pointer">
				<div className="font-bold text-xl justify-self-start dark:text-white">
					Football Arcadia
				</div>
			</Link>

			<div className="relative w-full min-w-[400px] max-w-xl shrink-0 justify-self-center mx-4">
				<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
				<input
					type="text"
					value={searchQuery}
					onChange={handleSearchChange}
					placeholder="Search..."
					className="w-full h-10 pl-10 pr-4 rounded-full border outline-none text-sm bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
				/>
			</div>

			<div
				ref={menuRef}
				className="justify-self-end relative flex items-center gap-4"
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

				{status === "authenticated" && user ? (
					<>
						<button
							type="button"
							onClick={() => setIsDivVisible(!isDivVisible)}
							className="flex items-center gap-4 focus:outline-none dark:text-white cursor-pointer"
						>
							<span>{user.name}</span>
							<div className="relative h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
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
				) : status === "loading" ? (
					<div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-600 animate-spin" />
				) : (
					<Button
						variant="outline"
						onClick={() =>
							(window.location.href = "/api/auth/signin?callbackUrl=/")
						}
						className="cursor-pointer"
					>
						Sign In
					</Button>
				)}
			</div>
		</nav>
	);
}
