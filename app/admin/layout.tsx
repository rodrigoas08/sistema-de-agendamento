import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminLayoutClient from "./AdminLayoutClient";
import { BarbershopProvider } from "@/providers/BarbershopProvider";
import type { Barbershop } from "@/schemas/barbershopSchema";

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

	// Verifica se é super admin
	const { data: superAdmin } = await supabase
		.from("super_admins")
		.select("user_id")
		.eq("user_id", user.id)
		.single();

	const isSuperAdmin = !!superAdmin;

	// Busca o barbershop do admin logado
	let barbershop: Barbershop | null = null;

	if (isSuperAdmin) {
		// Super Admin: pega o primeiro barbershop (seletor será no client)
		const { data } = await supabase
			.from("barbershops")
			.select("*")
			.order("name", { ascending: true })
			.limit(1)
			.single();

		barbershop = data as Barbershop | null;
	} else {
		// Owner: pega o barbershop vinculado
		const { data } = await supabase
			.from("barbershops")
			.select("*")
			.eq("owner_id", user.id)
			.single();

		barbershop = data as Barbershop | null;
	}

	if (!barbershop) redirect("/?error=no_barbershop");

	// Conta notificações não lidas para o badge
	const { count: unreadCount } = await supabase
		.from("notifications")
		.select("*", { count: "exact", head: true })
		.eq("read", false)
		.eq("barbershop_id", barbershop.id);

	const userName =
		user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin";

	return (
		<BarbershopProvider barbershop={barbershop}>
			<AdminLayoutClient
				userName={userName}
				unreadCount={unreadCount ?? 0}
				isSuperAdmin={isSuperAdmin}
			>
				{children}
			</AdminLayoutClient>
		</BarbershopProvider>
	);
}
