"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/ui/LogoutButton";

const NAV = [
	{ href: "/admin/dashboard", label: "Dashboard", icon: "📊", exact: true },
	{ href: "/admin/agendamentos", label: "Agendamentos", icon: "📅" },
	{ href: "/admin/notificacoes", label: "Notificações", icon: "🔔" },
	{ href: "/admin/equipe", label: "Equipe", icon: "✂" },
	{ href: "/admin/configuracoes", label: "Configurações", icon: "⚙️" },
];

const PAGE_TITLES: Record<string, string> = {
	"/admin/dashboard": "DASHBOARD",
	"/admin/agendamentos": "AGENDAMENTOS",
	"/admin/notificacoes": "NOTIFICAÇÕES",
	"/admin/equipe": "EQUIPE",
	"/admin/configuracoes": "CONFIGURAÇÕES",
};

export default function AdminLayoutClient({
	children,
	userName,
	unreadCount,
}: {
	children: React.ReactNode;
	userName: string;
	unreadCount: number;
}) {
	const pathname = usePathname();

	const isActive = (item: (typeof NAV)[0]) =>
		item.exact ? pathname === item.href : pathname.startsWith(item.href);

	const title = PAGE_TITLES[pathname] ?? "PAINEL";

	return (
		<div className="flex min-h-screen bg-gray-50 font-sans text-black">
			{/* SIDEBAR */}
			<aside className="w-[240px] bg-[#0a0a0a] hidden md:flex flex-col min-h-screen shrink-0 sticky top-0 h-screen text-white">
				<div className="p-5 border-b border-white/10 flex items-center gap-2">
					<div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
					<span className="font-['Bebas_Neue'] text-2xl tracking-[3px]">
						Seu<em className="text-red-500 not-italic">Negócio</em>
					</span>
				</div>

				<div className="p-4 border-b border-white/10 flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center font-['Bebas_Neue'] text-sm shrink-0">
						{userName.slice(0, 2).toUpperCase()}
					</div>
					<div>
						<div className="text-sm font-semibold leading-tight">{userName}</div>
						<div className="text-xs text-gray-500">Administrador</div>
					</div>
				</div>

				<nav className="flex-1 py-4 overflow-y-auto">
					{NAV.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors border-l-4 ${
								isActive(item)
									? "text-white bg-red-500/10 border-red-500"
									: "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
							}`}
						>
							<span className="w-4 text-center text-base">{item.icon}</span>
							{item.label}
							{item.href === "/admin/agendamentos" && unreadCount > 0 && (
								<span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
									{unreadCount}
								</span>
							)}
						</Link>
					))}
				</nav>

				<div className="p-4 border-t border-white/10 flex flex-col gap-3">
					<Link
						href="/"
						className="text-xs text-gray-500 hover:text-white transition-colors"
					>
						← Ver página pública
					</Link>
					<LogoutButton />
				</div>
			</aside>

			{/* MAIN */}
			<div className="flex-1 flex flex-col min-w-0">
				<header className="bg-white border-b border-gray-200 px-7 h-[60px] flex items-center justify-between sticky top-0 z-50">
					<h1 className="font-['Bebas_Neue'] text-[22px] tracking-[1.5px]">{title}</h1>
					<div className="flex items-center gap-3">
						<span className="text-xs text-gray-400 flex items-center gap-1.5">
							<span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
							Ao vivo
						</span>
						<Link
							href="/admin/notificacoes"
							className="w-9 h-9 border-2 border-gray-200 rounded flex items-center justify-center relative hover:border-black transition-colors"
						>
							🔔
							{unreadCount > 0 && (
								<div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
							)}
						</Link>
					</div>
				</header>

				<main className="p-7">{children}</main>
			</div>
		</div>
	);
}
