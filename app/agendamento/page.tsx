"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LoginButton from "@/components/ui/LoginButton";
import { createClient } from "@/utils/supabase/client";
import { formatPhone } from "@/utils/format";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { MONTHS, DAYS, ALL_SLOTS } from "@/constants";
import Button from "@/components/agendamento/Button";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/utils/format";
import { useRouter } from "next/navigation";

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
	const router = useRouter();

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
		<>
			<div className="min-h-[calc(100dvh-80px)] font-['Barlow'] bg-white text-[#0a0a0a] overflow-x-hidden">
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
									Rápido, fácil e sem complicação do jeito que tem que ser.
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
							<div className="mb-8 text-center w-max mx-auto">
								<h2 className="font-['Bebas_Neue'] text-[34px] tracking-[2px] text-[#0a0a0a] mb-2">
									ESCOLHE O CARA
								</h2>
								<p className="text-sm text-[#888] font-medium mt-1">
									Seleciona o barbeiro que vai te deixar na régua.
								</p>
							</div>
							<div className="flex flex-col lg:flex-row lg:flex-wrap max-w-[700px] mx-auto gap-3 px-5 lg:px-0">
								{barbers.length === 0 ? (
									<div className="w-[247px] h-[146px] mx-auto rounded-xl mb-3.5 bg-[linear-gradient(90deg,#f2f2f2_25%,#e0e0e0_50%,#f2f2f2_75%)] bg-size-[200%_100%] animate-pulse"></div>
								) : (
									barbers.map((barber) => (
										<div
											key={barber.id}
											onClick={() => setSelectedBarber(barber)}
											className={cn(
												"relative flex-1 p-5 border border-t-4 rounded-xl cursor-pointer transition-all bg-white group hover:-translate-y-0.5",
												selectedBarber?.id === barber.id
													? "border-[#e63946] rounded-t-lg"
													: "border-[#e0e0e0] hover:border-[#0a0a0a] rounded-t-lg",
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
											{/* {barber.badge && (
											<div className="absolute top-3 right-3 bg-[#d4a017] text-[#0a0a0a] font-['Barlow_Condensed'] text-[10px] font-bold tracking-[1px] uppercase px-2 py-0.5 rounded-full z-10">
												{barber.badge}
											</div>
										)} */}

											<div className="flex items-center gap-3.5 mb-3.5">
												<div
													className={cn(
														"w-[60px] h-[60px] rounded-full flex items-center justify-center font-['Bebas_Neue'] text-[22px] text-white shrink-0 border-[2.5px] transition-colors",
														selectedBarber?.id === barber.id ? "border-[#e63946]" : "border-[#e0e0e0]",
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
													<div className="font-['Barlow_Condensed'] text-[20px] font-semibold">
														{barber.name}
													</div>
													<div className="text-[12px] text-[#888] font-medium mt-0.5">{barber.role}</div>
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
							<div className="max-w-[700px] px-5 lg:px-0 mx-auto mt-6">
								<Button
									disabled={!selectedBarber}
									handleNext={() => handleNext(2)}
									text="Próximo: Escolher Serviço →"
								/>
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

							<div className="flex flex-col lg:flex-row lg:flex-wrap max-w-[700px] mx-auto gap-3">
								{services.map((s) => {
									const isSec = selectedServices.some((svc) => svc.id === s.id);
									return (
										<div
											key={s.id}
											onClick={() => toggleService(s)}
											className={cn(
												"flex-1 shrink-0 gap-3.5 border-[1.5px] rounded-xl px-4 py-4 cursor-pointer transition-all",
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
												<div className="font-['Barlow_Condensed'] text-[16px] font-bold">{s.name}</div>
												<div className="text-[11px] text-[#888] font-medium mt-0.5">⏱ {s.duration}</div>
											</div>
											<div
												className={cn(
													"font-['Bebas_Neue'] text-[24px] shrink-0 transition-colors",
													isSec ? "text-[#e63946]" : "text-[#0a0a0a]",
												)}
											>
												{formatCurrency(Number(s.price))}
											</div>
										</div>
									);
								})}
							</div>

							<div className="max-w-[700px] mx-auto mt-4 font-['Barlow_Condensed'] text-[14px] text-[#888] font-semibold tracking-[1px]">
								{selectedServices.length > 0 && (
									<span className="text-[#e63946] text-[18px] font-['Bebas_Neue'] tracking-[1px]">
										Total: {formatCurrency(totalServiceCost)}
									</span>
								)}
							</div>

							<div className="flex gap-3 max-w-[700px] mx-auto mt-6 lg:px-0">
								<Button
									disabled={selectedServices.length === 0}
									handleNext={() => handleNext(3)}
									text="Próximo: Escolher Horário →"
									className="shrink lg:px-0"
								/>
								<Button
									handleNext={() => handleNext(1)}
									text="← Voltar"
									className="shrink-0 flex-1 py-1 px-2 lg:px-5 lg:text-sm font-bold font-['Bebas_Neue'] bg-transparent text-[#888] border-[1.5px] border-[#e0e0e0] cursor-pointer transition-all hover:border-[#0a0a0a] hover:text-[#0a0a0a] hover:bg-white"
								/>
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

							<div className="max-w-[700px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
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
														isToday && !isSelected ? "border-[#e63946] text-[#e63946] font-bold" : "",
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

							<div className="flex gap-3 max-w-[700px] mx-auto mt-6">
								<Button
									disabled={!selectedDate || !selectedTime}
									handleNext={() => handleNext(4)}
									text="Próximo: Seus Dados →"
									className="shrink lg:px-0"
								/>
								<Button
									handleNext={() => handleNext(2)}
									text="← Voltar"
									className="shrink-0 flex-1 py-1 px-2 lg:px-5 lg:text-sm font-bold font-['Bebas_Neue'] bg-transparent text-[#888] border-[1.5px] border-[#e0e0e0] cursor-pointer transition-all hover:border-[#0a0a0a] hover:text-[#0a0a0a] hover:bg-white"
								/>
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

							<div className="max-w-[700px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

							<div className="max-w-[700px] mx-auto bg-[#fffbea] border-[1.5px] border-[#d4a017] rounded-md px-4 py-3 text-xs text-[#444] mt-4 flex gap-2 items-start leading-1.5">
								<span>📱</span>
								<span className="leading-[initial]">
									Você vai receber a confirmação no seu WhatsApp. Guarda o número da barbearia por
									lá caso precise cancelar ou remarcar!
								</span>
							</div>

							<div className="max-w-[700px] mx-auto flex gap-3 mt-6">
								<Button
									disabled={!clientName || !clientPhone}
									handleNext={() => handleNext(5)}
									text="Próximo: Revisar Agendamento →"
									className="shrink lg:px-0"
								/>
								<Button
									handleNext={() => handleNext(3)}
									text="← Voltar"
									className="shrink-0 flex-1 py-1 px-2 lg:px-5 lg:text-sm font-bold font-['Bebas_Neue'] bg-transparent text-[#888] border-[1.5px] border-[#e0e0e0] cursor-pointer transition-all hover:border-[#0a0a0a] hover:text-[#0a0a0a] hover:bg-white"
								/>
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

							<div className="max-w-[700px] mx-auto bg-[#f9f9f9] border-[1.5px] border-[#e0e0e0] rounded-xl p-6 mb-6">
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
										{formatCurrency(totalServiceCost)}
									</span>
								</div>
							</div>
							<div className="max-w-[700px] mx-auto flex gap-3 mt-6">
								<Button
									disabled={isSubmitting}
									handleNext={() => handleConfirm()}
									text={isSubmitting ? <Loader2 /> : "Confirmar Agendamento"}
									className="shrink lg:px-0"
								/>
								<Button
									handleNext={() => handleNext(4)}
									text="← Editar"
									className="shrink-0 flex-1 py-1 px-2 lg:px-5 lg:text-sm font-bold font-['Bebas_Neue'] bg-transparent text-[#888] border-[1.5px] border-[#e0e0e0] cursor-pointer transition-all hover:border-[#0a0a0a] hover:text-[#0a0a0a] hover:bg-white"
								/>
							</div>
						</div>
					)}

					{step === 6 && (
						<div className="animate-in zoom-in-95 duration-500 bg-white border-2 border-[#e63946] rounded-xl p-10 text-center max-w-[400px] mx-auto mt-12 mb-12 shadow-[0_20px_40px_rgba(230,57,70,0.15)] relative overflow-hidden">
							<div className="absolute top-0 left-0 right-0 h-1.5 bg-[#e63946]"></div>
							<div className="w-[80px] h-[80px] bg-[#e63946] text-white rounded-full flex items-center justify-center text-[36px] mx-auto mb-6 shadow-[0_10px_20px_rgba(230,57,70,0.3)] rotate-0 hover:rotate-180 transition-transform duration-500">
								✂
							</div>
							<div className="font-['Bebas_Neue'] text-[42px] leading-none text-[#0a0a0a] mb-4 tracking-[1.5px]">
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

							<Button
								handleNext={() => router.push("/")}
								text="Voltar para a página inicial"
								className="shrink-0 flex-1 py-1 px-2 lg:px-5 lg:text-sm font-bold bg-transparent font-['Bebas_Neue'] text-[#888] border border-[#888] cursor-pointer transition-all hover:border-[#0a0a0a] hover:text-[#0a0a0a] hover:bg-white"
							/>
						</div>
					)}
				</main>
			</div>
			<Footer />
		</>
	);
}
