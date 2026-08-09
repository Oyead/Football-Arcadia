"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FollowButton({
	teamId,
	initiallyFollowing,
}: {
	teamId: number;
	initiallyFollowing: boolean;
}) {
	const { status } = useSession();
	const [following, setFollowing] = useState(initiallyFollowing);
	const [loading, setLoading] = useState(false);

	if (status !== "authenticated") {
		return null;
	}

	const toggle = async () => {
		setLoading(true);
		try {
			const res = await fetch(
				following
					? `/api/favourites?entityType=team&entityId=${teamId}`
					: "/api/favourites",
				{
					method: following ? "DELETE" : "POST",
					headers: { "Content-Type": "application/json" },
					body: following
						? undefined
						: JSON.stringify({ entityType: "team", entityId: teamId }),
				},
			);
			if (res.ok) {
				setFollowing((prev) => !prev);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			variant={following ? "secondary" : "default"}
			size="sm"
			onClick={toggle}
			disabled={loading}
			className="shrink-0"
		>
			{loading ? "..." : following ? "Following" : "Follow"}
		</Button>
	);
}
