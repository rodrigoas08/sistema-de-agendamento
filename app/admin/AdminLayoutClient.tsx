"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Building2 } from "lucide-react";
import SidebarContent from "@/components/SidebarContent";
import { createClient } from "@/utils/supabase/client";
import { useAllBarbershops } from "@/hooks/useBarbershop";
import { useBarbershopContext } from "@/providers/BarbershopProvider";
import {
	ChartColumnIncreasing,
	CalendarDays,
	Bell,
	Users,
	Settings,
} from "lucide-react";

export const NAV = [
	{
		href: "/admin/dashboard",
		label: "Dashboard",
		icon: <ChartColumnIncreasing size={18} />,
		exact: true,
	},
	{
		href: "/admin/agendamentos",
		label: "Agendamentos",
		icon: <CalendarDays size={18} />,
	},
	{
		href: "/admin/notificacoes",
		label: "Notificações",
		icon: <Bell size={18} />,
	},
	{ href: "/admin/equipe", label: "Equipe", icon: <Users size={18} /> },
	{
		href: "/admin/configuracoes",
		label: "Configurações",
		icon: <Settings size={18} />,
	},
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
	unreadCount: initialUnreadCount,
	isSuperAdmin = false,
}: {
	children: React.ReactNode;
	userName: string;
	unreadCount: number;
	isSuperAdmin?: boolean;
}) {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

	const supabase = createClient();

	const isActive = (item: (typeof NAV)[0]) =>
		item.exact ? pathname === item.href : pathname.startsWith(item.href);

	const title = PAGE_TITLES[pathname] ?? "PAINEL";

	// Super Admin: seletor de inquilinos
	const { barbershops } = useAllBarbershops();
	const { barbershop } = useBarbershopContext();

	// Busca a contagem atualizada
	const refreshUnreadCount = useCallback(async () => {
		if (!barbershop?.id) return;
		const { count } = await supabase
			.from("notifications")
			.select("*", { count: "exact", head: true })
			.eq("read", false)
			.eq("barbershop_id", barbershop.id);
		if (count !== null) setUnreadCount(count);
	}, [supabase, barbershop?.id]);

	useEffect(() => {
		// Listener para mudanças nas notificações
		const channel = supabase
			.channel("notifications-badge")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "notifications",
					filter: `barbershop_id=eq.${barbershop?.id}`,
				},
				() => {
					refreshUnreadCount();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, refreshUnreadCount]);

	// Impede scroll do body quando menu mobile está aberto
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflowY = "hidden";
		} else {
			document.body.style.overflowY = "auto";
		}
	}, [isMobileMenuOpen]);

	return (
		<div className="flex h-dvh min-h-screen bg-gray-50 font-sans text-black overflow-hidden relative">
			{/* OVERLAY BACKGROUND MOBILE */}
			<div
				className={`fixed inset-0 bg-black/50 z-60 md:hidden transition-opacity duration-300 ${
					isMobileMenuOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				}`}
				onClick={() => setIsMobileMenuOpen(false)}
			/>

			{/* MOBILE SIDEBAR */}
			<aside
				className={`fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-[#0a0a0a] z-70 transform transition-transform duration-300 md:hidden flex flex-col text-white ${
					isMobileMenuOpen
						? "translate-x-0 duration-300"
						: "-translate-x-full duration-1000"
				}`}
			>
				<SidebarContent
					userName={userName}
					unreadCount={unreadCount}
					setIsMobileMenuOpen={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					isActive={isActive}
				/>
			</aside>

			{/* DESKTOP SIDEBAR */}
			<aside className="hidden md:flex flex-col top-0 w-[240px] h-full bg-[#0a0a0a] shrink-0 text-white">
				<SidebarContent
					userName={userName}
					unreadCount={unreadCount}
					setIsMobileMenuOpen={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					isActive={isActive}
				/>
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
						{/* Super Admin: Seletor de Inquilinos */}
						{isSuperAdmin && barbershops.length > 0 && (
							<div className="flex items-center gap-1.5">
								<Building2 size={14} className="text-gray-400" />
								<select
									className="text-[10px] md:text-xs bg-transparent border border-gray-200 rounded px-2 py-1 font-semibold text-gray-600 focus:outline-none focus:border-gray-400 cursor-pointer"
									value={barbershop?.id ?? ""}
									onChange={(event) => {
										const selectedSlug = barbershops.find(
											(shop) => shop.id === event.target.value,
										)?.slug;
										if (selectedSlug) {
											// Define o cookie para o servidor reconhecer o tenant
											document.cookie = `admin_tenant=${selectedSlug}; path=/; max-age=31536000`;
											window.location.href = `/admin/dashboard?tenant=${selectedSlug}`;
										}
									}}
								>
									{barbershops.map((shop) => (
										<option key={shop.id} value={shop.id}>
											{shop.name}
										</option>
									))}
								</select>
							</div>
						)}
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
