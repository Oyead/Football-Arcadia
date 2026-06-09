"use client";
import DOMPurify from "dompurify";
import { SearchIcon } from "lucide-react";
import Image from "next/image";
import type { User } from "next-auth";
import { useState } from "react";
export default function Navbar({ user }: { user?: User }) {
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawInput = e.target.value;

		if (typeof window !== "undefined") {
			const cleanInput = DOMPurify.sanitize(rawInput);
			setSearchQuery(cleanInput);
		} else {
			setSearchQuery(rawInput);
		}
	};
	return (
		<nav className="grid grid-cols-[1fr_2fr_1fr] w-full h-16 items-center border-b px-6 bg-background">
			<div className="font-bold text-xl justify-self-start">Dashboard</div>

			<div className="relative w-full min-w-[400px] max-w-xl shrink-0 justify-self-center mx-4">
				<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
				<input
					type="text"
					value={searchQuery}
					onChange={handleSearchChange}
					placeholder="Search..."
					className="w-full h-10 pl-10 pr-4 rounded-full bg-primary/10 border outline-none text-sm focus:ring-2 focus:ring-primary/20"
				/>
			</div>

			<div className="flex items-center gap-4 justify-self-end">
				<span>{user?.name}</span>
				<div className="relative h-10 w-10 rounded-full bg-primary/10 border">
					<Image
						src={user?.image || ""}
						alt={user?.name || ""}
						fill
						className="rounded-full cursor-pointer object-cover"
					/>
				</div>
			</div>
		</nav>
	);
}
