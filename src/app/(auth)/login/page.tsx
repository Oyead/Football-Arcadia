import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-muted/50">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Welcome back, Legend
					</h1>
					<p className="text-sm text-muted-foreground">
						Sign in to track your favorite teams and leagues.
					</p>
				</div>

				<form
					action={async () => {
						"use server";
						await signIn("google", { redirectTo: "/dashboard" });
					}}
				>
					<Button className="w-full" type="submit" variant="outline">
						{/* You can add a Google Icon SVG here */}
						Continue with Google
					</Button>
				</form>

				<p className="px-8 text-center text-sm text-muted-foreground">
					By clicking continue, you agree to our Terms of Service.
				</p>
			</div>
		</div>
	);
}
