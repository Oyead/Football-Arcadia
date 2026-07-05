"use client";

import { ErrorMessage, Field, Form, Formik } from "formik";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";

const loginSchema = Yup.object().shape({
	email: Yup.string().email("Invalid email").required("Required"),
	password: Yup.string().required("Required"),
});

export default function LoginPage() {
	const [googleLoading, setGoogleLoading] = useState(false);
	const [error, setError] = useState("");

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 px-4">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Welcome back
					</h1>
					<p className="text-sm text-muted-foreground">
						Sign in to track your favorite teams and leagues.
					</p>
				</div>

				<Formik
					initialValues={{ email: "", password: "" }}
					validationSchema={loginSchema}
					onSubmit={async (values, { setSubmitting }) => {
						setError("");
						const result = await signIn("credentials", {
							email: values.email,
							password: values.password,
							redirect: false,
							callbackUrl: "/",
						});
						if (result?.error) {
							setError("Invalid email or password");
							setSubmitting(false);
						} else if (result?.ok) {
							window.location.href = "/";
						}
					}}
				>
					{({ isSubmitting }) => (
						<Form className="space-y-4">
							<div>
								<Field
									name="email"
									type="email"
									placeholder="Email"
									className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
								/>
								<ErrorMessage
									name="email"
									component="p"
									className="text-xs text-red-500 mt-1"
								/>
							</div>
							<div>
								<Field
									name="password"
									type="password"
									placeholder="Password"
									className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
								/>
								<ErrorMessage
									name="password"
									component="p"
									className="text-xs text-red-500 mt-1"
								/>
							</div>

							{error && (
								<p className="text-sm text-red-500 text-center">{error}</p>
							)}

							<Button
								type="submit"
								className="w-full cursor-pointer"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<div className="w-4 h-4 rounded-full border-2 border-zinc-300 border-t-white animate-spin mr-2" />
								) : null}
								Sign in with Email
							</Button>
						</Form>
					)}
				</Formik>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							Or continue with
						</span>
					</div>
				</div>

				<Button
					className="w-full cursor-pointer"
					variant="outline"
					onClick={async () => {
						setGoogleLoading(true);
						await signIn("google", { callbackUrl: "/" });
					}}
					disabled={googleLoading}
				>
					{googleLoading ? (
						<div className="w-4 h-4 rounded-full border-2 border-zinc-300 border-t-zinc-600 animate-spin mr-2" />
					) : (
						<svg
							className="w-4 h-4 mr-2"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
					)}
					Continue with Google
				</Button>

				<p className="px-8 text-center text-xs text-muted-foreground">
					By clicking continue, you agree to our{" "}
					<Link
						href="/terms"
						className="underline underline-offset-4 hover:text-primary"
					>
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link
						href="/privacy"
						className="underline underline-offset-4 hover:text-primary"
					>
						Privacy Policy
					</Link>
					.
				</p>

				<div className="text-center text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link
						href="/register"
						className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
					>
						Sign up
					</Link>
				</div>
			</div>
		</div>
	);
}
