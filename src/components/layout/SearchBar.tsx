"use client";

import DOMPurify from "dompurify";
import { Loader2, SearchIcon, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SearchLeague {
	id: number;
	name: string;
	emblem: string;
	area: string | null;
}

interface SearchTeam {
	id: number;
	name: string;
	crest: string;
}

interface SearchResults {
	leagues: SearchLeague[];
	teams: SearchTeam[];
}

export default function SearchBar({ className }: { className?: string }) {
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement>(null);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResults>({
		leagues: [],
		teams: [],
	});
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [mobileExpanded, setMobileExpanded] = useState(false);

	const hasResults = results.leagues.length > 0 || results.teams.length > 0;
	const showDropdown = isOpen && query.length >= 2;

	const close = useCallback(() => {
		setIsOpen(false);
		setMobileExpanded(false);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				close();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [close]);

	useEffect(() => {
		if (query.length < 2) {
			setResults({ leagues: [], teams: [] });
			setIsLoading(false);
			return;
		}

		const controller = new AbortController();
		const timer = setTimeout(async () => {
			setIsLoading(true);
			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
					signal: controller.signal,
				});
				if (!res.ok) return;
				const data = (await res.json()) as SearchResults;
				setResults(data);
				setIsOpen(true);
			} catch (error) {
				if (error instanceof Error && error.name !== "AbortError") {
					setResults({ leagues: [], teams: [] });
				}
			} finally {
				setIsLoading(false);
			}
		}, 300);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [query]);

	const handleChange = (value: string) => {
		const clean =
			typeof window !== "undefined" ? DOMPurify.sanitize(value) : value;
		setQuery(clean);
		setIsOpen(true);
	};

	const navigate = (href: string) => {
		close();
		setQuery("");
		setResults({ leagues: [], teams: [] });
		router.push(href);
	};

	const input = (
		<div className="relative w-full">
			<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
			<input
				type="search"
				value={query}
				onChange={(e) => handleChange(e.target.value)}
				onFocus={() => query.length >= 2 && setIsOpen(true)}
				placeholder="Search leagues & teams..."
				className="w-full h-10 sm:h-12 pl-11 pr-11 rounded-full border outline-none text-base bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-white focus:ring-2 focus:ring-ring"
				aria-label="Search leagues and teams"
			/>
			{query && (
				<button
					type="button"
					onClick={() => {
						setQuery("");
						setResults({ leagues: [], teams: [] });
						setIsOpen(false);
					}}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					aria-label="Clear search"
				>
					<X className="w-5 h-5" />
				</button>
			)}
		</div>
	);

	const dropdown = showDropdown && (
		<div
			id="search-results"
			className="absolute top-full left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-lg"
		>
			{isLoading ? (
				<div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
					<Loader2 className="w-4 h-4 animate-spin" />
					Searching...
				</div>
			) : hasResults ? (
				<div className="p-2">
					{results.leagues.length > 0 && (
						<div className="mb-2">
							<p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Leagues
							</p>
							{results.leagues.map((league) => (
								<button
									key={league.id}
									type="button"
									onClick={() => navigate(`/leagues/${league.id}`)}
									className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
								>
									{league.emblem ? (
										<Image
											src={league.emblem}
											alt=""
											width={24}
											height={24}
											className="object-contain shrink-0"
										/>
									) : (
										<div className="w-6 h-6 shrink-0" />
									)}
									<div className="min-w-0">
										<p className="font-medium truncate">{league.name}</p>
										{league.area && (
											<p className="text-xs text-muted-foreground truncate">
												{league.area}
											</p>
										)}
									</div>
								</button>
							))}
						</div>
					)}
					{results.teams.length > 0 && (
						<div>
							<p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Teams
							</p>
							{results.teams.map((team) => (
								<button
									key={team.id}
									type="button"
									onClick={() => navigate(`/teams/${team.id}`)}
									className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
								>
									{team.crest ? (
										<Image
											src={team.crest}
											alt=""
											width={24}
											height={24}
											className="object-contain shrink-0"
										/>
									) : (
										<div className="w-6 h-6 shrink-0" />
									)}
									<p className="font-medium truncate">{team.name}</p>
								</button>
							))}
						</div>
					)}
				</div>
			) : (
				<p className="p-4 text-sm text-center text-muted-foreground">
					No leagues or teams found.
				</p>
			)}
		</div>
	);

	return (
		<div ref={containerRef} className={cn("relative w-full", className)}>
			<div className="hidden sm:block">
				{input}
				{dropdown}
			</div>

			<div className="sm:hidden">
				{mobileExpanded ? (
					<div className="fixed inset-x-0 top-0 z-50 bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 p-3 shadow-md">
						<div className="flex items-center gap-2">
							<div className="flex-1 min-w-0">{input}</div>
							<button
								type="button"
								onClick={close}
								className="shrink-0 p-2 text-muted-foreground"
								aria-label="Close search"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						{dropdown}
					</div>
				) : (
					<button
						type="button"
						onClick={() => setMobileExpanded(true)}
						className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground"
						aria-label="Open search"
					>
						<SearchIcon className="w-5 h-5" />
					</button>
				)}
			</div>
		</div>
	);
}
