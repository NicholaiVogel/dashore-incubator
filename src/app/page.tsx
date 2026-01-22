import { getSignInUrl, withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
	const { user } = await withAuth();

	if (user) {
		redirect("/dashboard");
	}

	const signInUrl = await getSignInUrl();

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center space-y-2">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
						<span className="text-2xl font-bold text-white">D</span>
					</div>
					<h1 className="text-3xl font-bold tracking-tight text-white">Dashore Incubator</h1>
					<p className="text-zinc-400">Sign in to access your dashboard</p>
				</div>

				<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur">
					<CardHeader className="space-y-1">
						<CardTitle className="text-xl text-white">Welcome back</CardTitle>
						<CardDescription>Sign in with your account to continue</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							asChild
							className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium"
						>
							<a href={signInUrl}>Sign in</a>
						</Button>
					</CardContent>
					<CardFooter>
						<p className="text-sm text-zinc-400 text-center w-full">
							Don&apos;t have an account?{" "}
							<a href={signInUrl} className="text-amber-500 hover:text-amber-400 transition-colors">
								Request access
							</a>
						</p>
					</CardFooter>
				</Card>

				<p className="text-center text-xs text-zinc-500">
					By signing in, you agree to our Terms of Service and Privacy Policy
				</p>
			</div>
		</div>
	);
}
