"use client";

import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import CTASection from "@/components/CTASection";
import Header from "@/components/Header";
import LocalSEOSection from "@/components/LocalSEOSection";
import Testimonials from "@/components/Testimonials";
import { useBarbershopContext } from "@/providers/BarbershopProvider";

export default function BarbershopHome() {
	const { barbershop } = useBarbershopContext();

	return (
		<div className="font-['Barlow'] bg-[#0a0a0a] text-white min-h-dvh flex flex-col overflow-x-hidden">
			<Header imageLogo={barbershop.logo_url ?? undefined} />

			<HeroSection />

			<Gallery />

			<Testimonials />

			<CTASection />

			<LocalSEOSection />

			<Footer />
		</div>
	);
}
