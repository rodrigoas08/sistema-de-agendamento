"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Appointment = {
	id: string;
	time: string;
	client_name: string;
	service_names: string;
	barber_name: string;
	status: string;
	date: string;
};

type FeedItem = {
	id: string;
	message: string;
	time: string;
};

export default function AdminPage() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [feed, setFeed] = useState<FeedItem[]>([]);
	const [loading, setLoading] = useState(true);
	const supabase = createClient();

	useEffect(() => {
		const fetchInitialData = async () => {
			const today = new Date().toISOString().split("T")[0];
			const { data, error } = await supabase
				.from("appointments")
				.select("*")
				.eq("date", today)
				.order("time", { ascending: true });

			if (data) setAppointments(data);
			setLoading(false);
		};

		fetchInitialData();

		// Conecta ao Supabase Realtime
		const channel = supabase
			.channel("admin-appointments")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "appointments" },
				(payload) => {
					if (payload.eventType === "INSERT") {
						const newAppt = payload.new as Appointment;
						
						const today = new Date().toISOString().split("T")[0];
						if (newAppt.date === today) {
							setAppointments((prev) => {
								const updated = [...prev, newAppt];
								return updated.sort((a, b) => a.time.localeCompare(b.time));
							});
						}

						setFeed((prev) => [
							{
								id: newAppt.id,
								message: `Novo agendamento: ${newAppt.client_name} (${newAppt.service_names})`,
								time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
							},
							...prev,
						]);
					} else if (payload.eventType === "UPDATE") {
						const updatedAppt = payload.new as Appointment;
						setAppointments((prev) =>
							prev.map((appt) => (appt.id === updatedAppt.id ? updatedAppt : appt))
						);
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase]);

	const todayCount = appointments.length;
	const pendingCount = appointments.filter((a) => a.status === "pending").length;

	return (
		<div>
			{/* STATS */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<div className="bg-white border-2 border-gray-200 rounded-xl p-5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-red-500">
					<div className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 mb-2">AGENDAMENTOS HOJE</div>
					<div className="font-['Bebas_Neue'] text-4xl leading-none text-red-500">{todayCount}</div>
				</div>
				<div className="bg-white border-2 border-gray-200 rounded-xl p-5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-yellow-500">
					<div className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 mb-2">PENDENTES</div>
					<div className="font-['Bebas_Neue'] text-4xl leading-none text-yellow-500">{pendingCount}</div>
				</div>
				<div className="bg-white border-2 border-gray-200 rounded-xl p-5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-green-500">
					<div className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 mb-2">TAXA CONVERSÃO</div>
					<div className="font-['Bebas_Neue'] text-4xl leading-none text-green-500">100%</div>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				{/* TABELA DE AGENDAMENTOS */}
				<div className="xl:col-span-2 bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
					<div className="p-5 border-b border-gray-200 flex items-center justify-between">
						<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px]">PRÓXIMOS CORTES (HOJE)</h2>
					</div>
					
					<div className="overflow-x-auto w-full">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-gray-50">
									<th className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 py-3 px-5 border-b border-gray-200">HORÁRIO</th>
									<th className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 py-3 px-5 border-b border-gray-200">CLIENTE</th>
									<th className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 py-3 px-5 border-b border-gray-200">PROFISSIONAL / SERVIÇO</th>
									<th className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 py-3 px-5 border-b border-gray-200">STATUS</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr className="hover:bg-gray-50 border-b border-gray-100">
										<td className="py-5 px-5 text-center text-sm font-semibold text-gray-400" colSpan={4}>Carregando agendamentos...</td>
									</tr>
								) : appointments.length === 0 ? (
									<tr className="hover:bg-gray-50 border-b border-gray-100">
										<td className="py-5 px-5 text-center text-sm font-semibold text-gray-400" colSpan={4}>Nenhum agendamento para hoje.</td>
									</tr>
								) : (
									appointments.map((appt) => (
										<tr key={appt.id} className="hover:bg-gray-50 border-b border-gray-100">
											<td className="py-3 px-5 text-sm font-bold">{appt.time}</td>
											<td className="py-3 px-5 text-sm font-semibold">{appt.client_name}</td>
											<td className="py-3 px-5 text-sm">
												<span className="font-bold text-red-500">{appt.barber_name}</span> - {appt.service_names}
											</td>
											<td className="py-3 px-5 text-sm">
												<span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
													appt.status === "pending" ? "bg-yellow-100 text-yellow-700" :
													appt.status === "confirmed" ? "bg-green-100 text-green-700" :
													"bg-gray-100 text-gray-700"
												}`}>
													{appt.status}
												</span>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* LADO DIREITO (NOTIFICAÇÕES AO VIVO) */}
				<div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden flex flex-col h-[500px]">
					<div className="p-5 border-b border-gray-200 flex items-center justify-between">
						<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px] flex items-center gap-2">
							<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" /> 
							FEED AO VIVO
						</h2>
					</div>
					<div className="flex-1 overflow-y-auto w-full flex flex-col">
						{feed.length === 0 ? (
							<div className="p-10 text-center text-sm text-gray-400 font-semibold font-['Barlow_Condensed'] uppercase tracking-widest my-auto">
								Esperando novos eventos...
							</div>
						) : (
							feed.map((item) => (
								<div key={item.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
									<p className="text-sm font-semibold text-gray-800">{item.message}</p>
									<span className="text-xs text-gray-400">{item.time}</span>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
