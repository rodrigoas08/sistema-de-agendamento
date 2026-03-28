"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LoginButton from "@/components/ui/LoginButton";
import { createClient } from "@/utils/supabase/client";
import { formatPhone } from "@/utils/format";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Barber = {
	id: string;
	name: string;
	role: string;
	rating: number;
	total_cuts: number;
	badge?: string;
	color?: string;
	tags?: string[];
};
type Service = {
	id: string;
	name: string;
	price: number;
	duration: string;
	icon?: string;
};

const MONTHS = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];
const DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const ALL_SLOTS = [
	"09:00",
	"09:30",
	"10:00",
	"10:30",
	"11:00",
	"11:30",
	"14:00",
	"14:30",
	"15:00",
	"15:30",
	"16:00",
	"16:30",
	"17:00",
	"17:30",
	"18:00",
	"18:30",
	"19:00",
];

export default function Agendamento() {
	const supabase = createClient();
	const [step, setStep] = useState(1);

	const [barbers, setBarbers] = useState<Barber[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [busySlots, setBusySlots] = useState<string[]>([]);

	const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
	const [selectedServices, setSelectedServices] = useState<Service[]>([]);
	const [selectedDate, setSelectedDate] = useState("");
	const [selectedTime, setSelectedTime] = useState("");
	const [clientName, setClientName] = useState("");
	const [clientPhone, setClientPhone] = useState("");
	const [clientEmail, setClientEmail] = useState("");
	const [clientObs, setClientObs] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Calendar state
	const [calYear, setCalYear] = useState(new Date().getFullYear());
	const [calMonth, setCalMonth] = useState(new Date().getMonth());

	useEffect(() => {
		const loadInitialData = async () => {
			const [{ data: bData }, { data: sData }] = await Promise.all([
				supabase.from("barbers").select("*"),
				supabase.from("services").select("*"),
			]);
			if (bData) setBarbers(bData);
			if (sData) setServices(sData);
		};
		loadInitialData();
	}, [supabase]);

	useEffect(() => {
		if (selectedBarber && selectedDate) {
			const loadBusy = async () => {
				const { data } = await supabase
					.from("appointments")
					.select("time")
					.eq("date", selectedDate)
					.eq("barber_id", selectedBarber.id)
					.in("status", ["pending", "confirmed"]);
				if (data) setBusySlots(data.map((d) => d.time));
			};
			loadBusy();
		}
	}, [selectedDate, selectedBarber, supabase]);

	const totalServiceCost = selectedServices.reduce(
		(a, s) => a + Number(s.price),
		0,
	);

	const handleNext = (nextStep: number) => {
		setStep(nextStep);
		if (nextStep > 1) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const toggleService = (service: Service) => {
		setSelectedServices((prev) => {
			const exists = prev.find((s) => s.id === service.id);
			if (exists) return prev.filter((s) => s.id !== service.id);
			return [...prev, service];
		});
	};

	const changeMonth = (dir: number) => {
		let newM = calMonth + dir;
		let newY = calYear;
		if (newM > 11) {
			newM = 0;
			newY++;
		}
		if (newM < 0) {
			newM = 11;
			newY--;
		}
		setCalMonth(newM);
		setCalYear(newY);
	};

	const handleConfirm = async () => {
		if (
			!selectedBarber ||
			selectedServices.length === 0 ||
			!selectedDate ||
			!selectedTime ||
			!clientName ||
			!clientPhone
		)
			return;
		setIsSubmitting(true);

		const serviceNames = selectedServices.map((s) => s.name).join(", ");

		const { error } = await supabase.from("appointments").insert({
			barber_id: selectedBarber.id,
			barber_name: selectedBarber.name,
			service_names: serviceNames,
			date: selectedDate,
			time: selectedTime,
			client_name: clientName,
			client_phone: clientPhone,
			status: "pending",
		});

		setIsSubmitting(false);
		if (!error)
			handleNext(6); // Success screen is step 6 here
		else alert("Erro ao agendar. Tente novamente.");
	};

	// Calendar Generation Helper
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const firstDay = new Date(calYear, calMonth, 1).getDay();
	const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
	const blanks = Array.from({ length: firstDay }, (_, i) => i);
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

	return (
		<div className="font-['Barlow'] bg-white text-[#0a0a0a] min-h-dvh overflow-x-hidden">
			<header className="flex items-center justify-between h-16 px-4 md:px-18 lg:px-58 bg-[#0a0a0a] border-b-2 border-b-[#e63946] shrink-0 sticky top-0 z-50">
				<Link
					href="/"
					className="font-['Bebas_Neue'] text-[26px] text-white tracking-[3px] flex items-center gap-2.5 no-underline"
				>
					<span className="w-2.5 h-2.5 bg-[#e63946] rounded-full inline-block"></span>
					Seu<em className="text-[#e63946] italic">Negócio</em>
				</Link>
				<nav className="flex gap-2 items-center">
					<LoginButton />
				</nav>
			</header>

			<main id="booking" className="relative mx-auto mt-4 px-4 pb-24">
				{step <= 5 && (
					<>
						<div id="booking-head" className="max-w-[700px] mx-auto mb-8 text-center">
							<h2 className="font-['Bebas_Neue'] text-[34px] tracking-[2px] text-[#0a0a0a] mb-2">
								FAÇA SEU AGENDAMENTO
							</h2>
							<p className="text-sm text-[#888] font-medium mt-1">
								Rápido, fácil e sem complicação — do jeito que tem que ser.
							</p>
						</div>
						<div
							className="flex justify-center max-w-[700px] mx-auto mb-11 border-[1.5px] border-[#e0e0e0] rounded-xl overflow-hidden"
							id="progress"
						>
							{[1, 2, 3, 4, 5].map((s, idx) => (
								<div
									key={s}
									className={cn(
										"relative flex flex-1 flex-col shrink items-center px-2 py-3.5 gap-[3px] transition-colors border-r-[1.5px] border-[#e0e0e0] last:border-r-0 bg-white",
										step === s && "bg-[#0a0a0a]",
										step > s && "bg-[#f9f9f9]",
									)}
								>
									<span
										className={cn(
											"font-['Bebas_Neue'] text-2xl leading-none transition-colors",
											step === s ? "text-[#e63946]" : "text-[#c4c4c4]",
										)}
									>
										0{s}
									</span>
									<span
										className={cn(
											"font-['Barlow_Condensed'] text-[10px] font-bold tracking-[1.5px] uppercase transition-colors",
											step === s ? "text-white/70" : "text-[#c4c4c4]",
										)}
									>
										{["Barbeiro", "Serviço", "Horário", "Dados", "Confirmar"][idx]}
									</span>
									{step > s && (
										<span className="absolute top-2 right-2 w-4 h-4 bg-[#e63946] rounded-full text-[9px] text-white flex items-center justify-center font-bold">
											✓
										</span>
									)}
								</div>
							))}
						</div>
					</>
				)}

				{step === 1 && (
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
						<div className="mb-8 text-center">
							<h2 className="font-['Bebas_Neue'] text-[34px] tracking-[2px] text-[#0a0a0a] mb-2">
								ESCOLHE O CARA
							</h2>
							<p className="text-sm text-[#888] font-medium mt-1">
								Seleciona o barbeiro que vai te deixar na régua.
							</p>
						</div>
						<div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] w-full gap-3.5 lg:px-55">
							{barbers.length === 0 ? (
								<div className="w-[100px] h-[120px] rounded-xl mb-3.5 bg-[linear-gradient(90deg,#f2f2f2_25%,#e0e0e0_50%,#f2f2f2_75%)] bg-size-[200%_100%] animate-pulse"></div>
							) : (
								barbers.map((barber) => (
									<div
										key={barber.id}
										onClick={() => setSelectedBarber(barber)}
										className={cn(
											"relative p-5 border-[1.5px] rounded-xl cursor-pointer transition-all bg-white overflow-hidden group hover:-translate-y-0.5",
											selectedBarber?.id === barber.id
												? "border-[#e63946]"
												: "border-[#e0e0e0] hover:border-[#0a0a0a]",
										)}
									>
										<div
											className={cn(
												"absolute top-0 left-0 right-0 h-[3px] transition-colors",
												selectedBarber?.id === barber.id
													? "bg-[#e63946]"
													: "bg-[#e0e0e0] group-hover:bg-[#0a0a0a]",
											)}
										></div>
										{barber.badge && (
											<div className="absolute top-3 right-3 bg-[#d4a017] text-[#0a0a0a] font-['Barlow_Condensed'] text-[10px] font-bold tracking-[1px] uppercase px-2 py-0.5 rounded-full z-10">
												{barber.badge}
											</div>
										)}

										<div className="flex items-center gap-3.5 mb-3.5">
											<div
												className={cn(
													"w-[60px] h-[60px] rounded-full flex items-center justify-center font-['Bebas_Neue'] text-[22px] text-white shrink-0 border-[2.5px] transition-colors",
													selectedBarber?.id === barber.id
														? "border-[#e63946]"
														: "border-[#e0e0e0]",
												)}
												style={{ background: barber.color || "#0a0a0a" }}
											>
												{barber.name
													.split(" ")
													.map((w) => w[0])
													.join("")
													.slice(0, 2)}
											</div>
											<div>
												<div className="font-['Barlow_Condensed'] text-[20px] font-bold">
													{barber.name}
												</div>
												<div className="text-[12px] text-[#888] font-medium mt-0.5">
													{barber.role}
												</div>
												<div className="flex items-center gap-1 text-[12px] font-semibold text-[#d4a017]">
													{"★".repeat(Math.round(barber.rating || 5))}{" "}
													<em className="text-[#888] not-italic font-normal">
														{barber.rating || 5} ({barber.total_cuts || 0} cortes)
													</em>
												</div>
											</div>
										</div>

										<div className="flex flex-wrap gap-1.5 mt-2.5">
											{(barber.tags || []).map((t: string) => (
												<span
													key={t}
													className={cn(
														"text-[11px] font-semibold font-['Barlow_Condensed'] tracking-[0.5px] px-2.5 py-[3px] rounded-full",
														selectedBarber?.id === barber.id
															? "bg-[#ffe5e7] text-[#e63946]"
															: "bg-[#f2f2f2] text-[#444]",
													)}
												>
													{t}
												</span>
											))}
										</div>
									</div>
								))
							)}
						</div>
						<div className="flex justify-center mx-auto gap-3 mt-6 lg:px-55">
							<button
								disabled={!selectedBarber}
								onClick={() => handleNext(2)}
								className="flex items-center justify-center gap-2.5 w-full px-9 py-4 rounded-md bg-[#e63946] font-['Bebas_Neue'] text-white text-[20px] tracking-[2px] transition-all hover:bg-[#c1121f] hover:-translate-y-px disabled:bg-[#e0e0e0] disabled:text-[#c4c4c4] disabled:cursor-not-allowed disabled:transform-none"
							>
								Próximo: Escolher Serviço →
							</button>
						</div>
					</div>
				)}

				{step === 2 && (
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
						<div className="mb-8 text-center">
							<h2 className="font-['Bebas_Neue'] text-[34px] tracking-[2px] text-[#0a0a0a] mb-2">
								QUE PARADA VAI SER?
							</h2>
							<p className="text-sm text-[#888] font-medium mt-1">
								Pode escolher mais de um serviço na mesma sessão.
							</p>
						</div>

						<div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3">
							{services.map((s) => {
								const isSec = selectedServices.some((svc) => svc.id === s.id);
								return (
									<div
										key={s.id}
										onClick={() => toggleService(s)}
										className={cn(
											"border-[1.5px] rounded-xl px-4 py-4 cursor-pointer transition-all flex items-center gap-3.5",
											isSec
												? "border-[#e63946] bg-[#fff7f7]"
												: "border-[#e0e0e0] bg-white hover:border-[#0a0a0a]",
										)}
									>
										<div
											className={cn(
												"w-[46px] h-[46px] rounded-md flex items-center justify-center text-[22px] shrink-0 transition-colors",
												isSec ? "bg-[#e63946] text-white" : "bg-[#f2f2f2] text-[#0a0a0a]",
											)}
										>
											{s.icon || "✂"}
										</div>
										<div className="flex-1">
											<div className="font-['Barlow_Condensed'] text-[16px] font-bold">
												{s.name}
											</div>
											<div className="text-[11px] text-[#888] font-medium mt-0.5">
												⏱ {s.duration}
											</div>
										</div>
										<div
											className={cn(
												"font-['Bebas_Neue'] text-[24px] shrink-0 transition-colors",
												isSec ? "text-[#e63946]" : "text-[#0a0a0a]",
											)}
										>
											R${Number(s.price).toFixed(0)}
										</div>
									</div>
								);
							})}
						</div>

						<div className="mt-4 font-['Barlow_Condensed'] text-[14px] text-[#888] font-semibold tracking-[1px]">
							{selectedServices.length > 0 && (
								<span className="text-[#e63946] text-[18px] font-['Bebas_Neue'] tracking-[1px]">
									Total: R${totalServiceCost.toFixed(0)}
								</span>
							)}
						</div>

						<div className="flex gap-3 mt-6">
							<button
								disabled={selectedServices.length === 0}
								onClick={() => handleNext(3)}
								className="flex-2 font-['Bebas_Neue'] text-[20px] tracking-[2px] bg-[#e63946] text-white px-9 py-4 rounded-md transition-all hover:bg-[#c1121f] hover:-translate-y-1 flex items-center justify-center gap-2.5 w-full disabled:bg-[#e0e0e0] disabled:text-[#c4c4c4] disabled:cursor-not-allowed disabled:transform-none"
							>
								Próximo: Escolher Horário →
							</button>
							<button
								onClick={() => handleNext(1)}
								className="flex-1 text-xs font-bold tracking-[1.5px] uppercase bg-transparent text-[#888] border-[1.5px] border-[#e0e0e0] py-3 px-5 rounded-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
							>
								← Voltar
							</button>
						</div>
					</div>
				)}

				{step === 3 && (
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
						<div className="mb-8 text-center">
							<h2 className="font-['Bebas_Neue'] text-[34px] tracking-[2px] text-[#0a0a0a] mb-2">
								QUANDO VOCÊ VEM?
							</h2>
							<p className="text-sm text-[#888] font-medium mt-1">
								Escolhe a data e o horário que mandar bem pra você.
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<div className="border-[1.5px] border-[#e0e0e0] rounded-xl p-5 bg-white">
								<div className="flex items-center justify-between mb-4">
									<button
										className="w-8 h-8 border-[1.5px] border-[#e0e0e0] rounded-md bg-transparent cursor-pointer text-[14px] flex items-center justify-center transition-all hover:bg-[#0a0a0a] hover:border-[#0a0a0a] hover:text-white"
										onClick={() => changeMonth(-1)}
									>
										←
									</button>
									<span className="font-['Barlow_Condensed'] text-[17px] font-bold tracking-[1px] uppercase">
										{MONTHS[calMonth]} {calYear}
									</span>
									<button
										className="w-8 h-8 border-[1.5px] border-[#e0e0e0] rounded-md bg-transparent cursor-pointer text-[14px] flex items-center justify-center transition-all hover:bg-[#0a0a0a] hover:border-[#0a0a0a] hover:text-white"
										onClick={() => changeMonth(1)}
									>
										→
									</button>
								</div>
								<div className="grid grid-cols-7 gap-1">
									{DAYS.map((d, i) => (
										<div
											key={`dlbl-${i}`}
											className="text-center text-[10px] font-bold tracking-[1px] uppercase text-[#888] pt-1 pb-2"
										>
											{d}
										</div>
									))}
									{blanks.map((b) => (
										<div key={`b-${b}`} className="aspect-square"></div>
									))}
									{days.map((d) => {
										const dt = new Date(calYear, calMonth, d);
										const isPast = dt < today;
										const isToday = dt.getTime() === today.getTime();
										const monthStr = String(calMonth + 1).padStart(2, "0");
										const dayStr = String(d).padStart(2, "0");
										const dateStr = `${calYear}-${monthStr}-${dayStr}`;
										const isSelected = selectedDate === dateStr;

										return (
											<div
												key={`d-${d}`}
												className={cn(
													"aspect-square flex items-center justify-center text-xs font-medium rounded-md cursor-pointer border-[1.5px] border-transparent transition-all relative",
													isPast
														? "text-[#c4c4c4] cursor-not-allowed"
														: "hover:bg-[#f2f2f2] hover:border-[#c4c4c4]",
													isToday && !isSelected
														? "border-[#e63946] text-[#e63946] font-bold"
														: "",
													isSelected ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "",
													isToday && isSelected ? "bg-[#e63946] border-[#e63946]" : "",
												)}
												onClick={() => {
													if (!isPast) {
														setSelectedDate(dateStr);
														setSelectedTime("");
													}
												}}
											>
												{d}
											</div>
										);
									})}
								</div>
							</div>

							<div className="border-[1.5px] border-[#e0e0e0] rounded-xl p-5 bg-white">
								<p className="font-['Barlow_Condensed'] text-[14px] font-bold tracking-[1.5px] uppercase text-[#888] mb-3.5">
									Horários Disponíveis
								</p>
								<div>
									{!selectedDate ? (
										<div className="text-center py-8 text-[#888] text-xs">
											👈 Seleciona uma data primeiro
										</div>
									) : (
										<div className="grid grid-cols-3 gap-2">
											{ALL_SLOTS.map((time) => {
												const busy = busySlots.includes(time);

												return (
													<div
														key={time}
														className={cn(
															"py-2.5 px-1.5 text-center border-[1.5px] border-[#e0e0e0] rounded-md text-xs font-semibold transition-all bg-white",
															busy
																? "bg-[#f9f9f9] text-[#c4c4c4] cursor-not-allowed line-through border-transparent"
																: "cursor-pointer hover:border-[#0a0a0a] hover:bg-[#f9f9f9]",
															selectedTime === time && !busy
																? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
																: "",
														)}
														onClick={() => {
															if (!busy) setSelectedTime(time);
														}}
													>
														{time}
													</div>
												);
											})}
										</div>
									)}
								</div>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								className="flex-2 font-['Bebas_Neue'] text-[20px] tracking-[2px] bg-[#e63946] text-white px-9 py-4 rounded-md transition-all hover:bg-[#c1121f] hover:-translate-y-1 flex items-center justify-center gap-2.5 w-full disabled:bg-[#e0e0e0] disabled:text-[#c4c4c4] disabled:cursor-not-allowed disabled:transform-none"
								disabled={!selectedDate || !selectedTime}
								onClick={() => handleNext(4)}
							>
								Próximo: Seus Dados →
							</button>
							<button
								className="flex-1 font-['Barlow_Condensed'] text-xs font-bold tracking-[1.5px] uppercase bg-transparent text-[#888] border-[1.5px] border-[#e0e0e0] py-3 px-5 rounded-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
								onClick={() => handleNext(2)}
							>
								← Voltar
							</button>
						</div>
					</div>
				)}

				{step === 4 && (
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
						<div className="mb-8 text-center">
							<h2 className="font-['Bebas_Neue'] text-[34px] tracking-[2px] text-[#0a0a0a] mb-2">
								QUEM É VOCÊ, PARCEIRO?
							</h2>
							<p className="text-xs text-[#888] font-medium mt-1">
								Sem login, sem burocracia — só o essencial.
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
							<div className="flex flex-col gap-2">
								<label className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-[#444]">
									Seu Nome *
								</label>
								<input
									type="text"
									placeholder="Ex: Rafael Silva"
									className="px-3.5 py-3 border-[1.5px] border-[#e0e0e0] rounded-md font-['Barlow'] text-[15px] text-[#0a0a0a] bg-white transition-colors w-full focus:outline-none focus:border-[#0a0a0a]"
									value={clientName}
									onChange={(e) => setClientName(e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-[#444]">
									WhatsApp *
								</label>
								<input
									type="tel"
									className="px-3.5 py-3 border-[1.5px] border-[#e0e0e0] rounded-md font-['Barlow'] text-[15px] text-[#0a0a0a] bg-white transition-colors w-full focus:outline-none focus:border-[#0a0a0a]"
									placeholder="(11) 99999-9999"
									value={clientPhone}
									onChange={(e) => setClientPhone(formatPhone(e.target.value))}
								/>
							</div>
							<div className="flex flex-col gap-2 sm:col-span-2">
								<label className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-[#444]">
									E-mail (opcional)
								</label>
								<input
									type="email"
									className="px-3.5 py-3 border-[1.5px] border-[#e0e0e0] rounded-md font-['Barlow'] text-[15px] text-[#0a0a0a] bg-white transition-colors w-full focus:outline-none focus:border-[#0a0a0a]"
									placeholder="seu@email.com"
									value={clientEmail}
									onChange={(e) => setClientEmail(e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-2 sm:col-span-2">
								<label className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-[#444]">
									Observações
								</label>
								<textarea
									className="px-3.5 py-3 border-[1.5px] border-[#e0e0e0] rounded-md font-['Barlow'] text-[15px] text-[#0a0a0a] bg-white transition-colors w-full focus:outline-none focus:border-[#0a0a0a] min-h-[75px] resize-y"
									placeholder="Ex: quero degradê alto..."
									value={clientObs}
									onChange={(e) => setClientObs(e.target.value)}
								></textarea>
							</div>
						</div>

						<div className="bg-[#fffbea] border-[1.5px] border-[#d4a017] rounded-md px-4 py-3 text-xs text-[#444] mt-4 flex gap-2 items-start leading-1.5">
							<span>📱</span>
							<span className="leading-[initial]">
								Você vai receber a confirmação no seu WhatsApp. Guarda o número da
								barbearia por lá caso precise cancelar ou remarcar!
							</span>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								className="flex-2 font-['Bebas_Neue'] text-[20px] tracking-[2px] bg-[#e63946] text-white px-9 py-4 rounded-md transition-all hover:bg-[#c1121f] hover:-translate-y-1 flex items-center justify-center gap-2.5 w-full disabled:bg-[#e0e0e0] disabled:text-[#c4c4c4] disabled:cursor-not-allowed disabled:transform-none"
								disabled={!clientName || !clientPhone}
								onClick={() => handleNext(5)}
							>
								Próximo: Revisar Agendamento →
							</button>
							<button
								className="flex-1 font-['Barlow_Condensed'] text-xs font-bold tracking-[1.5px] uppercase bg-transparent text-[#888] border-[1.5px] border-[#e0e0e0] py-3 px-5 rounded-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
								onClick={() => handleNext(3)}
							>
								← Voltar
							</button>
						</div>
					</div>
				)}

				{step === 5 && (
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
						<div className="mb-8 text-center">
							<h2 className="font-['Bebas_Neue'] text-[34px] tracking-[2px] text-[#0a0a0a] mb-2">
								CONFERE E CONFIRMA
							</h2>
							<p className="text-xs text-[#888] font-medium mt-1">
								Tá tudo certo? Bora garantir sua vaga!
							</p>
						</div>

						<div className="bg-[#f9f9f9] border-[1.5px] border-[#e0e0e0] rounded-xl p-6 mb-6">
							<div className="font-['Bebas_Neue'] text-[20px] tracking-[1.5px] mb-4">
								✅ RESUMO DO AGENDAMENTO
							</div>
							<div className="flex justify-between items-center py-2.5 border-b border-[#e0e0e0] text-[14px]">
								<span className="text-[#888] font-medium">Barbeiro</span>
								<span className="font-bold">{selectedBarber?.name}</span>
							</div>
							<div className="flex justify-between items-center py-2.5 border-b border-[#e0e0e0] text-[14px]">
								<span className="text-[#888] font-medium">Serviços</span>
								<span className="font-bold text-right">
									{selectedServices.map((s) => s.name).join(", ")}
								</span>
							</div>
							<div className="flex justify-between items-center py-2.5 border-b border-[#e0e0e0] text-[14px]">
								<span className="text-[#888] font-medium">Data</span>
								<span className="font-bold">
									{selectedDate.split("-").reverse().join("/")} às {selectedTime}
								</span>
							</div>
							<div className="flex justify-between items-center py-2.5 border-b border-[#e0e0e0] text-[14px]">
								<span className="text-[#888] font-medium">Cliente</span>
								<span className="font-bold">{clientName}</span>
							</div>
							<div className="flex justify-between items-center py-2.5 border-b border-[#e0e0e0] text-[14px] last:border-b-0">
								<span className="text-[#888] font-medium">WhatsApp</span>
								<span className="font-bold">{clientPhone}</span>
							</div>
							{clientObs && (
								<div className="flex justify-between items-center py-2.5 border-b border-[#e0e0e0] text-[14px] last:border-b-0">
									<span className="text-[#888] font-medium">Obs</span>
									<span className="font-bold text-right max-w-[60%]">{clientObs}</span>
								</div>
							)}
							<div className="flex justify-between items-center py-2.5 border-b-0 text-[14px] mt-3.5">
								<span className="text-[#888] font-medium">Total</span>
								<span className="font-['Bebas_Neue'] text-[30px] text-[#e63946]">
									R${totalServiceCost.toFixed(0)}
								</span>
							</div>
						</div>

						<button
							className="w-full font-['Bebas_Neue'] text-[20px] tracking-[2px] bg-[#e63946] text-white px-9 py-4 rounded-md transition-all hover:bg-[#c1121f] hover:-translate-y-1 flex items-center justify-center gap-2.5 disabled:bg-[#e0e0e0] disabled:text-[#c4c4c4] disabled:cursor-not-allowed disabled:transform-none"
							disabled={isSubmitting}
							onClick={handleConfirm}
						>
							{isSubmitting ? <Loader2 /> : "Confirmar Agendamento"}
						</button>

						<div className="flex justify-center mt-3">
							<button
								className="font-['Barlow_Condensed'] text-xs font-bold tracking-[1.5px] uppercase bg-transparent text-[#888] border-[1.5px] border-[#e0e0e0] py-3 px-5 rounded-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
								onClick={() => handleNext(4)}
							>
								← Editar
							</button>
						</div>
					</div>
				)}

				{step === 6 && (
					<div className="animate-in zoom-in-95 duration-500 bg-white border-2 border-[#e63946] rounded-xl p-10 text-center max-w-[400px] mx-auto mt-12 mb-12 shadow-[0_20px_40px_rgba(230,57,70,0.15)] relative overflow-hidden">
						<div className="absolute top-0 left-0 right-0 h-1.5 bg-[#e63946]"></div>
						<div className="w-[80px] h-[80px] bg-[#e63946] text-white rounded-full flex items-center justify-center text-[36px] mx-auto mb-6 shadow-[0_10px_20px_rgba(230,57,70,0.3)] rotate-0 hover:rotate-180 transition-transform duration-500">
							✂
						</div>
						<div className="font-['Bebas_Neue'] text-[42px] leading-[0.9] text-[#0a0a0a] mb-4 tracking-[1.5px]">
							AGENDADO!
							<br />
							<em className="text-[#e63946] not-italic">SEU HORÁRIO</em>
							<br />
							TÁ GARANTIDO
						</div>
						<p className="text-[15px] text-[#888] leading-relaxed mb-8 font-medium">
							Você vai receber a confirmação no WhatsApp em instantes. Cola no horário,
							brother!
						</p>

						<button className="bg-[#25D366] text-white font-['Barlow_Condensed'] text-[18px] font-bold tracking-[1px] px-8 py-3.5 rounded-full uppercase cursor-pointer transition-all hover:bg-[#1EBE5A] hover:-translate-y-0.5 shadow-[0_10px_20px_rgba(37,211,102,0.3)] w-full max-w-[280px] mx-auto flex items-center justify-center gap-2.5">
							<svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
								<circle cx="16" cy="16" r="16" fill="#fff" />
								<path
									d="M16 5C9.925 5 5 9.925 5 16c0 1.965.514 3.812 1.41 5.413L5 27l5.72-1.392A10.94 10.94 0 0016 27c6.075 0 11-4.925 11-11S22.075 5 16 5zm5.585 15.45c-.235.66-1.375 1.26-1.89 1.31-.515.055-1.005.245-3.39-.71-2.855-1.14-4.675-4.015-4.815-4.205-.14-.19-1.13-1.51-1.13-2.88s.715-2.045.97-2.325c.255-.28.555-.35.74-.35l.53.01c.17.005.4-.065.625.475.235.555.795 1.93.865 2.07.07.14.115.305.025.49-.09.185-.135.3-.27.46-.135.16-.285.36-.405.485-.135.135-.275.28-.12.55.155.27.69 1.14 1.48 1.845 1.015.905 1.87 1.185 2.14 1.32.27.135.43.115.585-.07.155-.185.665-.775.84-1.04.175-.265.35-.22.59-.135.24.085 1.52.715 1.78.845.26.13.435.195.5.305.065.11.065.64-.17 1.3z"
									fill="#25D366"
								/>
							</svg>
							Ver no WhatsApp
						</button>
					</div>
				)}
			</main>
			<footer className="bg-black text-center py-6 text-gray-500 text-xs border-t border-gray-800">
				<p>
					Desenvolvido por <span className="text-red-500">Rodrigo</span>
					<span className="text-white italic">as</span>
					<span className="text-red-500">Dev</span>.
					<br />
					Sistema de Agendamento
				</p>
			</footer>
		</div>
	);
}
