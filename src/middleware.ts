import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
	redirectUri: process.env.WORKOS_REDIRECT_URI || "https://fortura.cc/api/auth/callback",
	middlewareAuth: {
		enabled: true,
		unauthenticatedPaths: ["/"],
	},
});

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
