"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

/**
 * LoginButton component - Redirects to the dedicated login route
 * 
 * @returns {JSX.Element} The rendered button wrapped in a Link
 */
export default function LoginButton() {
	return (
		<Link href="/login" className="no-underline">
			<Button
				text="LOGIN"
				className="w-25 cursor-pointer"
			/>
		</Link>
	);
}
