"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { formatPhone } from "@/utils/format";
import AppointmentsChart from "@/components/admin/AppointmentsChart";

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
		`Olá ${name}! 👋 Passando para confirmar seu agendamento.`,
	)}`;
}

const STATUS_LABEL: Record<string, string> = {
	pending: "Pendente",
	confirmed: "Confirmado",
	done: "Concluído",
	cancelled: "Cancelado",
};

const STATUS_CLASS: Record<string, string> = {
	pending: "bg-yellow-400 text-black/80",
	confirmed: "bg-green-400 text-black/80",
	done: "bg-gray-400 text-black/80",
	cancelled: "bg-red-400 text-black/80",
};

// Botão de ação reutilizável — ordem: layout > box > visual > interativo
const actionBtn =
	"flex items-center justify-center w-8 h-8 rounded border-2 border-gray-200 text-sm transition-all";

const mobileActionBtn =
	"flex flex-1 items-center justify-center gap-1.5 py-2 rounded border-2 border-gray-200 font-['Barlow_Condensed'] text-xs font-bold tracking-wide transition-all";

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

	// ── Derived state ──────────────────────────────────────
	const today = new Date().toISOString().split("T")[0];
	const todayAppts = appointments.filter((a) => a.date === today);
	const pendingCount = todayAppts.filter((a) => a.status === "pending").length;
	const confirmedCount = todayAppts.filter(
		(a) => a.status === "confirmed",
	).length;
	const revenue = appointments
		.filter((a) => a.status !== "cancelled")
		.reduce((s, a) => s + Number(a.total ?? 0), 0);

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

	const STATS = [
		{
			label: "HOJE",
			value: todayAppts.length,
			accent: "before:bg-red-500",
			text: "text-red-500",
		},
		{
			label: "PENDENTES",
			value: pendingCount,
			accent: "before:bg-yellow-500",
			text: "text-yellow-500",
		},
		{
			label: "CONFIRMADOS",
			value: confirmedCount,
			accent: "before:bg-green-500",
			text: "text-green-500",
		},
		{
			label: "FATURAMENTO",
			value: `R$${revenue.toFixed(0)}`,
			accent: "before:bg-black",
			text: "text-black",
		},
	];

	// ─── RENDER ───────────────────────────────────────────
	return (
		<>
			{/* ── STATS ── */}
			<div className="grid grid-cols-2 gap-4 mb-7 lg:grid-cols-4">
				{STATS.map((s) => (
					<div
						key={s.label}
						className={`
							relative overflow-hidden
							p-5
							rounded-xl border-2 border-gray-200 bg-white
							before:absolute before:top-0 before:left-0 before:right-0 before:h-1
							${s.accent}
						`}
					>
						<p className="mb-2 font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500">
							{s.label}
						</p>
						<p className={`font-['Bebas_Neue'] text-4xl leading-none ${s.text}`}>
							{s.value}
						</p>
					</div>
				))}
			</div>

			{/* ── GRÁFICO ── */}
			<AppointmentsChart />

			{/* ── AGENDAMENTOS DE HOJE ── */}
			<div className="mb-6 overflow-hidden rounded-xl border-2 border-gray-200 bg-white">
				{/* header */}
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5">
					<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px]">
						AGENDAMENTOS DE HOJE
					</h2>
					<Link
						href="/admin/agendamentos"
						className="
							px-4 py-2
							font-['Barlow_Condensed'] text-xs font-bold tracking-widest uppercase
							rounded border-2 border-gray-200
							hover:border-black hover:bg-gray-50
							transition-all
						"
					>
						Ver Todos →
					</Link>
				</div>

				{/* filtros */}
				<div className="flex flex-wrap gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
					{FILTERS.map((f) => (
						<button
							key={f.value}
							onClick={() => setStatusFilter(f.value)}
							className={`
								px-3 py-1.5
								font-['Barlow_Condensed'] text-xs font-bold tracking-wider uppercase
								rounded border
								transition-all
								${
								statusFilter === f.value
									? "border-black bg-black text-white"
									: "border-gray-200 bg-white text-gray-600 hover:border-black hover:text-black"
							}
							`}
						>
							{f.label}
						</button>
					))}
				</div>

				{/* ── MOBILE: cards (< md) ── */}
				<div className="divide-y divide-gray-200 md:hidden">
					{loading ? (
						<p className="py-10 text-center text-sm text-gray-400">Carregando...</p>
					) : filtered.length === 0 ? (
						<p className="py-10 text-center text-sm font-semibold text-gray-400">
							Nenhum agendamento encontrado.
						</p>
					) : (
						filtered.map((a) => (
							<div key={a.id} className="flex flex-col gap-3 p-4">
								{/* linha 1 — avatar · nome · hora · status */}
								<div className="flex items-center gap-3">
									<div className="flex-1 min-w-0">
										<p className="truncate text-sm font-bold capitalize">
											Cliente: {a.client_name}
										</p>
										<p className="text-xs text-gray-500">Cel: {formatPhone(a.client_phone)}</p>
									</div>

									<div className="flex shrink-0 flex-col items-end gap-1">
										<span className="font-['Bebas_Neue'] text-base leading-none">{a.time}h</span>
										<span
											className={`
											px-2 py-0.5
											rounded
											text-[10px] font-bold
											${STATUS_CLASS[a.status] ?? "bg-gray-100 text-gray-500"}
										`}
										>
											{STATUS_LABEL[a.status] ?? a.status}
										</span>
									</div>
								</div>

								{/* linha 2 — barbeiro · serviço · total */}
								<div className="flex items-center justify-between gap-2 py-2 rounded-lg">
									<div className="min-w-0">
										<p className="truncate text-xs font-semibold">
											<span className="">Barbeiro(a):</span> {a.barber_name}
										</p>
										<p className="text-xs text-gray-500">
											Serviço: {a.service_names.split(",").join(" + ")}
										</p>
									</div>
									<span className="shrink-0 font-['Bebas_Neue'] text-xl">
										R${Number(a.total ?? 0).toFixed(0)}
									</span>
								</div>

								{/* linha 3 — ações */}
								<div className="flex gap-2">
									<a
										href={buildWALink(a.client_phone, a.client_name)}
										target="_blank"
										rel="noopener noreferrer"
										className={`${mobileActionBtn} hover:border-green-500 hover:bg-green-50`}
									>
										💬 WhatsApp
									</a>
									{a.status === "pending" && (
										<button
											onClick={() => changeStatus(a.id, "confirmed")}
											className={`${mobileActionBtn} hover:border-green-500 hover:bg-green-50`}
										>
											✅ Confirmar
										</button>
									)}
									{a.status === "confirmed" && (
										<button
											onClick={() => changeStatus(a.id, "done")}
											className={`${mobileActionBtn} hover:border-black hover:bg-gray-50`}
										>
											✓ Concluir
										</button>
									)}
									{!["cancelled", "done"].includes(a.status) && (
										<button
											onClick={() => changeStatus(a.id, "cancelled")}
											className="
												flex items-center justify-center
												px-3 py-2
												rounded border-2 border-gray-200
												text-xs font-bold
												hover:border-red-500 hover:bg-red-50
												transition-all
											"
										>
											✕
										</button>
									)}
								</div>
							</div>
						))
					)}
				</div>

				{/* ── DESKTOP: tabela (>= md) ── */}
				<div className="hidden overflow-x-auto md:block">
					<table className="w-full border-collapse text-left">
						<thead>
							<tr className="bg-gray-100">
								{[
									"Cliente",
									"Telefone",
									"Barbeiro",
									"Serviço",
									"Hora",
									"Total",
									"Status",
									"Ações",
								].map((h) => (
									<th
										key={h}
										className="
											border-b-2 border-gray-100 py-3 px-5
											font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase
											text-gray-500
										"
									>
										{h}
									</th>
								))}
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
										className="py-10 text-center text-sm font-semibold text-gray-400"
									>
										Nenhum agendamento encontrado.
									</td>
								</tr>
							) : (
								filtered.map((a) => (
									<tr key={a.id} className="border-b border-gray-100 text-sm hover:bg-gray-50">
										{/* Cliente */}
										<td className="py-3 px-5">
											<p className="font-semibold leading-tight capitalize">{a.client_name}</p>
										</td>
										{/* Telefone */}
										<td className="py-3 px-5 text-gray-400">{formatPhone(a.client_phone)}</td>
										{/* Barbeiro */}
										<td className="py-3 px-5 font-semibold text-red-500">{a.barber_name}</td>
										{/* Serviço */}
										<td className="max-w-[180px] py-3 px-5 text-gray-500">
											{a.service_names.split(",").join(" + ")}
										</td>
										{/* Hora */}
										<td className="py-3 px-5 font-bold">{a.time}</td>
										{/* Total */}
										<td className="py-3 px-5 font-['Bebas_Neue'] text-lg">
											R${Number(a.total ?? 0).toFixed(0)}
										</td>
										{/* Status */}
										<td className="py-3 px-5">
											<span
												className={`
												px-2 py-1
												rounded
												text-xs font-semibold
												${STATUS_CLASS[a.status] ?? "bg-gray-100 text-gray-500"}
											`}
											>
												{STATUS_LABEL[a.status] ?? a.status}
											</span>
										</td>
										{/* Ações */}
										<td className="py-3 px-5">
											<div className="flex items-center gap-1.5">
												<a
													href={buildWALink(a.client_phone, a.client_name)}
													target="_blank"
													rel="noopener noreferrer"
													title="WhatsApp"
													className={`${actionBtn} hover:border-green-500 hover:bg-green-50`}
												>
													💬
												</a>
												{a.status === "pending" && (
													<button
														onClick={() => changeStatus(a.id, "confirmed")}
														title="Confirmar"
														className={`${actionBtn} hover:border-green-500 hover:bg-green-50`}
													>
														✅
													</button>
												)}
												{a.status === "confirmed" && (
													<button
														onClick={() => changeStatus(a.id, "done")}
														title="Concluir"
														className={`${actionBtn} hover:border-black hover:bg-gray-50`}
													>
														✓
													</button>
												)}
												{!["cancelled", "done"].includes(a.status) && (
													<button
														onClick={() => changeStatus(a.id, "cancelled")}
														title="Cancelar"
														className={`${actionBtn} hover:border-red-500 hover:bg-red-50`}
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
			<div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white">
				{/* header */}
				<div className="flex items-center justify-between border-b border-gray-200 p-5">
					<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px]">
						ALERTAS RECENTES
					</h2>
					<Link
						href="/admin/notificacoes"
						className="
							px-4 py-2
							font-['Barlow_Condensed'] text-xs font-bold tracking-widest uppercase
							rounded border-2 border-gray-200
							hover:border-black hover:bg-gray-50
							transition-all
						"
					>
						Ver Todos →
					</Link>
				</div>

				{/* lista */}
				{notifications.length === 0 ? (
					<p className="py-12 text-center text-sm font-semibold text-gray-400">
						Nenhuma notificação ainda.
					</p>
				) : (
					notifications.slice(0, 5).map((n) => (
						<div
							key={n.id}
							className={`
								flex items-start gap-3
								border-b border-gray-100 px-5 py-4 last:border-0
								transition-colors hover:bg-gray-50
								${!n.read ? "bg-red-50/40" : ""}
							`}
						>
							<div
								className={`
								flex shrink-0 items-center justify-center
								w-9 h-9
								rounded-full text-base
								${n.type === "new" ? "bg-red-100" : n.type === "cancel" ? "bg-yellow-100" : "bg-green-100"}
							`}
							>
								{n.type === "new" ? "🆕" : n.type === "cancel" ? "❌" : "✅"}
							</div>

							<div className="flex-1 min-w-0">
								<p className="text-sm font-bold">{n.title}</p>
								<p className="mt-0.5 truncate text-xs text-gray-500">{n.description}</p>
								<p className="mt-1 text-xs text-gray-400">{formatTimeAgo(n.created_at)}</p>
							</div>

							{!n.read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />}
						</div>
					))
				)}
			</div>

			{/* ── TOAST ── */}
			{toast && (
				<div
					className={`
					fixed bottom-6 left-1/2 z-50
					-translate-x-1/2
					px-6 py-3
					rounded
					text-sm font-semibold text-white whitespace-nowrap
					shadow-lg transition-all
					${toast.error ? "bg-red-500" : "bg-[#0a0a0a]"}
				`}
				>
					{toast.msg}
				</div>
			)}
		</>
	);
}
