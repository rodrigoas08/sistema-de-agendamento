"use client";

import { useState, useEffect } from "react";
import LoginButton from "@/components/ui/LoginButton";
import { createClient } from "@/utils/supabase/client";
import { clientCss } from "@/components/ClientStyle";

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
];

export default function Home() {
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
			document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
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
			<style dangerouslySetInnerHTML={{ __html: clientCss }} />

			{/* We use original DOM and class names */}
			<div className="client-page">
				<header className="client-header">
					<a className="logo" href="#">
						<span className="logo-dot"></span>Seu
						<em style={{ color: "var(--red)" }}>Negócio</em>
					</a>
					<nav>
						<LoginButton />
					</nav>
				</header>

				<section className="hero">
					<p className="hero-tag">✂ Agendamento Online</p>
					<h1>
						BARBEARIA
						<br />
						<em>DO SEU JEITO</em>
					</h1>
					<p className="hero-sub">
						Escolha seu barbeiro, seu horário e apareça na hora — sem fila, sem papo.
					</p>
					<div className="hero-cta">
						<button
							className="btn-hero"
							onClick={() =>
								document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })
							}
						>
							✂ Agendar Agora
						</button>
					</div>
					<div className="hero-strip">
						<div className="hero-stat">
							<b>{barbers.length || 0}</b>
							<span>Barbeiros</span>
						</div>
						<div className="hero-stat">
							<b>{services.length || 0}</b>
							<span>Serviços</span>
						</div>
						<div className="hero-stat">
							<b>100%</b>
							<span>Online</span>
						</div>
						<div className="hero-stat">
							<b>0</b>
							<span>Fila</span>
						</div>
					</div>
				</section>

				<main id="booking" className="booking-wrap">
					{step <= 5 && (
						<>
							<div className="section-head" id="booking-head">
								<h2>FAÇA SEU AGENDAMENTO</h2>
								<p>Rápido, fácil e sem complicação — do jeito que tem que ser.</p>
							</div>
							<div className="progress" id="progress">
								{[1, 2, 3, 4, 5].map((s, idx) => (
									<div
										key={s}
										className={`prog-step ${step === s ? "active" : ""} ${step > s ? "done" : ""}`}
									>
										<span className="prog-n">0{s}</span>
										<span className="prog-lbl">
											{["Barbeiro", "Serviço", "Horário", "Dados", "Confirmar"][idx]}
										</span>
										<span className="prog-tick" style={{ display: step > s ? "flex" : "none" }}>
											✓
										</span>
									</div>
								))}
							</div>
						</>
					)}

					{step === 1 && (
						<div className="step-panel active">
							<div className="section-head">
								<h2>ESCOLHE O CARA</h2>
								<p>Seleciona o barbeiro que vai te deixar na régua.</p>
							</div>
							<div className="barbers-grid">
								{barbers.length === 0 ? (
									<div className="skeleton"></div>
								) : (
									barbers.map((b) => (
										<div
											key={b.id}
											className={`barber-card ${selectedBarber?.id === b.id ? "selected" : ""}`}
											onClick={() => setSelectedBarber(b)}
										>
											{b.badge && <div className="bc-badge">{b.badge}</div>}
											<div className="bc-top">
												<div className="bc-avatar" style={{ background: b.color || "#0a0a0a" }}>
													{b.name
														.split(" ")
														.map((w) => w[0])
														.join("")
														.slice(0, 2)}
												</div>
												<div>
													<div className="bc-name">{b.name}</div>
													<div className="bc-role">{b.role}</div>
													<div className="bc-stars">
														{"★".repeat(Math.round(b.rating || 5))}{" "}
														<em>
															{b.rating || 5} ({b.total_cuts || 0} cortes)
														</em>
													</div>
												</div>
											</div>
											<div className="bc-tags">
												{(b.tags || []).map((t: string) => (
													<span key={t} className="bc-tag">
														{t}
													</span>
												))}
											</div>
										</div>
									))
								)}
							</div>
							<div className="btn-row">
								<button
									className="btn-primary"
									disabled={!selectedBarber}
									onClick={() => handleNext(2)}
								>
									Próximo: Escolher Serviço →
								</button>
							</div>
						</div>
					)}

					{step === 2 && (
						<div className="step-panel active">
							<div className="section-head">
								<h2>QUE PARADA VAI SER?</h2>
								<p>Pode escolher mais de um serviço na mesma sessão.</p>
							</div>
							<div className="services-grid">
								{services.map((s) => {
									const isSec = selectedServices.some((svc) => svc.id === s.id);
									return (
										<div
											key={s.id}
											className={`svc-card ${isSec ? "selected" : ""}`}
											onClick={() => toggleService(s)}
										>
											<div className="svc-ico">{s.icon || "✂"}</div>
											<div className="svc-info">
												<div className="svc-name">{s.name}</div>
												<div className="svc-dur">⏱ {s.duration}</div>
											</div>
											<div className="svc-price">R${Number(s.price).toFixed(0)}</div>
										</div>
									);
								})}
							</div>
							<div
								style={{
									marginTop: 16,
									fontFamily: "'Barlow Condensed', sans-serif",
									fontSize: 14,
									color: "var(--gray-500)",
									fontWeight: 600,
									letterSpacing: 1,
								}}
							>
								{selectedServices.length > 0 && (
									<span
										style={{
											color: "var(--red)",
											fontSize: 18,
											fontFamily: "'Bebas Neue', cursive",
											letterSpacing: 1,
										}}
									>
										Total: R${totalServiceCost.toFixed(0)}
									</span>
								)}
							</div>
							<div className="btn-row">
								<button
									className="btn-primary"
									disabled={selectedServices.length === 0}
									onClick={() => handleNext(3)}
								>
									Próximo: Escolher Horário →
								</button>
								<button className="btn-sec" onClick={() => handleNext(1)}>
									← Voltar
								</button>
							</div>
						</div>
					)}

					{step === 3 && (
						<div className="step-panel active">
							<div className="section-head">
								<h2>QUANDO VOCÊ VEM?</h2>
								<p>Escolhe a data e o horário que mandar bem pra você.</p>
							</div>
							<div className="cal-wrap">
								<div className="cal-box">
									<div className="cal-nav-row">
										<button className="cal-arr" onClick={() => changeMonth(-1)}>
											←
										</button>
										<span className="cal-month-lbl">
											{MONTHS[calMonth]} {calYear}
										</span>
										<button className="cal-arr" onClick={() => changeMonth(1)}>
											→
										</button>
									</div>
									<div className="cal-grid">
										{DAYS.map((d, i) => (
											<div key={`dlbl-${i}`} className="cal-dlbl">
												{d}
											</div>
										))}
										{blanks.map((b) => (
											<div key={`b-${b}`} className="cal-d empty"></div>
										))}
										{days.map((d) => {
											const dt = new Date(calYear, calMonth, d);
											const isPast = dt < today;
											const isToday = dt.getTime() === today.getTime();
											const monthStr = String(calMonth + 1).padStart(2, "0");
											const dayStr = String(d).padStart(2, "0");
											const dateStr = `${calYear}-${monthStr}-${dayStr}`;
											const isSelected = selectedDate === dateStr;

											let cls = "cal-d";
											if (isPast) cls += " past";
											if (isToday) cls += " today";
											if (isSelected) cls += " selected";

											return (
												<div
													key={`d-${d}`}
													className={cls}
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
								<div className="slots-box">
									<p className="slots-title">Horários Disponíveis</p>
									<div>
										{!selectedDate ? (
											<div className="slots-empty">👈 Seleciona uma data primeiro</div>
										) : (
											<div className="slots-grid">
												{ALL_SLOTS.map((time) => {
													const busy = busySlots.includes(time);
													let cls = "slot";
													if (busy) cls += " busy";
													else if (selectedTime === time) cls += " selected";

													return (
														<div
															key={time}
															className={cls}
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
							<div className="btn-row">
								<button
									className="btn-primary"
									disabled={!selectedDate || !selectedTime}
									onClick={() => handleNext(4)}
								>
									Próximo: Seus Dados →
								</button>
								<button className="btn-sec" onClick={() => handleNext(2)}>
									← Voltar
								</button>
							</div>
						</div>
					)}

					{step === 4 && (
						<div className="step-panel active">
							<div className="section-head">
								<h2>QUEM É VOCÊ, PARCEIRO?</h2>
								<p>Sem login, sem burocracia — só o essencial.</p>
							</div>
							<div className="form-grid">
								<div className="fg">
									<label>Seu Nome *</label>
									<input
										type="text"
										placeholder="Ex: Rafael Silva"
										value={clientName}
										onChange={(e) => setClientName(e.target.value)}
									/>
								</div>
								<div className="fg">
									<label>WhatsApp *</label>
									<input
										type="tel"
										placeholder="(11) 99999-9999"
										value={clientPhone}
										onChange={(e) => setClientPhone(e.target.value)}
									/>
								</div>
								<div className="fg full">
									<label>E-mail (opcional)</label>
									<input
										type="email"
										placeholder="seu@email.com"
										value={clientEmail}
										onChange={(e) => setClientEmail(e.target.value)}
									/>
								</div>
								<div className="fg full">
									<label>Observações</label>
									<textarea
										placeholder="Ex: quero degradê alto..."
										value={clientObs}
										onChange={(e) => setClientObs(e.target.value)}
									></textarea>
								</div>
							</div>
							<div className="form-alert" style={{ marginTop: 16 }}>
								<span>📱</span>
								<span>
									Você vai receber a confirmação no seu WhatsApp. Guarda o número do barbeiro por
									lá caso precise cancelar ou remarcar!
								</span>
							</div>
							<div className="btn-row">
								<button
									className="btn-primary"
									disabled={!clientName || !clientPhone}
									onClick={() => handleNext(5)}
								>
									Próximo: Revisar Agendamento →
								</button>
								<button className="btn-sec" onClick={() => handleNext(3)}>
									← Voltar
								</button>
							</div>
						</div>
					)}

					{step === 5 && (
						<div className="step-panel active">
							<div className="section-head">
								<h2>CONFERE E CONFIRMA</h2>
								<p>Tá tudo certo? Bora garantir sua vaga!</p>
							</div>
							<div className="summ-card">
								<div className="summ-title">✅ RESUMO DO AGENDAMENTO</div>
								<div className="summ-row">
									<span className="summ-key">Barbeiro</span>
									<span className="summ-val">{selectedBarber?.name}</span>
								</div>
								<div className="summ-row">
									<span className="summ-key">Serviços</span>
									<span className="summ-val">
										{selectedServices.map((s) => s.name).join(", ")}
									</span>
								</div>
								<div className="summ-row">
									<span className="summ-key">Data</span>
									<span className="summ-val">
										{selectedDate.split("-").reverse().join("/")} às {selectedTime}
									</span>
								</div>
								<div className="summ-row">
									<span className="summ-key">Cliente</span>
									<span className="summ-val">{clientName}</span>
								</div>
								<div className="summ-row">
									<span className="summ-key">WhatsApp</span>
									<span className="summ-val">{clientPhone}</span>
								</div>
								{clientObs && (
									<div className="summ-row">
										<span className="summ-key">Obs</span>
										<span className="summ-val">{clientObs}</span>
									</div>
								)}
								<div className="summ-row" style={{ marginTop: 14 }}>
									<span className="summ-key">Total</span>
									<span className="summ-total">R${totalServiceCost.toFixed(0)}</span>
								</div>
							</div>
							<button className="btn-primary" disabled={isSubmitting} onClick={handleConfirm}>
								✅ Confirmar Agendamento
							</button>
							<div className="btn-row" style={{ justifyContent: "center", marginTop: 12 }}>
								<button className="btn-sec" onClick={() => handleNext(4)}>
									← Editar
								</button>
							</div>
						</div>
					)}

					{step === 6 && (
						<div className="success-screen" style={{ display: "block" }}>
							<div className="success-icon">✂</div>
							<div className="success-h">
								AGENDADO!
								<br />
								<em>SEU HORÁRIO</em>
								<br />
								TÁ GARANTIDO
							</div>
							<p className="success-p">
								Você vai receber a confirmação no WhatsApp em instantes. Cola no horário,
								brother!
							</p>
							<button className="btn-wa">
								<svg style={{ width: 28, height: 28 }} viewBox="0 0 32 32" fill="none">
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
				{/* Footer */}
				<footer className="bg-black text-center py-6 text-gray-500 text-xs border-t border-gray-800">
					<p>
						Desenvolvido por <span className="text-red-500">Rodrigo</span>
						<span className="text-white font-italic">as</span>
						<span className="text-red-500">Dev</span>.
						<br />
						Sistema de Agendamento
					</p>
				</footer>
			</div>
		</>
	);
}
