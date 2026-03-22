import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/");

	const { data: admin } = await supabase
		.from("admins")
		.select("id")
		.eq("id", user.id)
		.single();

	if (!admin) redirect("/?error=unauthorized_admin");

	// Conta notificações não lidas para o badge
	const { count: unreadCount } = await supabase
		.from("notifications")
		.select("id", { count: "exact", head: true })
		.eq("read", false);

	const userName =
		user.user_metadata?.full_name ||
		user.email?.split("@")[0] ||
		"Admin";

	return (
		<AdminLayoutClient userName={userName} unreadCount={unreadCount ?? 0}>
			{children}
		</AdminLayoutClient>
	);
}
