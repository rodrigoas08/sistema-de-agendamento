"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatPhone } from "@/utils/format";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

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
	pending: "bg-yellow-100 text-yellow-800",
	confirmed: "bg-green-100 text-green-800",
	done: "bg-gray-100 text-gray-800",
	cancelled: "bg-red-100 text-red-800",
};

// Botão de ação
const actionBtn =
	"flex items-center justify-center w-8 h-8 rounded border-2 border-gray-200 text-sm transition-all";

function isOlderThan2Days(dateStr: string) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const apptDate = new Date(dateStr + "T00:00:00");
	const diffDays = (today.getTime() - apptDate.getTime()) / (1000 * 3600 * 24);
	return diffDays > 2;
}

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

	function handleCancelClick(appt: Appointment) {
		setSelectedAppointment(appt);
		setIsModalOpen(true);
	}

	async function confirmCancellation() {
		if (!selectedAppointment) return;
		setCancelling(true);
		await changeStatus(selectedAppointment.id, "cancelled");
		setCancelling(false);
		setIsModalOpen(false);
		setSelectedAppointment(null);
	}

	const handleDownloadCSV = () => {
		if (filtered.length === 0) return;
		const headers = [
			"Cliente",
			"Telefone",
			"Barbeiro",
			"Serviço",
			"Data",
			"Hora",
			"Total",
			"Status",
		];
		const rows = filtered.map((a) => [
			a.client_name,
			a.client_phone,
			a.barber_name,
			`"${a.service_names}"`,
			a.date,
			a.time,
			a.total,
			STATUS_LABEL[a.status] || a.status,
		]);

		const csvContent =
			"data:text/csv;charset=utf-8," +
			[headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "agendamentos.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// ── Derived state ──────────────────────────────────────
	const filtered = useMemo(() => {
		let result = appointments;
		if (statusFilter !== "all") {
			result = result.filter((a) => {
				const old = isOlderThan2Days(a.date);
				return a.status === statusFilter && !old;
			});
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(a) =>
					a.client_name?.toLowerCase().includes(q) ||
					a.barber_name?.toLowerCase().includes(q) ||
					a.client_phone?.toLowerCase().includes(q) ||
					a.service_names?.toLowerCase().includes(q),
			);
		}
		return result;
	}, [appointments, statusFilter, searchQuery]);

	const FILTERS: { value: StatusFilter; label: string }[] = [
		{ value: "all", label: "Todos" },
		{ value: "confirmed", label: "Confirmados" },
		{ value: "pending", label: "Pendentes" },
		{ value: "done", label: "Concluídos" },
		{ value: "cancelled", label: "Cancelados" },
	];

	// ─── RENDER ───────────────────────────────────────────
	return (
		<>
			<div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm">
				{/* header */}
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5">
					<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px] uppercase">
						TODOS OS AGENDAMENTOS
					</h2>
					<button
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
						⬇ CSV
					</button>
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
							🔍
						</span>
						<input
							type="text"
							placeholder="Buscar agendamento..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-md border border-[#e0e0e0] py-2 pl-9 pr-3 text-sm focus:border-black focus:outline-none"
						/>
					</div>
				</div>

				{/* ── MOBILE CARD VIEW (< lg) ── */}
				<div className="divide-y divide-gray-200 lg:hidden block">
					{loading ? (
						<p className="py-10 text-center text-sm text-gray-400">Carregando...</p>
					) : filtered.length === 0 ? (
						<p className="py-10 text-center text-sm font-semibold text-gray-400">
							Nenhum agendamento encontrado.
						</p>
					) : (
						filtered.map((a) => {
							const old = isOlderThan2Days(a.date);
							return (
								<div
									key={a.id}
									className={`flex flex-col gap-3 p-4 ${old ? "opacity-50 grayscale bg-gray-50" : ""}`}
								>
									<div className="flex items-center gap-3">
										<div className="flex-1 min-w-0">
											<p className="truncate text-sm font-bold capitalize">{a.client_name}</p>
											<p className="text-xs text-gray-500">{formatPhone(a.client_phone)}</p>
										</div>
										<div className="flex shrink-0 flex-col items-end gap-1">
											<span className="font-['Bebas_Neue'] text-base leading-none">
												{a.date.split("-").reverse().join("/")} às {a.time}h
											</span>
											<span
												className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_CLASS[a.status] ?? "bg-gray-100 text-gray-500"}`}
											>
												{STATUS_LABEL[a.status] ?? a.status}
											</span>
										</div>
									</div>

									<div className="flex items-center justify-between gap-2 py-2">
										<div className="min-w-0">
											<p className="truncate text-xs font-semibold">Barbeiro: {a.barber_name}</p>
											<p className="text-xs text-gray-500">
												{a.service_names.split(",").join(" + ")}
											</p>
										</div>
										<span className="shrink-0 font-['Bebas_Neue'] text-xl">
											R${Number(a.total ?? 0).toFixed(0)}
										</span>
									</div>

									<div className="flex gap-2">
										<button
											disabled={old}
											onClick={() => {
												if (!old) window.open(buildWALink(a.client_phone, a.client_name), "_blank");
											}}
											className="flex-1 items-center justify-center py-2 rounded border-2 border-gray-200 font-['Barlow_Condensed'] text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-500 hover:bg-green-50"
										>
											💬 WhatsApp
										</button>
										{a.status === "pending" && (
											<button
												disabled={old}
												onClick={() => !old && changeStatus(a.id, "confirmed")}
												className="flex-1 items-center justify-center py-2 rounded border-2 border-gray-200 font-['Barlow_Condensed'] text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-500 hover:bg-green-50"
											>
												✅ Confirmar
											</button>
										)}
										{a.status === "confirmed" && (
											<button
												disabled={old}
												onClick={() => !old && changeStatus(a.id, "done")}
												className="flex-1 items-center justify-center py-2 rounded border-2 border-gray-200 font-['Barlow_Condensed'] text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-black hover:bg-gray-50"
											>
												✓ Concluir
											</button>
										)}
										{!["cancelled", "done"].includes(a.status) && (
											<button
												disabled={old}
												onClick={() => !old && handleCancelClick(a)}
												className="flex-1 items-center justify-center py-2 rounded border-2 border-gray-200 font-['Barlow_Condensed'] text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-500 hover:bg-red-50"
											>
												✕
											</button>
										)}
									</div>
								</div>
							);
						})
					)}
				</div>

				{/* ── DESKTOP TABELA (>= lg) ── */}
				<div className="hidden overflow-x-auto lg:block">
					<table className="w-full border-collapse text-left">
						<thead>
							<tr className="bg-[#f9f9f9] border-b-2 border-gray-100">
								{[
									"Cliente",
									"Barbeiro",
									"Serviço",
									"Data",
									"Hora",
									"Total",
									"Status",
									"Ações",
								].map((h) => (
									<th
										key={h}
										className="
											py-4 px-5
											font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase
											text-gray-400
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
									<td colSpan={8} className="py-10 text-center text-sm text-gray-400">
										Carregando...
									</td>
								</tr>
							) : filtered.length === 0 ? (
								<tr>
									<td
										colSpan={8}
										className="py-10 text-center text-sm font-semibold text-gray-400"
									>
										Nenhum agendamento encontrado.
									</td>
								</tr>
							) : (
								filtered.map((a) => {
									const old = isOlderThan2Days(a.date);

									return (
										<tr
											key={a.id}
											className={`border-b border-gray-100 text-sm hover:bg-gray-50 bg-white ${old ? "opacity-60 bg-gray-50 grayscale" : ""}`}
										>
											{/* Cliente */}
											<td className="py-4 px-5">
												<div className="flex items-center gap-3">
													<div className="flex shrink-0 items-center justify-center w-[40px] h-[40px] rounded-full bg-[#0a0a0a] text-white font-['Bebas_Neue'] text-lg">
														{a.client_name
															.split(" ")
															.map((w) => w[0])
															.join("")
															.slice(0, 2)}
													</div>
													<div>
														<p className="font-semibold leading-tight capitalize text-[#0a0a0a] font-['Barlow']">
															{a.client_name}
														</p>
														<p className="text-[11px] text-[#888] font-medium pt-0.5">
															{formatPhone(a.client_phone)}
														</p>
													</div>
												</div>
											</td>
											{/* Barbeiro */}
											<td className="py-4 px-5 font-semibold text-[#0a0a0a]">{a.barber_name}</td>
											{/* Serviço */}
											<td className="max-w-[200px] py-4 px-5 text-[#888] text-[13px] font-medium">
												{a.service_names.split(",").join(", ")}
											</td>
											{/* Data */}
											<td className="py-4 px-5 font-bold text-[13px]">
												{a.date.split("-").reverse().join("/")}
											</td>
											{/* Hora */}
											<td className="py-4 px-5 font-bold text-[13px]">{a.time}</td>
											{/* Total */}
											<td className="py-4 px-5 font-['Bebas_Neue'] text-lg text-[#0a0a0a]">
												R${Number(a.total ?? 0).toFixed(0)}
											</td>
											{/* Status */}
											<td className="py-4 px-5">
												<span
													className={`px-2 py-[2px] rounded text-[10px] font-bold font-['Barlow_Condensed'] uppercase tracking-[1px] ${STATUS_CLASS[a.status] ?? "bg-gray-100 text-gray-500"}`}
												>
													⏳ {STATUS_LABEL[a.status] ?? a.status}
												</span>
											</td>
											{/* Ações */}
											<td className="py-4 px-5">
												<div
													className={`flex items-center gap-1.5 ${old ? "pointer-events-none" : ""}`}
												>
													<a
														href={old ? "#" : buildWALink(a.client_phone, a.client_name)}
														target={old ? undefined : "_blank"}
														rel={old ? undefined : "noopener noreferrer"}
														title="WhatsApp"
														className={`${actionBtn} ${old ? "" : "hover:border-green-500 hover:bg-green-50"} text-[#a0a0a0]`}
													>
														💬
													</a>
													<button
														disabled={old}
														onClick={(e) => {
															if (!old) {
																const btn = e.currentTarget;
																changeStatus(a.id, "confirmed");
															}
														}}
														title="Confirmar"
														className={`${actionBtn} ${old ? "" : "hover:border-green-500 hover:bg-green-50 text-green-500"}`}
													>
														✅
													</button>
													{!["cancelled", "done"].includes(a.status) && (
														<button
															disabled={old}
															onClick={() => !old && handleCancelClick(a)}
															title="Cancelar"
															className={`${actionBtn} ${old ? "" : "hover:border-red-500 hover:bg-red-50"} font-bold text-[#888]`}
														>
															✕
														</button>
													)}
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
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
