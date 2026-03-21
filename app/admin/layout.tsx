import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/");
	}

	const { data: admin, error: adminError } = await supabase
		.from("admins")
		.select("id")
		.eq("id", user.id)
		.single();

	if (!admin) {
		console.error("Usuário logado via Google não foi encontrado na tabela 'admins'. UID:", user.id);
		if (adminError) console.error("Erro da query admins:", adminError.message);
		
		// Logado com o Google, mas não é admin!
		redirect("/?error=unauthorized_admin");
	}

	return (
		<div className="flex min-h-screen bg-gray-50 font-sans text-black">
			{/* SIDEBAR */}
			<aside className="w-[240px] bg-[#0a0a0a] hidden md:flex flex-col min-h-screen shrink-0 sticky top-0 text-white">
				<div className="p-5 border-b border-white/10 flex items-center gap-2">
					<div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
					<span className="font-['Bebas_Neue'] text-2xl tracking-[3px]">BARBERBOOK</span>
				</div>
				<div className="p-4 border-b border-white/10 flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center font-['Bebas_Neue'] text-sm shrink-0">
						ADM
					</div>
					<div>
						<div className="text-sm font-semibold leading-tight">{user.email?.split("@")[0] || "Admin"}</div>
						<div className="text-xs text-gray-500">Super Admin</div>
					</div>
				</div>
				<nav className="flex-1 py-4 overflow-y-auto">
					<div className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-white bg-red-500/10 border-l-4 border-red-500 cursor-pointer">
						<span className="w-4 text-center">📅</span> Agenda
					</div>
					<div className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 cursor-pointer transition-colors border-l-4 border-transparent">
						<span className="w-4 text-center">👥</span> Equipe
					</div>
					<div className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 cursor-pointer transition-colors border-l-4 border-transparent">
						<span className="w-4 text-center">⚙️</span> Ajustes
					</div>
				</nav>
				<div className="p-4 border-t border-white/10">
					<form action="/auth/signout" method="post">
						<button className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer text-left w-full">
							Sair da conta
						</button>
					</form>
				</div>
			</aside>

			{/* MAIN CONTENT VAI AQUI */}
			<div className="flex-1 flex flex-col min-w-0">
				{/* TOPBAR */}
				<header className="bg-white border-b border-gray-200 px-7 h-[60px] flex items-center justify-between sticky top-0 z-50">
					<h1 className="font-['Bebas_Neue'] text-[22px] tracking-[1.5px] text-black">PAINEL GERAL</h1>
					<div className="flex items-center gap-3">
						<button className="w-9 h-9 border-2 border-gray-200 rounded flex items-center justify-center relative hover:border-black transition-colors">
							🔔
							<div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
						</button>
					</div>
				</header>
				<main className="p-7">
					{children}
				</main>
			</div>
		</div>
	);
}
