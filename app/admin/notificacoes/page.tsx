"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Check, CheckCheck, Trash2, Bell } from "lucide-react";
import ActionButton from "@/components/admin/ActionButton";

type Notification = {
	id: string;
	title: string;
	description: string;
	read: boolean;
	created_at: string;
};

export default function NotificacoesPage() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

	const supabase = createClient();

	useEffect(() => {
		const fetchData = async () => {
			const { data, error } = await supabase
				.from("notifications")
				.select("*")
				.order("created_at", { ascending: false });

			if (!error && data) {
				setNotifications(data);
			}
			setLoading(false);
		};

		fetchData();

		const channel = supabase
			.channel("notifications-live")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "notifications" },
				(payload) => {
					const newNotif = payload.new as Notification;
					setNotifications((prev) => [newNotif, ...prev]);
				},
			)
			.on(
				"postgres_changes",
				{ event: "UPDATE", schema: "public", table: "notifications" },
				(payload) => {
					const updated = payload.new as Notification;
					setNotifications((prev) =>
						prev.map((n) => (n.id === updated.id ? updated : n)),
					);
				},
			)
			.on(
				"postgres_changes",
				{ event: "DELETE", schema: "public", table: "notifications" },
				(payload) => {
					const deleted = payload.old as { id: string };
					setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase]);

	const markAsRead = async (id: string) => {
		// Atualiza otimisticamente
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
		);
		await supabase.from("notifications").update({ read: true }).eq("id", id);
	};

	const markAllAsRead = async () => {
		const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
		if (unreadIds.length === 0) return;

		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
		await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
	};

	const removeNotification = async (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
		await supabase.from("notifications").delete().eq("id", id);
	};

	const filteredNotifications = notifications.filter((n) => {
		if (filter === "unread") return !n.read;
		if (filter === "read") return n.read;
		return true;
	});

	const unreadCount = notifications.filter((n) => !n.read).length;

	return (
		<div className="flex flex-col gap-6">
			{/* HEADER E AÇÕES */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<h2 className="font-['Bebas_Neue'] text-2xl tracking-[1.5px] uppercase flex items-center gap-2">
					<Bell className="text-gray-400" /> Minhas Notificações
				</h2>

				<div className="flex flex-wrap items-center gap-3">
					<div className="flex bg-white rounded border border-gray-200 overflow-hidden text-sm font-semibold">
						<button
							onClick={() => setFilter("all")}
							className={`px-4 py-2 transition-colors ${
								filter === "all" ? "bg-black text-white" : "hover:bg-gray-50 text-gray-500"
							}`}
						>
							Todas ({notifications.length})
						</button>
						<button
							onClick={() => setFilter("unread")}
							className={`px-4 py-2 transition-colors border-l border-r border-gray-200 ${
								filter === "unread" ? "bg-black text-white" : "hover:bg-gray-50 text-gray-500"
							}`}
						>
							Não lidas ({unreadCount})
						</button>
						<button
							onClick={() => setFilter("read")}
							className={`px-4 py-2 transition-colors ${
								filter === "read" ? "bg-black text-white" : "hover:bg-gray-50 text-gray-500"
							}`}
						>
							Lidas
						</button>
					</div>

					<button
						onClick={markAllAsRead}
						disabled={unreadCount === 0}
						className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						<CheckCheck size={16} />
						Marcar todas como lidas
					</button>
				</div>
			</div>

			{/* LISTAGEM */}
			<div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden flex flex-col">
				{loading ? (
					<div className="p-10 text-center text-gray-400 font-semibold text-sm animate-pulse">
						Carregando suas notificações...
					</div>
				) : filteredNotifications.length === 0 ? (
					<div className="p-10 text-center text-sm font-semibold text-gray-400">
						Nenhuma notificação encontrada nessa categoria.
					</div>
				) : (
					<div className="divide-y divide-gray-100 flex flex-col">
						{filteredNotifications.map((n) => (
							<div
								key={n.id}
								className={`
									flex items-start gap-4 p-5 transition-colors group
									${n.read ? "bg-white hover:bg-gray-50" : "bg-red-500/5 hover:bg-red-500/10"}
								`}
							>
								{/* ÍCONE DE STATUS */}
								<div className="shrink-0 mt-1">
									<div
										className={`w-2.5 h-2.5 rounded-full ${n.read ? "bg-gray-300" : "bg-red-500 animate-pulse"}`}
									/>
								</div>

								{/* CONTEÚDO */}
								<div className="flex-1 min-w-0">
									<h4
										className={`text-base font-bold mb-1 ${n.read ? "text-gray-700" : "text-black"}`}
									>
										{n.title || "Nova Notificação"}
									</h4>
									<p
										className={`text-sm leading-relaxed ${n.read ? "text-gray-500" : "text-gray-800"}`}
									>
										{n.description}
									</p>
									<span className="text-xs text-gray-400 font-medium block mt-2">
										{new Date(n.created_at).toLocaleString("pt-BR", {
											day: "2-digit",
											month: "2-digit",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>

								{/* AÇÕES (Visíveis ao hover md ou fixas no mobile) */}
								<div className="flex items-center gap-2 shrink-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
									{!n.read && (
										<ActionButton
											onClick={() => markAsRead(n.id)}
											title="Marcar como lida"
											icon={<Check size={18} />}
											className="text-green-500	 hover:text-white hover:border-green-500 hover:bg-green-500"
										/>
									)}
									<ActionButton
										onClick={() => removeNotification(n.id)}
										title="Excluir notificação"
										icon={<Trash2 size={18} />}
										className="text-red-600 hover:text-white hover:border-red-500 hover:bg-red-500"
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
