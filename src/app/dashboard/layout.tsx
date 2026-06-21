import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}

	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<div className="relative flex flex-1 flex-col w-full overflow-y-auto overflow-x-hidden">
				<Navbar user={session.user} />
				<main className="w-full">
					<div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
