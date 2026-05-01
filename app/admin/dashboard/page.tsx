"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { formatBRLCurrency, formatPhone } from "@/utils/format";
import { DataTable } from "@/components/ui/DataTable";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import AppointmentsChart from "@/components/admin/AppointmentsChart";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import ActionButton from "@/components/admin/ActionButton";
import {
	CalendarCheck2Icon,
	MoveRight,
	MessageCircleMore,
	Check,
	X,
	CheckCheck,
	Loader2,
} from "lucide-react";
import { useBarbershopContext } from "@/providers/BarbershopProvider";

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
	confirmed: "bg-[#5DBE3F] text-black/80",
	done: "bg-[#79B6EB] text-black/80",
	cancelled: "bg-[#FF0000] text-black/80",
};

const columnHelper = createColumnHelper<Appointment>();

// ─── COMPONENT ───────────────────────────────────────────
export default function DashboardPage() {
	const { barbershopId } = useBarbershopContext();
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedAppointment, setselectedAppointment] =
		useState<Appointment | null>(null);
	const [cancelling, setCancelling] = useState(false);
	const supabase = createClient();

	const showToast = useCallback((msg: string, error = false) => {
		setToast({ msg, error });
		setTimeout(() => setToast(null), 5000);
	}, []);

	useEffect(() => {
		const today = new Date().toISOString().split("T")[0];

		const fetchData = async () => {
			if (!barbershopId) return;

			const [{ data: appts }, { data: notifs }] = await Promise.all([
				supabase
					.from("appointments")
					.select("*")
					.eq("barbershop_id", barbershopId)
					.eq("date", today)
					.order("time", { ascending: true }),
				supabase
					.from("notifications")
					.select("*")
					.eq("barbershop_id", barbershopId)
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
				{
					event: "INSERT",
					schema: "public",
					table: "appointments",
					filter: `barbershop_id=eq.${barbershopId}`,
				},
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
				{
					event: "UPDATE",
					schema: "public",
					table: "appointments",
					filter: `barbershop_id=eq.${barbershopId}`,
				},
				(payload) => {
					const a = payload.new as Appointment;
					setAppointments((prev) => prev.map((x) => (x.id === a.id ? a : x)));
				},
			)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "notifications",
					filter: `barbershop_id=eq.${barbershopId}`,
				},
				(payload) => {
					setNotifications((prev) => [payload.new as Notification, ...prev]);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, showToast]);

	const changeStatus = useCallback(
		async (id: string, status: Appointment["status"]) => {
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
		},
		[supabase, showToast],
	);

	const handleCancelClick = useCallback((appt: Appointment) => {
		setselectedAppointment(appt);
		setIsModalOpen(true);
	}, []);

	async function confirmCancellation() {
		if (!selectedAppointment) return;
		setCancelling(true);
		await changeStatus(selectedAppointment.id, "cancelled");
		setCancelling(false);
		setIsModalOpen(false);
		setselectedAppointment(null);
	}

	// ── Derived state ──────────────────────────────────────
	const today = new Date().toISOString().split("T")[0];
	const todayAppts = appointments.filter((a) => a.date === today);
	const pendingCount = todayAppts.filter((a) => a.status === "pending").length;
	const doneCount = todayAppts.filter((a) => a.status === "done").length;
	const cancelledCount = todayAppts.filter(
		(a) => a.status === "cancelled",
	).length;
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
			accent: "before:bg-black",
			text: "text-black",
		},
		{
			label: "PENDENTES",
			value: pendingCount,
			accent: "before:bg-yellow-500",
			text: "text-yellow-500",
		},
		{
			label: "CANCELADOS",
			value: cancelledCount,
			accent: "before:bg-red-500",
			text: "text-red-500",
		},
		{
			label: "CONFIRMADOS",
			value: confirmedCount,
			accent: "before:bg-green-500",
			text: "text-green-500",
		},
		{
			label: "CONCLUÍDOS",
			value: doneCount,
			accent: "before:bg-[#79B6EB]",
			text: "text-[#79B6EB]",
		},
		{
			label: "FATURAMENTO PARCIAL",
			value: formatBRLCurrency(revenue),
			accent: "before:bg-black",
			text: "text-black",
		},
	];

	// ── COLUMNS CONFIG ──────────────────────────────────────────────
	const columns = useMemo(
		() => [
			columnHelper.accessor("client_name", {
				header: "Cliente",
				cell: (info) => (
					<p className="font-semibold leading-tight capitalize">{info.getValue()}</p>
				),
			}),
			columnHelper.accessor("client_phone", {
				header: "Telefone",
				cell: (info) => (
					<span className="text-gray-400">{formatPhone(info.getValue())}</span>
				),
			}),
			columnHelper.accessor("barber_name", {
				header: "Barbeiro",
				cell: (info) => (
					<span className="font-semibold text-red-500">{info.getValue()}</span>
				),
			}),
			columnHelper.accessor("service_names", {
				header: "Serviço",
				cell: (info) => (
					<div className="max-w-[180px] text-gray-500">
						{info.getValue().split(",").join(" + ")}
					</div>
				),
			}),
			columnHelper.accessor("time", {
				header: "Hora",
				cell: (info) => <span className="font-bold">{info.getValue()}</span>,
			}),
			columnHelper.accessor("total", {
				header: "Total",
				cell: (info) => (
					<span className="font-['Bebas_Neue'] text-lg">
						{formatBRLCurrency(Number(info.getValue()))}
					</span>
				),
			}),
			columnHelper.display({
				id: "status",
				header: "Status",
				cell: (info) => {
					const status = info.row.original.status;
					return (
						<span
							className={`px-2 py-1 rounded text-xs font-semibold ${
								STATUS_CLASS[status] ?? "bg-gray-100 text-gray-500"
							}`}
						>
							{STATUS_LABEL[status] ?? status}
						</span>
					);
				},
			}),

			columnHelper.display({
				id: "actions",
				header: "Ações",
				cell: (info) => {
					const appointment = info.row.original;
					return (
						<div className="flex items-center gap-1.5 focus-within:opacity-100">
							{!["cancelled", "done"].includes(appointment.status) && (
								<ActionButton
									href={buildWALink(appointment.client_phone, appointment.client_name)}
									target="_blank"
									rel="noopener noreferrer"
									title="WhatsApp"
									icon={<MessageCircleMore size={16} />}
									className="hover:border-green-500 hover:bg-green-500 hover:text-white"
								/>
							)}

							{appointment.status === "pending" && (
								<ActionButton
									onClick={() => changeStatus(appointment.id, "confirmed")}
									title="Confirmar"
									icon={<Check size={16} />}
									className="text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-white"
								/>
							)}

							{appointment.status === "confirmed" && (
								<ActionButton
									onClick={() => changeStatus(appointment.id, "done")}
									title="Concluir"
									icon={<CheckCheck size={16} />}
									className="text-blue-500 hover:border-blue-500 hover:bg-blue-500 hover:text-white"
								/>
							)}

							{!["cancelled", "done"].includes(appointment.status) && (
								<ActionButton
									onClick={() => handleCancelClick(appointment)}
									title="Cancelar"
									icon={<X size={16} />}
									className="hover:border-red-500 hover:bg-red-500 hover:text-white"
								/>
							)}
						</div>
					);
				},
			}),
		],
		[changeStatus, handleCancelClick],
	);

	// ─── RENDER ───────────────────────────────────────────
	return (
		<>
			{/* ── STATS ── */}
			<div className="grid grid-cols-2 gap-4 mb-7 lg:grid-cols-6">
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
							flex items-center gap-1
							px-4 py-2
							font-['Barlow_Condensed'] text-xs font-bold tracking-widest uppercase
							rounded border-2 border-gray-200
							hover:border-black hover:bg-gray-50
							transition-all
						"
					>
						Ver Todos <MoveRight size={14} />
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
						<p className="py-10 flex items-center justify-center gap-2 text-sm text-gray-400">
							<Loader2 className="animate-spin" />
							Carregando agendamentos...
						</p>
					) : filtered.length === 0 ? (
						<p className="py-10 text-center text-sm font-semibold text-gray-400">
							Nenhum agendamento encontrado.
						</p>
					) : (
						filtered.map((appointment) => (
							<div
								key={appointment.id}
								className={`
									flex flex-col gap-3 p-4 odd:bg-gray-50
									${["done", "cancelled"].includes(appointment.status) ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
								`}
							>
								{/* linha 1 — avatar · nome · hora · status */}
								<div className="flex items-center gap-3">
									<div className="flex-1 min-w-0">
										<p className="truncate text-sm font-bold capitalize">
											Cliente: {appointment.client_name}
										</p>
										<p className="text-xs text-gray-500">
											Cel: {formatPhone(appointment.client_phone)}
										</p>
									</div>

									<div className="flex shrink-0 flex-col items-end gap-1">
										<span className="font-['Bebas_Neue'] text-base leading-none">
											{appointment.time}h
										</span>
										<span
											className={`
											px-2 py-0.5
											rounded
											text-[10px] font-bold
											${STATUS_CLASS[appointment.status] ?? "bg-gray-100 text-gray-500"}
										`}
										>
											{STATUS_LABEL[appointment.status] ?? appointment.status}
										</span>
									</div>
								</div>

								{/* linha 2 — barbeiro · serviço · total */}
								<div className="flex items-center justify-between gap-2 py-2 rounded-lg">
									<div className="min-w-0">
										<p className="truncate text-xs font-semibold">
											<span className="">Barbeiro(a):</span> {appointment.barber_name}
										</p>
										<p className="text-xs text-gray-500">
											Serviço: {appointment.service_names.split(",").join(" + ")}
										</p>
									</div>
									<span className="shrink-0 font-['Bebas_Neue'] text-xl">
										{formatBRLCurrency(appointment.total ?? 0)}
									</span>
								</div>

								{/* linha 3 — ações */}
								<div className="flex gap-2">
									{!["cancelled", "done"].includes(appointment.status) && (
										<ActionButton
											href={buildWALink(appointment.client_phone, appointment.client_name)}
											target="_blank"
											rel="noopener noreferrer"
											title="WhatsApp"
											icon={<MessageCircleMore size={16} />}
											mobileActionBtn
											className="text-black hover:border-green-500 hover:bg-green-500 hover:text-white"
										>
											WhatsApp
										</ActionButton>
									)}

									{appointment.status === "pending" && (
										<ActionButton
											onClick={() => changeStatus(appointment.id, "confirmed")}
											title="Confirmar"
											icon={<Check size={16} />}
											mobileActionBtn
											className="text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-white"
										>
											Confirmar
										</ActionButton>
									)}

									{appointment.status === "confirmed" && (
										<ActionButton
											onClick={() => changeStatus(appointment.id, "done")}
											title="Concluir"
											icon={<CheckCheck size={16} />}
											mobileActionBtn
											className="text-blue-500 hover:border-blue-500 hover:bg-blue-500 hover:text-white"
										>
											Concluir
										</ActionButton>
									)}

									{!["cancelled", "done"].includes(appointment.status) && (
										<ActionButton
											onClick={() => handleCancelClick(appointment)}
											title="Cancelar"
											icon={<X size={16} />}
											mobileActionBtn
											className="text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white"
										>
											Cancelar
										</ActionButton>
									)}
								</div>
							</div>
						))
					)}
				</div>

				{/* ── DESKTOP: tabela (>= md) ── */}
				<div className="hidden md:block border-t border-gray-100">
					<DataTable
						data={filtered}
						loading={loading}
						columns={columns as ColumnDef<Appointment, unknown>[]}
						getRowClassName={(a) =>
							["done", "cancelled"].includes(a.status)
								? "opacity-50 cursor-not-allowed pointer-events-none"
								: ""
						}
					/>
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
							flex items-center gap-1
							px-4 py-2
							font-['Barlow_Condensed'] text-xs font-bold tracking-widest uppercase
							rounded border-2 border-gray-200
							hover:border-black hover:bg-gray-50
							transition-all
						"
					>
						Ver Todos <MoveRight size={14} />
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
								w-8 h-8
								rounded-full text-base
								${n.type === "new" ? "bg-red-100" : n.type === "cancel" ? "bg-yellow-100" : "bg-green-400"}
							`}
							>
								{n.type === "new" ? (
									"🆕"
								) : n.type === "cancel" ? (
									"❌"
								) : (
									<CalendarCheck2Icon size={18} className="text-white" />
								)}
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
					fixed top-6 left-1/2 z-50
					-translate-x-1/2
					px-6 py-3
					rounded
					text-sm font-semibold text-white whitespace-nowrap
					shadow-lg transition-all
					${toast.error ? "bg-red-500" : "bg-blue-700"}
				`}
				>
					{toast.msg}
				</div>
			)}

			<ConfirmationModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onConfirm={confirmCancellation}
				loading={cancelling}
				title={`Cancelar agendamento de ${selectedAppointment?.client_name}`}
				subtitle="Tem certeza que deseja cancelar?"
				confirmText="Confirmar"
			/>
		</>
	);
}
