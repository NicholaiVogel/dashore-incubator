"use client";

import { Button } from "@/components/ui/button";
import { handleSignOut } from "@/app/actions/auth";

export function SignOutButton() {
	return (
		<Button variant="ghost" size="sm" onClick={() => handleSignOut()}>
			Sign out
		</Button>
	);
}
