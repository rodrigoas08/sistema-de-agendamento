"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Check, CheckCheck, Trash2 } from "lucide-react";
import ActionButton from "@/components/admin/ActionButton";
import { DataTable } from "@/components/ui/DataTable";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";

type Notification = {
	id: Filter;
	title: string;
	description: string;
	read: boolean;
	created_at: string;
};

type Filter = "all" | "unread" | "read";

const columnHelper = createColumnHelper<Notification>();

export default function NotificacoesPage() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<Filter>("all");

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
					const newNotification = payload.new as Notification;
					setNotifications((prev) => [newNotification, ...prev]);
				},
			)
			.on(
				"postgres_changes",
				{ event: "UPDATE", schema: "public", table: "notifications" },
				(payload) => {
					const updated = payload.new as Notification;
					setNotifications((prev) =>
						prev.map((notification) =>
							notification.id === updated.id ? updated : notification,
						),
					);
				},
			)
			.on(
				"postgres_changes",
				{ event: "DELETE", schema: "public", table: "notifications" },
				(payload) => {
					const deleted = payload.old as { id: string };
					setNotifications((prev) =>
						prev.filter((notification) => notification.id !== deleted.id),
					);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase]);

	const markAsRead = useCallback(
		async (id: string) => {
			// Atualiza otimisticamente
			setNotifications((prev) =>
				prev.map((notification) =>
					notification.id === id ? { ...notification, read: true } : notification,
				),
			);
			await supabase.from("notifications").update({ read: true }).eq("id", id);
		},
		[supabase],
	);

	const markAllAsRead = async () => {
		const unreadIds = notifications
			.filter((notification) => !notification.read)
			.map((notification) => notification.id);
		if (unreadIds.length === 0) return;

		setNotifications((prev) =>
			prev.map((notification) => ({ ...notification, read: true })),
		);
		await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
	};

	const removeNotification = useCallback(
		async (id: string) => {
			setNotifications((prev) =>
				prev.filter((notification) => notification.id !== id),
			);
			await supabase.from("notifications").delete().eq("id", id);
		},
		[supabase],
	);

	const filteredNotifications = useMemo(() => {
		return notifications.filter((notification) => {
			if (filter === "unread") return !notification.read;
			if (filter === "read") return notification.read;
			return true;
		});
	}, [notifications, filter]);

	const unreadCount = notifications.filter(
		(notification) => !notification.read,
	).length;

	const columns = useMemo(
		() => [
			columnHelper.display({
				id: "status",
				header: "",
				cell: (info) => {
					const notification = info.row.original;
					return (
						<div className="flex justify-center">
							<div
								className={`w-2.5 h-2.5 rounded-full ${
									notification.read ? "bg-gray-300" : "bg-red-500 animate-pulse"
								}`}
							/>
						</div>
					);
				},
				size: 40,
			}),
			columnHelper.display({
				id: "title",
				header: "Título",
				cell: (info) => {
					const notification = info.row.original;
					return (
						<span
							className={`font-bold ${notification.read ? "text-gray-700" : "text-black"}`}
						>
							{notification.title || "Nova Notificação"}
						</span>
					);
				},
			}),
			columnHelper.display({
				id: "description",
				header: "Mensagem",
				cell: (info) => {
					const notification = info.row.original;
					return (
						<span
							className={`text-sm ${notification.read ? "text-gray-500" : "text-gray-800"}`}
						>
							{notification.description}
						</span>
					);
				},
			}),
			columnHelper.display({
				id: "created_at",
				header: "Data/Hora",
				cell: (info) => {
					const notification = info.row.original;
					return (
						<span className="text-xs text-gray-500 font-medium">
							{new Date(notification.created_at).toLocaleString("pt-BR", {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					);
				},
			}),
			columnHelper.display({
				id: "actions",
				header: "Ações",
				cell: (info) => {
					const notification = info.row.original;
					return (
						<div className="flex items-center gap-2">
							{!notification.read && (
								<ActionButton
									onClick={() => markAsRead(notification.id)}
									title="Marcar como lida"
									icon={<Check size={18} />}
									className="text-green-500 hover:text-white hover:border-green-500 hover:bg-green-500"
								/>
							)}
							<ActionButton
								onClick={() => removeNotification(notification.id)}
								title="Excluir notificação"
								icon={<Trash2 size={18} />}
								className="text-red-600 hover:text-white hover:border-red-500 hover:bg-red-500"
							/>
						</div>
					);
				},
			}),
		],
		[markAsRead, removeNotification],
	);

	return (
		<div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm">
			{/* header */}
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5">
				<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px] uppercase flex items-center gap-2">
					MINHAS NOTIFICAÇÕES
				</h2>
			</div>

			{/* filtros e ações */}
			<div className="flex flex-col gap-4 border-b border-gray-100 bg-[#f9f9f9] px-5 py-4 md:flex-row md:items-center md:justify-between">
				<div className="flex flex-wrap gap-2">
					{[
						{ id: "all", label: `Todas (${notifications.length})` },
						{ id: "unread", label: `Não lidas (${unreadCount})` },
						{ id: "read", label: "Lidas" },
					].map((f) => (
						<button
							key={f.id}
							onClick={() => setFilter(f.id as Filter)}
							className={`
								px-3 py-1.5
								font-['Barlow_Condensed'] text-xs font-bold tracking-wider uppercase
								rounded border
								transition-all
								${
								filter === f.id
									? "border-black bg-black text-white"
									: "border-[#e0e0e0] bg-white text-gray-600 hover:border-black hover:text-black"
							}
							`}
						>
							{f.label}
						</button>
					))}
				</div>

				<button
					onClick={markAllAsRead}
					disabled={unreadCount === 0}
					className="
						flex flex-row items-center gap-2
						px-4 py-2
						font-['Barlow_Condensed'] text-[11px] font-bold tracking-widest uppercase
						rounded border-2 border-[#e0e0e0]
						hover:border-[#0a0a0a] hover:bg-white
						transition-all bg-white
						disabled:opacity-50 disabled:cursor-not-allowed
					"
				>
					<CheckCheck size={14} /> Marcar todas como lidas
				</button>
			</div>

			<div className="flex flex-col">
				{/* ── MOBILE CARD VIEW (< lg) ── */}
				<div className="divide-y divide-gray-100 flex flex-col lg:hidden">
					{loading ? (
						<div className="p-10 text-center text-gray-400 font-semibold text-sm animate-pulse">
							Carregando suas notificações...
						</div>
					) : filteredNotifications.length === 0 ? (
						<div className="p-10 text-center text-sm font-semibold text-gray-400">
							Nenhuma notificação encontrada nessa categoria.
						</div>
					) : (
						filteredNotifications.map((n) => (
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
										className={`w-2.5 h-2.5 rounded-full ${
											n.read ? "bg-gray-300" : "bg-red-500 animate-pulse"
										}`}
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

								{/* AÇÕES */}
								<div className="flex items-center gap-2 shrink-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
									{!n.read && (
										<ActionButton
											onClick={() => markAsRead(n.id)}
											title="Marcar como lida"
											icon={<Check size={18} />}
											className="text-green-500 hover:text-white hover:border-green-500 hover:bg-green-500"
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
						))
					)}
				</div>

				{/* ── DESKTOP TABELA (>= lg) ── */}
				<div className="hidden lg:block">
					<DataTable
						data={filteredNotifications}
						columns={columns as ColumnDef<Notification, unknown>[]}
						loading={loading}
					/>
				</div>
			</div>
		</div>
	);
}
