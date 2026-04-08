"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatPhone, formatBRLCurrency } from "@/utils/format";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { DataTable } from "@/components/ui/DataTable";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import ActionButton from "@/components/admin/ActionButton";
import {
	Search,
	MessageCircleMore,
	Check,
	CheckCheck,
	X,
	Loader2,
} from "lucide-react";

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

type StatusFilter = "all" | "pending" | "confirmed" | "done" | "cancelled";

// ─── HELPERS ─────────────────────────────────────────────
function buildWALink(phone: string, name: string) {
	const p = phone?.replace(/\D/g, "") || "";
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

// Botão de ação

function isOlderThan2Days(dateStr: string) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const apptDate = new Date(dateStr + "T00:00:00");
	const diffDays = (today.getTime() - apptDate.getTime()) / (1000 * 3600 * 24);
	return diffDays > 2;
}

const columnHelper = createColumnHelper<Appointment>();

// ─── COMPONENT ───────────────────────────────────────────
export default function AgendamentosPage() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);

	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [searchQuery, setSearchQuery] = useState("");

	const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] =
		useState<Appointment | null>(null);
	const [cancelling, setCancelling] = useState(false);

	const supabase = createClient();

	const showToast = useCallback((msg: string, error = false) => {
		setToast({ msg, error });
		setTimeout(() => setToast(null), 5000);
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			const { data: appts } = await supabase
				.from("appointments")
				.select("*")
				.order("date", { ascending: false })
				.order("time", { ascending: false });

			if (appts) setAppointments(appts);
			setLoading(false);
		};

		fetchData();

		const channel = supabase
			.channel("agendamentos-live")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "appointments" },
				(payload) => {
					const a = payload.new as Appointment;
					setAppointments((prev) => [a, ...prev]);
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
		setSelectedAppointment(appt);
		setIsModalOpen(true);
	}, []);

	async function confirmCancellation() {
		if (!selectedAppointment) return;
		setCancelling(true);
		await changeStatus(selectedAppointment.id, "cancelled");
		setCancelling(false);
		setIsModalOpen(false);
		setSelectedAppointment(null);
	}

	// TODO: Removido temporariamente
	// const handleDownloadCSV = () => {
	// 	if (filtered.length === 0) return;
	// 	const headers = [
	// 		"Cliente",
	// 		"Telefone",
	// 		"Barbeiro",
	// 		"Serviço",
	// 		"Data",
	// 		"Hora",
	// 		"Total",
	// 		"Status",
	// 	];
	// 	const rows = filtered.map((a) => [
	// 		a.client_name,
	// 		a.client_phone,
	// 		a.barber_name,
	// 		`"${a.service_names}"`,
	// 		a.date,
	// 		a.time,
	// 		a.total,
	// 		STATUS_LABEL[a.status] || a.status,
	// 	]);

	// 	const csvContent =
	// 		"data:text/csv;charset=utf-8," +
	// 		[headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
	// 	const encodedUri = encodeURI(csvContent);
	// 	const link = document.createElement("a");
	// 	link.setAttribute("href", encodedUri);
	// 	link.setAttribute("download", "agendamentos.csv");
	// 	document.body.appendChild(link);
	// 	link.click();
	// 	document.body.removeChild(link);
	// };

	// ── Derived state ──────────────────────────────────────
	const filtered = appointments.filter((a) => {
		if (statusFilter !== "all") {
			if (a.status !== statusFilter || isOlderThan2Days(a.date)) {
				return false;
			}
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			const matches =
				a.client_name?.toLowerCase().includes(q) ||
				a.barber_name?.toLowerCase().includes(q) ||
				a.client_phone?.toLowerCase().includes(q) ||
				a.service_names?.toLowerCase().includes(q);
			if (!matches) {
				return false;
			}
		}
		return true;
	});

	const FILTERS: { value: StatusFilter; label: string }[] = [
		{ value: "all", label: "Todos" },
		{ value: "confirmed", label: "Confirmados" },
		{ value: "pending", label: "Pendentes" },
		{ value: "done", label: "Concluídos" },
		{ value: "cancelled", label: "Cancelados" },
	];

	// ── COLUMNS CONFIG ──────────────────────────────────────────────
	const columns = useMemo(
		() => [
			columnHelper.accessor("client_name", {
				header: "Cliente",
				cell: (info) => {
					const appointment = info.row.original;
					const old = isOlderThan2Days(appointment.date);
					return (
						<div className={`flex items-center gap-3 ${old ? "opacity-60 grayscale" : ""}`}>
							<div className="flex shrink-0 items-center justify-center w-[40px] h-[40px] rounded-full bg-[#0a0a0a] text-white font-['Bebas_Neue'] text-lg">
								{appointment.client_name
									.split(" ")
									.map((w) => w[0])
									.join("")
									.slice(0, 2)}
							</div>
							<div>
								<p className="font-semibold leading-tight capitalize text-[#0a0a0a] font-['Barlow']">
									{appointment.client_name}
								</p>
								<p className="text-[11px] text-[#888] font-medium pt-0.5">
									{formatPhone(appointment.client_phone)}
								</p>
							</div>
						</div>
					);
				},
			}),
			columnHelper.accessor("barber_name", {
				header: "Barbeiro",
				cell: (info) => {
					const old = isOlderThan2Days(info.row.original.date);
					return (
						<span className={`font-semibold text-[#0a0a0a] ${old ? "opacity-60" : ""}`}>
							{info.getValue()}
						</span>
					);
				},
			}),
			columnHelper.accessor("service_names", {
				header: "Serviço",
				cell: (info) => {
					const old = isOlderThan2Days(info.row.original.date);
					return (
						<div
							className={`max-w-[200px] text-[#888] text-[13px] font-medium ${old ? "opacity-60" : ""}`}
						>
							{info.getValue().split(",").join(", ")}
						</div>
					);
				},
			}),
			columnHelper.accessor("date", {
				header: "Data",
				cell: (info) => {
					const old = isOlderThan2Days(info.row.original.date);
					return (
						<span className={`font-bold text-[13px] ${old ? "opacity-60" : ""}`}>
							{info.getValue().split("-").reverse().join("/")}
						</span>
					);
				},
			}),
			columnHelper.accessor("time", {
				header: "Hora",
				cell: (info) => {
					const old = isOlderThan2Days(info.row.original.date);
					return (
						<span className={`font-bold text-[13px] ${old ? "opacity-60" : ""}`}>
							{info.getValue()}
						</span>
					);
				},
			}),
			columnHelper.accessor("total", {
				header: "Total",
				cell: (info) => {
					const old = isOlderThan2Days(info.row.original.date);
					return (
						<span
							className={`font-['Bebas_Neue'] text-lg text-[#0a0a0a] ${old ? "opacity-60" : ""}`}
						>
							{formatBRLCurrency(Number(info.getValue()))}
						</span>
					);
				},
			}),
			columnHelper.display({
				id: "status",
				header: "Status",
				cell: (info) => {
					const status = info.row.original.status;
					const old = isOlderThan2Days(info.row.original.date);
					return (
						<span
							className={`px-2 py-1 rounded text-xs font-semibold ${
								STATUS_CLASS[status] ?? "bg-gray-100 text-gray-500"
							} ${old && "opacity-70"}`}
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
					const old = isOlderThan2Days(appointment.date);
					return (
						<div
							className={`flex items-center gap-1.5 ${old && "pointer-events-none opacity-60 grayscale"}`}
						>
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
									disabled={old}
									onClick={() => handleCancelClick(appointment)}
									title="Cancelar"
									icon={<X size={16} />}
									className="text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white"
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
			<div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm">
				{/* header */}
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5">
					<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px] uppercase">
						TODOS OS AGENDAMENTOS
					</h2>
					{/* TODO: removido temporariamente */}
					{/* <button
						onClick={handleDownloadCSV}
						className="
							flex flex-row items-center gap-2
							px-4 py-2
							font-['Barlow_Condensed'] text-[11px] font-bold tracking-widest uppercase
							rounded border-2 border-[#e0e0e0]
							hover:border-[#0a0a0a] hover:bg-white
							transition-all bg-white
						"
					>
						<Download size={14} /> CSV
					</button> */}
				</div>

				{/* filtros e busca */}
				<div className="flex flex-col gap-4 border-b border-gray-100 bg-[#f9f9f9] px-5 py-4 md:flex-row md:items-center md:justify-between">
					<div className="flex flex-wrap gap-2">
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
										: "border-[#e0e0e0] bg-white text-gray-600 hover:border-black hover:text-black"
								}
								`}
							>
								{f.label}
							</button>
						))}
					</div>

					<div className="w-full md:w-64 relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
							<Search size={14} />
						</span>
						<input
							type="text"
							placeholder="Buscar agendamento..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-md border border-[#e0e0e0] py-2 pl-7 pr-3 text-sm focus:border-black focus:outline-none"
						/>
					</div>
				</div>

				{/* ── MOBILE CARD VIEW (< lg) ── */}
				<div className="divide-y divide-gray-200 lg:hidden block">
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
						filtered.map((appointment) => {
							const old = isOlderThan2Days(appointment.date);
							return (
								<div
									key={appointment.id}
									className={`
										flex flex-col gap-3 p-4 odd:bg-gray-50
										${["done", "cancelled"].includes(appointment.status) ? "opacity-50 cursor-not-allowed pointer-events-none" : ""} 
										${old ? "opacity-50 bg-gray-50" : ""}
									`}
								>
									<div className="flex items-center gap-3">
										<div className="flex-1 min-w-0">
											<p className="truncate text-sm font-bold capitalize">
												{appointment.client_name}
											</p>
											<p className="text-xs text-gray-500">{formatPhone(appointment.client_phone)}</p>
										</div>
										<div className="flex shrink-0 flex-col items-end gap-1">
											<span className="font-['Bebas_Neue'] text-base leading-none">
												{appointment.date.split("-").reverse().join("/")} às {appointment.time}h
											</span>
											<span
												className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_CLASS[appointment.status] ?? "bg-gray-100 text-gray-500"}`}
											>
												{STATUS_LABEL[appointment.status] ?? appointment.status}
											</span>
										</div>
									</div>

									<div className="flex items-center justify-between gap-2 py-2">
										<div className="min-w-0">
											<p className="truncate text-xs font-semibold">
												Barbeiro(a): {appointment.barber_name}
											</p>
											<p className="text-xs text-gray-500">
												{appointment.service_names.split(",").join(" + ")}
											</p>
										</div>
										<span className="shrink-0 font-['Bebas_Neue'] text-xl">
											{formatBRLCurrency(Number(appointment.total))}
										</span>
									</div>

									<div
										className={`flex gap-2 ${old && "pointer-events-none opacity-60 grayscale"}`}
									>
										{!["cancelled", "done"].includes(appointment.status) && (
											<ActionButton
												href={buildWALink(appointment.client_phone, appointment.client_name)}
												target="_blank"
												rel="noopener noreferrer"
												title="WhatsApp"
												icon={<MessageCircleMore size={16} />}
												mobileActionBtn
												className="hover:border-green-500 hover:bg-green-500 hover:text-white"
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
							);
						})
					)}
				</div>

				{/* ── DESKTOP TABELA (>= lg) ── */}
				<div className="hidden lg:block border-t border-gray-100">
					<DataTable
						data={filtered}
						columns={columns as ColumnDef<Appointment, unknown>[]}
						loading={loading}
					/>
				</div>
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
