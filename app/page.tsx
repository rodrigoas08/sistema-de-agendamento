"use client";

import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import CTASection from "@/components/CTASection";
import Header from "@/components/Header";
import LocalSEOSection from "@/components/LocalSEOSection";
import Testimonials from "@/components/Testimonials";

export default function Home() {
	return (
		<div className="font-['Barlow'] bg-[#0a0a0a] text-white min-h-dvh flex flex-col overflow-x-hidden">
			<Header />

			<HeroSection />

			<Gallery />

			<Testimonials />

			<CTASection />

			<LocalSEOSection />

			<Footer />
		</div>
	);
}
