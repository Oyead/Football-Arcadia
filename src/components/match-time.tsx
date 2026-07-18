"use client";

import { useMemo } from "react";

export function MatchTime({ utcDate }: { utcDate: string }) {
	const time = useMemo(() => {
		if (!utcDate) return "00:00";
		return new Date(utcDate).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	}, [utcDate]);

	return <>{time}</>;
}
