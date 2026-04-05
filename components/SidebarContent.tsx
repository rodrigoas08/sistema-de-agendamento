"use client";

import LogoutButton from "@/components/ui/LogoutButton";
import Link from "next/link";
import { X } from "lucide-react";
import { NAV } from "@/app/admin/AdminLayoutClient";

interface SidebarProps {
	userName: string;
	unreadCount: number;
	setIsMobileMenuOpen: () => void;
	isActive: (item: (typeof NAV)[0]) => boolean;
}

export default function SidebarContent({
	userName,
	unreadCount,
	setIsMobileMenuOpen,
	isActive,
}: SidebarProps) {
	return (
		<>
			<div className="flex items-center justify-between px-7 h-[60px] border-b border-white/10 shrink-0">
				<span className="font-['Bebas_Neue'] text-2xl tracking-[3px]">
					Seu<em className="text-red-500 not-italic">Negócio</em>
				</span>
				<button
					onClick={setIsMobileMenuOpen}
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
						onClick={setIsMobileMenuOpen}
						className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors border-l-4 ${
							isActive(item)
								? "text-white bg-red-500/10 border-red-500"
								: "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
						}`}
					>
						<span className="w-4 text-center text-base shrink-0">{item.icon}</span>
						<span className="truncate">{item.label}</span>
						{item.href === "/admin/notificacoes" && unreadCount > 0 && (
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
					onClick={setIsMobileMenuOpen}
					className="text-xs text-gray-500 hover:text-white transition-colors"
				>
					← Ver página pública
				</Link>
				<LogoutButton />
			</div>
		</>
	);
}
