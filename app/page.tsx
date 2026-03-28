"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import CTASection from "@/components/CTASection";
import Header from "@/components/Header";

export default function Home() {
	const supabase = createClient();
	const [barbersCount, setBarbersCount] = useState(0);
	const [servicesCount, setServicesCount] = useState(0);

	useEffect(() => {
		const loadInitialData = async () => {
			const [{ count: bCount }, { count: sCount }] = await Promise.all([
				supabase.from("barbers").select("*", { count: "exact", head: true }),
				supabase.from("services").select("*", { count: "exact", head: true }),
			]);
			if (bCount !== null) setBarbersCount(bCount);
			if (sCount !== null) setServicesCount(sCount);
		};
		loadInitialData();
	}, [supabase]);

	return (
		<div className="font-['Barlow'] bg-[#0a0a0a] text-white min-h-dvh flex flex-col overflow-x-hidden">
			<Header />

			<section className="bg-[#0a0a0a] flex-1 flex flex-col justify-center px-4 pt-16 pb-8 text-center relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath%20d=%27M0%2060L60%200M-10%2010L10-10M50%2070L70%2050%27%20stroke=%27%23E63946%27%20stroke-width=%270.3%27%20opacity=%270.12%27/%3E%3C/svg%3E')] before:opacity-60">
				<div className="relative z-10 w-full mb-12">
					<p className="font-['Barlow_Condensed'] text-xs font-bold tracking-[4px] uppercase text-[#e63946] mb-3.5 relative inline-block px-3 py-1.5 bg-[#e63946]/10 rounded-md">
						✂ Agendamento Online{" "}
						<span className="w-2.5 h-2.5 bg-green-500/80 rounded-full inline-block animate-pulse"></span>
					</p>
					<h1 className="font-['Bebas_Neue'] text-[clamp(56px,11vw,100px)] text-white leading-[0.9] tracking-[3px] relative mb-5">
						BARBEARIA
						<br />
						<em className="text-[#e63946] not-italic">DO SEU JEITO</em>
					</h1>
					<p className="mt-4 relative max-w-[400px] mx-auto text-base text-[#c4c4c4] font-medium tracking-[1px] leading-relaxed">
						Escolha seu barbeiro, seu horário e apareça na hora sem fila, sem papo.
					</p>
					<div className="mt-9 flex justify-center relative">
						<Link
							href="/agendamento"
							className="flex items-center justify-center gap-2 w-max px-12 py-4 rounded-md bg-[#e63946] font-['Bebas_Neue'] text-[22px] text-white tracking-[2px] hover:bg-[#e63946] hover:border-[#e63946] hover:text-[#0a0a0a] transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_24px_rgba(212,160,23,0.15)] hover:shadow-[0_0_36px_rgba(212,160,23,0.35)]"
						>
							✂ Agendar Agora
						</Link>
					</div>
				</div>
				<div className="relative z-10 grid grid-cols-4 mt-auto pt-8 md:px-18 lg:px-55 border-t border-white/10 text-3xl">
					<div className="text-center px-0 border-r border-white/10">
						<b className="text-[#d4a017] block leading-none">{barbersCount}</b>
						<span className="text-[11px] text-[#888] uppercase tracking-[2px] font-semibold">
							Barbeiros
						</span>
					</div>
					<div className="text-center border-r border-white/10">
						<b className="text-[#d4a017] block leading-none">{servicesCount}</b>
						<span className="text-[11px] text-[#888] uppercase tracking-[2px] font-semibold">
							Serviços
						</span>
					</div>
					<div className="text-center border-r border-white/10">
						<b className="text-[#d4a017] block leading-none">100%</b>
						<span className="text-[11px] text-[#888] uppercase tracking-[2px] font-semibold">
							Online
						</span>
					</div>
					<div className="text-center">
						<b className="text-[#d4a017] block leading-none">0</b>
						<span className="text-[11px] text-[#888] uppercase tracking-[2px] font-semibold">
							Fila
						</span>
					</div>
				</div>
			</section>

			<Gallery />

			<CTASection />

			<Footer />
		</div>
	);
}
