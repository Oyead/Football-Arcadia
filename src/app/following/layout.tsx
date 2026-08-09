import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { auth } from "@/lib/auth";

export default async function FollowingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}

	return <AppShell user={session.user}>{children}</AppShell>;
}
