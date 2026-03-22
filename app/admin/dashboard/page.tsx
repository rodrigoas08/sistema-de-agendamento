"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// ─── TYPES ───────────────────────────────────────────────
type Appointment = {
	id: string;
	time: string;
	date: string;
	client_name: string;
	client_phone: string;
	service_names: string;
	barber_name: string;
	barber_id: string;
	status: "pending" | "confirmed" | "done" | "cancelled";
	total: number;
};

type Notification = {
	id: string;
	title: string;
	description: string;
	type: string;
	read: boolean;
	created_at: string;
};

type StatusFilter = "all" | "pending" | "confirmed" | "done" | "cancelled";

// ─── HELPERS ─────────────────────────────────────────────
function formatTimeAgo(iso: string) {
	const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
	if (diff < 60) return "agora mesmo";
	if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
	if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
	return new Date(iso).toLocaleDateString("pt-BR");
}

function buildWALink(phone: string, name: string) {
	const p = phone.replace(/\D/g, "");
	const full = p.startsWith("55") ? p : `55${p}`;
	return `https://wa.me/${full}?text=${encodeURIComponent(
		`Olá ${name}! 👋 Passando para confirmar seu agendamento na "Seu Negócio".`,
	)}`;
}

const STATUS_LABEL: Record<string, string> = {
	pending: "⏳ Pendente",
	confirmed: "✅ Confirmado",
	done: "✓ Concluído",
	cancelled: "✕ Cancelado",
};

const STATUS_CLASS: Record<string, string> = {
	pending: "bg-yellow-500 text-yellow-700",
	confirmed: "bg-green-100 text-green-700",
	done: "bg-gray-100 text-gray-500",
	cancelled: "bg-red-100 text-red-600",
};

// ─── COMPONENT ───────────────────────────────────────────
export default function DashboardPage() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(
		null,
	);
	const supabase = createClient();

	const showToast = useCallback((msg: string, error = false) => {
		setToast({ msg, error });
		setTimeout(() => setToast(null), 3500);
	}, []);

	// ── Load initial data ──
	useEffect(() => {
		const today = new Date().toISOString().split("T")[0];

		const fetchData = async () => {
			const [{ data: appts }, { data: notifs }] = await Promise.all([
				supabase
					.from("appointments")
					.select("*")
					.eq("date", today)
					.order("time", { ascending: true }),
				supabase
					.from("notifications")
					.select("*")
					.order("created_at", { ascending: false })
					.limit(20),
			]);
			if (appts) setAppointments(appts);
			if (notifs) setNotifications(notifs);
			setLoading(false);
		};

		fetchData();

		// ── Realtime ──
		const channel = supabase
			.channel("dashboard-live")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "appointments" },
				(payload) => {
					const a = payload.new as Appointment;
					if (a.date === today) {
						setAppointments((prev) =>
							[...prev, a].sort((x, y) => x.time.localeCompare(y.time)),
						);
					}
					showToast(`🆕 Novo agendamento: ${a.client_name}`);
				},
			)
			.on(
				"postgres_changes",
				{ event: "UPDATE", schema: "public", table: "appointments" },
				(payload) => {
					const a = payload.new as Appointment;
					setAppointments((prev) => prev.map((x) => (x.id === a.id ? a : x)));
				},
			)
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "notifications" },
				(payload) => {
					setNotifications((prev) => [payload.new as Notification, ...prev]);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, showToast]);

	// ── Actions ──
	async function changeStatus(id: string, status: Appointment["status"]) {
		const { error } = await supabase
			.from("appointments")
			.update({ status })
			.eq("id", id);
		if (error) {
			showToast("Erro ao atualizar status.", true);
			return;
		}
		setAppointments((prev) =>
			prev.map((a) => (a.id === id ? { ...a, status } : a)),
		);
		showToast("Status atualizado!");
	}

	// ── Stats ──
	const today = new Date().toISOString().split("T")[0];
	const todayAppts = appointments.filter((a) => a.date === today);
	const pendingCount = todayAppts.filter((a) => a.status === "pending").length;
	const confirmedCount = todayAppts.filter(
		(a) => a.status === "confirmed",
	).length;
	const revenue = appointments
		.filter((a) => a.status !== "cancelled")
		.reduce((s, a) => s + Number(a.total ?? 0), 0);

	// ── Filtered table ──
	const filtered =
		statusFilter === "all"
			? appointments
			: appointments.filter((a) => a.status === statusFilter);

	const FILTERS: { value: StatusFilter; label: string }[] = [
		{ value: "all", label: "Todos" },
		{ value: "pending", label: "Pendentes" },
		{ value: "confirmed", label: "Confirmados" },
		{ value: "done", label: "Concluídos" },
		{ value: "cancelled", label: "Cancelados" },
	];

	return (
		<>
			{/* ── STATS ── */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
				{[
					{
						label: "HOJE",
						value: todayAppts.length,
						color: "bg-red-500",
						text: "text-red-500",
					},
					{
						label: "PENDENTES",
						value: pendingCount,
						color: "bg-yellow-500",
						text: "text-yellow-500",
					},
					{
						label: "CONFIRMADOS",
						value: confirmedCount,
						color: "bg-green-500",
						text: "text-green-500",
					},
					{
						label: "FATURAMENTO",
						value: `R$${revenue.toFixed(0)}`,
						color: "bg-black",
						text: "text-black",
					},
				].map((s) => (
					<div
						key={s.label}
						className={`bg-white border-2 border-gray-200 rounded-xl p-5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1`}
					>
						<div className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 mb-2">
							{s.label}
						</div>
						<div className={`font-['Bebas_Neue'] text-4xl leading-none ${s.text}`}>
							{s.value}
						</div>
					</div>
				))}
			</div>

			{/* ── AGENDAMENTOS DE HOJE ── */}
			<div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden mb-6">
				{/* header */}
				<div className="p-5 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
					<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px]">
						AGENDAMENTOS DE HOJE
					</h2>
					<Link
						href="/admin/agendamentos"
						className="font-['Barlow_Condensed'] text-xs font-bold tracking-widest uppercase px-4 py-2 border-2 border-gray-200 rounded hover:border-black hover:bg-gray-50 transition-all"
					>
						Ver Todos →
					</Link>
				</div>

				{/* filters */}
				<div className="flex gap-2 flex-wrap px-5 py-3 border-b border-gray-100 bg-gray-50">
					{FILTERS.map((f) => (
						<button
							key={f.value}
							onClick={() => setStatusFilter(f.value)}
							className={`font-['Barlow_Condensed'] text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded border transition-all ${
								statusFilter === f.value
									? "bg-black text-white border-black"
									: "bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black"
							}`}
						>
							{f.label}
						</button>
					))}
				</div>

				{/* table */}
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-gray-50">
								{["Cliente", "Barbeiro", "Serviço", "Hora", "Total", "Status", "Ações"].map(
									(h) => (
										<th
											key={h}
											className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 py-3 px-5 border-b border-gray-200"
										>
											{h}
										</th>
									),
								)}
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={7} className="py-10 text-center text-sm text-gray-400">
										Carregando...
									</td>
								</tr>
							) : filtered.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className="py-10 text-center text-sm text-gray-400 font-semibold"
									>
										Nenhum agendamento encontrado.
									</td>
								</tr>
							) : (
								filtered.map((a) => (
									<tr key={a.id} className="hover:bg-gray-50 border-b border-gray-100">
										{/* Cliente */}
										<td className="py-3 px-5">
											<div className="flex items-center gap-2">
												<div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-['Bebas_Neue'] text-xs shrink-0">
													{a.client_name
														.split(" ")
														.map((w) => w[0])
														.join("")
														.slice(0, 2)
														.toUpperCase()}
												</div>
												<div>
													<div className="text-sm font-bold leading-tight">{a.client_name}</div>
													<div className="text-xs text-gray-400">{a.client_phone}</div>
												</div>
											</div>
										</td>
										{/* Barbeiro */}
										<td className="py-3 px-5 text-sm font-semibold text-red-500">
											{a.barber_name}
										</td>
										{/* Serviço */}
										<td className="py-3 px-5 text-sm text-gray-600 max-w-[180px]">
											{a.service_names}
										</td>
										{/* Hora */}
										<td className="py-3 px-5 text-sm font-bold">{a.time}</td>
										{/* Total */}
										<td className="py-3 px-5 font-['Bebas_Neue'] text-lg">
											R${Number(a.total ?? 0).toFixed(0)}
										</td>
										{/* Status */}
										<td className="py-3 px-5">
											<span
												className={`px-1 py-[2px] rounded text-xs font-bold ${STATUS_CLASS[a.status] ?? "bg-gray-100 text-gray-500"}`}
											>
												{STATUS_LABEL[a.status] ?? a.status}
											</span>
										</td>
										{/* Ações */}
										<td className="py-3 px-5">
											<div className="flex items-center gap-1.5">
												{/* WhatsApp */}
												<a
													href={buildWALink(a.client_phone, a.client_name)}
													target="_blank"
													rel="noopener noreferrer"
													title="Falar com cliente"
													className="w-8 h-8 border-2 border-gray-200 rounded flex items-center justify-center text-sm hover:border-green-500 hover:bg-green-50 transition-all"
												>
													💬
												</a>
												{/* Confirmar */}
												{a.status === "pending" && (
													<button
														onClick={() => changeStatus(a.id, "confirmed")}
														title="Confirmar"
														className="w-8 h-8 border-2 border-gray-200 rounded flex items-center justify-center text-sm hover:border-green-500 hover:bg-green-50 transition-all"
													>
														✅
													</button>
												)}
												{/* Concluir */}
												{a.status === "confirmed" && (
													<button
														onClick={() => changeStatus(a.id, "done")}
														title="Concluir"
														className="w-8 h-8 border-2 border-gray-200 rounded flex items-center justify-center text-sm hover:border-black hover:bg-gray-50 transition-all"
													>
														✓
													</button>
												)}
												{/* Cancelar */}
												{!["cancelled", "done"].includes(a.status) && (
													<button
														onClick={() => changeStatus(a.id, "cancelled")}
														title="Cancelar"
														className="w-8 h-8 border-2 border-gray-200 rounded flex items-center justify-center text-sm hover:border-red-500 hover:bg-red-50 transition-all"
													>
														✕
													</button>
												)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* ── ALERTAS RECENTES ── */}
			<div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
				<div className="p-5 border-b border-gray-200 flex items-center justify-between">
					<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px]">
						ALERTAS RECENTES
					</h2>
					<Link
						href="/admin/notificacoes"
						className="font-['Barlow_Condensed'] text-xs font-bold tracking-widest uppercase px-4 py-2 border-2 border-gray-200 rounded hover:border-black hover:bg-gray-50 transition-all"
					>
						Ver Todos →
					</Link>
				</div>
				<div>
					{notifications.length === 0 ? (
						<div className="py-12 text-center text-sm text-gray-400 font-semibold">
							Nenhuma notificação ainda.
						</div>
					) : (
						notifications.slice(0, 5).map((n) => (
							<div
								key={n.id}
								className={`flex items-start gap-3 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${!n.read ? "bg-red-50/40" : ""}`}
							>
								<div
									className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${
										n.type === "new"
											? "bg-red-100"
											: n.type === "cancel"
												? "bg-yellow-100"
												: "bg-green-100"
									}`}
								>
									{n.type === "new" ? "🆕" : n.type === "cancel" ? "❌" : "✅"}
								</div>
								<div className="flex-1 min-w-0">
									<div className="text-sm font-bold">{n.title}</div>
									<div className="text-xs text-gray-500 mt-0.5 truncate">{n.description}</div>
									<div className="text-xs text-gray-400 mt-1">{formatTimeAgo(n.created_at)}</div>
								</div>
								{!n.read && <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0" />}
							</div>
						))
					)}
				</div>
			</div>

			{/* ── TOAST ── */}
			{toast && (
				<div
					className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded font-semibold text-sm text-white z-50 whitespace-nowrap shadow-lg transition-all ${
						toast.error ? "bg-red-500" : "bg-[#0a0a0a]"
					}`}
				>
					{toast.msg}
				</div>
			)}
		</>
	);
}
