"use client";

import Link from "next/link";
import { StatsBar } from "./StatsBar";
import { useBarbershopContext } from "@/providers/BarbershopProvider";

export default function HeroSection() {
	const { barbershop } = useBarbershopContext();

	return (
		<section className="relative flex-1 flex flex-col justify-center px-0 pt-16 pb-8 text-center bg-[#0a0a0a]">
			<div className="relative z-10 w-full mb-12">
				<p className="font-['Barlow_Condensed'] text-xs font-bold tracking-[4px] uppercase text-primary mb-3.5 relative inline-block px-3 py-1.5 bg-primary/10 rounded-md">
					✂ Agendamento Online{" "}
					<span className="w-2.5 h-2.5 bg-green-500/80 rounded-full inline-block animate-pulse"></span>
				</p>
				<h1 className="font-['Bebas_Neue'] text-[clamp(36px,11vw,56px)] text-white leading-[0.9] tracking-[3px] relative mb-5">
					{barbershop.name.toUpperCase()}
					<br />
					<em className="text-primary not-italic">DO SEU JEITO</em>
				</h1>
				<p className="mt-4 relative max-w-[400px] mx-auto text-base text-[#c4c4c4] font-medium tracking-[1px] leading-relaxed">
					Corte moderno, barba na régua e atendimento premium.
				</p>
				<div className="mt-9 flex justify-center relative">
					<Link
						href={`/${barbershop.slug}/agendamento`}
						className="flex items-center justify-center gap-2 w-max px-12 py-4 rounded-md bg-primary font-['Bebas_Neue'] text-[22px] text-white tracking-[2px] hover:bg-primary hover:border-primary hover:text-[#0a0a0a] transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_24px_rgba(212,160,23,0.15)] hover:shadow-[0_0_36px_rgba(212,160,23,0.35)]"
					>
						✂ Agendar Agora
					</Link>
				</div>
			</div>
			<StatsBar />
		</section>
	);
}
