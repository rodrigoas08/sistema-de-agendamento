"use client";

import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";

const HOURS = [
	{ day: "Segunda — Sexta", time: "09:00 – 20:00" },
	{ day: "Sábado", time: "08:00 – 18:00" },
	{ day: "Domingo", time: "Fechado" },
];

export default function LocalSEOSection() {
	return (
		<section
			aria-label="Localização e informações da barbearia"
			className="bg-[#0a0a0a] py-20 px-4 md:px-18 lg:px-58 border-t border-white/5 relative overflow-hidden"
		>
			{/* Decorative blurs */}
			<div className="absolute top-0 left-0 w-[350px] h-[350px] bg-[#e63946]/5 blur-[120px] -z-10 pointer-events-none" />
			<div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#d4a017]/4 blur-[100px] -z-10 pointer-events-none" />

			{/* Section label */}
			<div className="flex items-center gap-4 mb-10">
				<span className="h-[2px] w-12 bg-[#e63946]" />
				<span className="font-['Barlow_Condensed'] text-xs font-bold tracking-[4px] uppercase text-[#e63946]">
					Como nos encontrar
				</span>
			</div>

			{/* Two-column grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
				{/* ── Left: Map ── */}
				<div className="relative w-full overflow-hidden rounded-lg border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] min-h-[400px]">
					<iframe
						title="Localização da barbearia no Google Maps"
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1052754578484!2d-46.6543985!3d-23.5647574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c7f481fd9f%3A0x9982b72628e4a2b0!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
						width="100%"
						height="100%"
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						className="absolute inset-0 w-full h-full"
						style={{
							filter:
								"grayscale(1) invert(0.92) hue-rotate(180deg) brightness(0.85) contrast(1.1)",
							border: "none",
						}}
					/>

					{/* Map overlay: subtle gradient at bottom */}
					<div className="absolute bottom-0 inset-x-0 h-12 bg-linear-to-t from-[#0a0a0a]/60 to-transparent pointer-events-none rounded-b-lg" />
				</div>

				{/* ── Right: Info ── */}
				<div className="flex flex-col justify-center gap-6">
					{/* Heading */}
					<div>
						<h2 className="font-['Bebas_Neue'] text-[clamp(28px,5vw,48px)] leading-tight tracking-[2px] text-white">
							A melhor experiência em barbearia{" "}
							<em className="text-[#e63946] not-italic">
								no coração de [Nome da Cidade/Bairro]
							</em>
						</h2>
						<div className="h-[2px] w-20 bg-linear-to-r from-[#e63946] to-transparent mt-4" />
					</div>

					{/* Description */}
					<p className="font-['Barlow'] text-[#c4c4c4] text-base leading-relaxed">
						Na <strong className="text-white">SeuNegócio</strong>, unimos a técnica do
						degradê perfeito com a cultura urbana. Localizada em{" "}
						<strong className="text-white">[Endereço Completo]</strong>, nosso espaço
						é focado em agilidade e estilo. Sem filas, sem papo furado — apenas a
						régua máxima.
					</p>

					{/* Address */}
					<a
						href="https://maps.google.com/?q=[Endereço+Completo]"
						target="_blank"
						rel="noopener noreferrer"
						className="group inline-flex items-start gap-3 p-4 rounded-lg bg-white/3 border border-white/8 hover:border-[#e63946]/50 hover:bg-[#e63946]/5 transition-all duration-300"
						aria-label="Ver endereço no Google Maps"
					>
						<MapPin
							className="w-5 h-5 text-[#e63946] shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
							strokeWidth={1.5}
						/>
						<span className="font-['Barlow'] text-[#c4c4c4] text-sm group-hover:text-white transition-colors leading-relaxed">
							[Endereço Completo], [Bairro] — [Cidade], [Estado], CEP [00000-000]
						</span>
						<ExternalLink className="w-4 h-4 text-[#e63946]/50 group-hover:text-[#e63946] shrink-0 mt-0.5 transition-colors" />
					</a>

					{/* Phone */}
					<a
						href="tel:+5511900000000"
						className="group inline-flex items-center gap-3 p-4 rounded-lg bg-white/3 border border-white/8 hover:border-[#e63946]/50 hover:bg-[#e63946]/5 transition-all duration-300 w-fit"
						aria-label="Ligar para a barbearia"
					>
						<Phone
							className="w-5 h-5 text-[#e63946] shrink-0 group-hover:scale-110 transition-transform"
							strokeWidth={1.5}
						/>
						<span className="font-['Barlow'] text-[#c4c4c4] text-sm group-hover:text-white transition-colors">
							(11) 90000-0000
						</span>
					</a>

					{/* Hours */}
					<div
						className="p-4 rounded-lg bg-white/3 border border-white/8"
						aria-label="Horário de funcionamento"
					>
						<div className="flex items-center gap-2 mb-3">
							<Clock className="w-4 h-4 text-[#e63946]" strokeWidth={1.5} />
							<span className="font-['Barlow_Condensed'] text-xs font-bold tracking-[3px] uppercase text-[#e63946]">
								Horário de funcionamento
							</span>
						</div>
						<ul className="flex flex-col gap-2">
							{HOURS.map(({ day, time }) => (
								<li key={day} className="flex items-center justify-between">
									<span className="font-['Barlow'] text-[#888] text-sm">{day}</span>
									<span
										className={`font-['Barlow'] text-sm font-semibold ${
											time === "Fechado" ? "text-[#e63946]/70" : "text-[#d4a017]"
										}`}
									>
										{time}
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
