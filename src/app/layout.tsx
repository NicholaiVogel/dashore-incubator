import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Dashore Incubator",
	description: "Sign in to Dashore Incubator",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const auth = await withAuth();
	const { accessToken: _, ...initialAuth } = auth;

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<AuthKitProvider initialAuth={initialAuth}>{children}</AuthKitProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
