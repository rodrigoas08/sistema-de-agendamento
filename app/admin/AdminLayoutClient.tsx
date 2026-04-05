"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/ui/LogoutButton";
import { Menu, X } from "lucide-react";

const NAV = [
	{ href: "/admin/dashboard", label: "Dashboard", icon: "📊", exact: true },
	{ href: "/admin/agendamentos", label: "Agendamentos", icon: "📅" },
	{ href: "/admin/notificacoes", label: "Notificações", icon: "🔔" },
	{ href: "/admin/equipe", label: "Equipe", icon: "👥" },
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
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const isActive = (item: (typeof NAV)[0]) =>
		item.exact ? pathname === item.href : pathname.startsWith(item.href);

	const title = PAGE_TITLES[pathname] ?? "PAINEL";

	// Impede scroll do body quando menu mobile está aberto
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
	}, [isMobileMenuOpen]);

	const SidebarContent = () => (
		<>
			<div className="flex items-center justify-between px-7 h-[60px] border-b border-white/10 shrink-0">
				<span className="font-['Bebas_Neue'] text-2xl tracking-[3px]">
					Seu<em className="text-red-500 not-italic">Negócio</em>
				</span>
				<button 
					onClick={() => setIsMobileMenuOpen(false)}
					className="md:hidden text-gray-400 hover:text-white"
				>
					<X size={24} />
				</button>
			</div>

			<div className="flex items-center gap-3 p-7 border-b border-white/10 shrink-0">
				<div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-red-500 font-['Bebas_Neue'] text-sm ">
					{userName.slice(0, 2).toUpperCase()}
				</div>
				<div className="min-w-0">
					<div className="text-sm font-semibold leading-tight truncate">{userName}</div>
					<div className="text-xs text-gray-500">Administrador</div>
				</div>
			</div>

			<nav className="flex-1 py-4 overflow-y-auto">
				{NAV.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						onClick={() => setIsMobileMenuOpen(false)}
						className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors border-l-4 ${
							isActive(item)
								? "text-white bg-red-500/10 border-red-500"
								: "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
						}`}
					>
						<span className="w-4 text-center text-base shrink-0">{item.icon}</span>
						<span className="truncate">{item.label}</span>
						{item.href === "/admin/agendamentos" && unreadCount > 0 && (
							<span className="ml-auto shrink-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
								{unreadCount}
							</span>
						)}
					</Link>
				))}
			</nav>

			<div className="p-4 border-t border-white/10 flex flex-col gap-3 shrink-0">
				<Link
					href="/"
					onClick={() => setIsMobileMenuOpen(false)}
					className="text-xs text-gray-500 hover:text-white transition-colors"
				>
					← Ver página pública
				</Link>
				<LogoutButton />
			</div>
		</>
	);

	return (
		<div className="flex h-dvh min-h-screen bg-gray-50 font-sans text-black overflow-hidden relative">
			{/* OVERLAY BACKGROUND MOBILE */}
			<div 
				className={`fixed inset-0 bg-black/50 z-60 md:hidden transition-opacity duration-300 ${
					isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
				}`}
				onClick={() => setIsMobileMenuOpen(false)}
			/>

			{/* MOBILE SIDEBAR */}
			<aside 
				className={`fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-[#0a0a0a] z-70 transform transition-transform duration-300 md:hidden flex flex-col text-white ${
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<SidebarContent />
			</aside>

			{/* DESKTOP SIDEBAR */}
			<aside className="hidden md:flex flex-col top-0 w-[240px] h-full bg-[#0a0a0a] shrink-0 text-white">
				<SidebarContent />
			</aside>

			{/* MAIN */}
			<div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
				<header className="bg-white border-b border-gray-200 px-4 md:px-7 h-[60px] flex items-center justify-between sticky top-0 z-50 shrink-0">
					<div className="flex items-center gap-3">
						<button 
							onClick={() => setIsMobileMenuOpen(true)}
							className="md:hidden text-gray-600 hover:text-black p-1 -ml-1 transition-colors"
						>
							<Menu size={24} />
						</button>
						<h1 className="font-['Bebas_Neue'] text-[20px] md:text-[22px] tracking-[1.5px] truncate max-w-[150px] md:max-w-none">
							{title}
						</h1>
					</div>

					<div className="flex items-center gap-2 md:gap-3 shrink-0">
						<span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1.5 uppercase font-medium">
							<span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full inline-block animate-pulse" />
							Ao vivo
						</span>
						<Link
							href="/admin/notificacoes"
							className="flex items-center justify-center relative w-8 h-8 md:w-9 md:h-9 hover:bg-gray-50 rounded transition-colors"
						>
							<span className="text-[18px]">🔔</span>
							{unreadCount > 0 && (
								<div className="absolute top-1 right-1 w-2 h-2 rounded-full border bg-red-500 border-white" />
							)}
						</Link>
					</div>
				</header>

				<main className="p-4 md:p-7">{children}</main>
			</div>
		</div>
	);
}
