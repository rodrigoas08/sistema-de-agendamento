"use client";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LogoutButton() {
	const supabase = createClient();

	async function handleLogout() {
		await supabase.auth.signOut();
		redirect("/");
	}

	return (
		<button
			onClick={handleLogout}
			className="w-full text-left text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
		>
			Sair da conta
		</button>
	);
}
