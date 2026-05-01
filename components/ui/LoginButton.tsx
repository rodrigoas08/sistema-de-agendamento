"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useBarbershopContext } from "@/providers/BarbershopProvider";

/**
 * LoginButton component - Redirects to the dedicated login route
 * 
 * @returns {JSX.Element} The rendered button wrapped in a Link
 */
export default function LoginButton() {
	const { barbershop } = useBarbershopContext();

	return (
		<Link href={`/login?tenant=${barbershop.slug}`} className="no-underline">
			<Button
				text="LOGIN"
				className="w-25 cursor-pointer"
			/>
		</Link>
	);
}
