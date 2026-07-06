import AppShell from "@/components/layout/AppShell";

export default function LeaguesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AppShell>{children}</AppShell>;
}
