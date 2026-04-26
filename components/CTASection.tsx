"use client";

import Link from "next/link";
import { CalendarCheck, Scissors, Award, MapPin } from "lucide-react";
import { useBarbershopContext } from "@/providers/BarbershopProvider";

const FEATURES = [
	{
		icon: CalendarCheck,
		text: "Agende seu horário online em segundos. Sem estresse.",
	},
	{
		icon: Scissors,
		text: "Melhores barbeiros da região. Estilo impecável garantido.",
	},
	{
		icon: Award,
		text: "Programa de Fidelidade Exclusivo. Ganhe prêmios e cortes grátis.",
	},
	{
		icon: MapPin,
		text: "Fácil localização e agendamento pelo WhatsApp.",
	},
];

export default function CTASection() {
	const { barbershop } = useBarbershopContext();

	return (
		<section className="bg-[#0a0a0a] py-20 px-4 md:px-18 lg:px-58 border-t border-white/5 relative overflow-hidden">
			{/* Decorative background */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#d4a017]/4 blur-[140px] -z-10 rounded-full" />
			<div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[100px] -z-10" />

			{/* Header */}
			<div className="text-center mb-12">
				<h2 className="font-['Bebas_Neue'] text-[clamp(32px,6vw,56px)] leading-tight tracking-[2px] text-white">
					Corte na Régua e Agendamento Fácil? <br />
					<span>
						É Aqui na{" "}
						<em className="text-primary italic">{barbershop.name}</em>
					</span>
				</h2>

				<div className="h-[2px] w-24 mx-auto mt-4 bg-linear-to-r from-primary via-primary to-transparent" />
			</div>

			{/* Feature list */}
			<ul className="flex flex-col gap-3 max-w-2xl mx-auto mb-10">
				{FEATURES.map(({ icon: Icon, text }, i) => (
					<li
						key={i}
						className="group flex items-center gap-4 bg-white/3 border border-white/8 rounded-lg px-5 py-4 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 cursor-default"
					>
						<span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
							<Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
						</span>
						<span className="font-['Barlow'] text-[#c4c4c4] text-base group-hover:text-white transition-colors duration-300">
							{text}
						</span>
					</li>
				))}
			</ul>

			{/* CTA Button */}
			<div className="flex flex-col items-center max-w-2xl mx-auto gap-y-4">
				<Link
					href={`/${barbershop.slug}/agendamento`}
					className="flex items-center justify-center gap-2 w-full px-2 py-4 rounded-md bg-primary font-['Bebas_Neue'] text-sm lg:text-xl text-white hover:bg-primary hover:border-primary hover:text-[#0a0a0a] transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_24px_rgba(212,160,23,0.15)] hover:shadow-[0_0_36px_rgba(212,160,23,0.35)]"
				>
					<CalendarCheck className="w-5 h-5" strokeWidth={2} />
					RESERVE SEU HORÁRIO AGORA E GANHE 10% OFF NO PRIMEIRO CORTE
				</Link>

				<p className="font-['Barlow'] text-sm  italic tracking-wide">
					Seu estilo não pode esperar. Garanta sua vaga na melhor barbearia da
					cidade.
				</p>
			</div>
		</section>
	);
}
