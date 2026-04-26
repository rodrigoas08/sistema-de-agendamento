"use client";

import { useRef, useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

/* ─── Google "G" SVG Icon ─── */
function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-label="Google"
			viewBox="0 0 24 24"
			className={className}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
				fill="#EA4335"
			/>
		</svg>
	);
}

/* ─── Data ─── */
const REVIEWS = [
	{
		name: "Thiago Peguët",
		date: "10 meses atrás",
		text:
			"Os rapazes são muito profissionais. Ambiente muito acolhedor, wi-fi e ótimo papo. Serviço excelente. Corto meu cabelo sempre, dá para parar o carro ou na Estrada do Capenha ou no posto Shell, subindo a Pau Ferro, então é de boa ir de carro ou moto.",
		rating: 5,
	},
	{
		name: "Carlos Henrique Gomes",
		date: "4 anos atrás",
		text: "Bom atendimento e preço bacana. Ar-condicionado em todo ambiente.",
		rating: 5,
	},
	{
		name: "Raphaela Santos",
		date: "3 anos atrás",
		text: "Atendimento maravilhoso, e corte maravilhoso tbm",
		rating: 5,
	},
];

/* ─── Star Row ─── */
function Stars({ count }: { count: number }) {
	return (
		<div className="flex items-center gap-0.5" aria-label={`${count} estrelas`}>
			{Array.from({ length: count }).map((_, i) => (
				<Star
					key={i}
					className="w-4 h-4 text-[#d4a017] fill-[#d4a017]"
					strokeWidth={0}
				/>
			))}
		</div>
	);
}

/* ─── Card ─── */
function ReviewCard({ name, date, text, rating }: (typeof REVIEWS)[0]) {
	return (
		<article className="group relative flex flex-col gap-4 shrink-0 w-[300px] sm:w-[340px] lg:w-auto bg-[#111] border border-white/8 rounded-xl p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_28px_rgba(230,57,70,0.12)] cursor-default select-none">
			{/* Google badge */}
			<div className="absolute top-5 right-5 opacity-70 group-hover:opacity-100 transition-opacity">
				<GoogleIcon className="w-5 h-5" />
			</div>

			{/* Stars + rating */}
			<Stars count={rating} />

			{/* Review text */}
			<blockquote className="font-['Barlow'] text-[#c4c4c4] text-sm leading-relaxed flex-1">
				&ldquo;{text}&rdquo;
			</blockquote>

			{/* Author */}
			<footer className="flex items-center gap-3 pt-3 border-t border-white/6">
				<div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
					<span className="font-['Bebas_Neue'] text-primary text-base leading-none">
						{name[0]}
					</span>
				</div>
				<div>
					<p className="font-['Barlow'] font-semibold text-white text-sm">{name}</p>
					<p className="font-['Barlow'] text-[#666] text-xs">{date} · Google</p>
				</div>
			</footer>
		</article>
	);
}

/* ─── Main Section ─── */
export default function Testimonials() {
	const trackRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);
	const [isDesktop, setIsDesktop] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(min-width: 1024px)");
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsDesktop(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	const updateArrows = () => {
		const el = trackRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 8);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
	};

	const scroll = (dir: "left" | "right") => {
		const el = trackRef.current;
		if (!el) return;
		el.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
	};

	return (
		<section
			aria-label="Depoimentos de clientes"
			className="bg-[#0a0a0a] py-20 px-4 md:px-18 lg:px-58 border-t border-white/5 relative overflow-hidden"
		>
			{/* Decorative blurs */}
			<div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/4 blur-[130px] -z-10 pointer-events-none" />
			<div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#d4a017]/4 blur-[100px] -z-10 pointer-events-none" />

			{/* Header */}
			<div className="mb-10">
				<div className="flex items-center gap-4 mb-3">
					<span className="h-[2px] w-12 bg-primary" />
					<span className="font-['Barlow_Condensed'] text-xs font-bold tracking-[4px] uppercase text-primary">
						Depoimentos
					</span>
				</div>
				<h2 className="font-['Bebas_Neue'] text-[clamp(28px,6vw,52px)] leading-tight tracking-[2px] text-white">
					Quem já passou pela cadeira,{" "}
					<em className="text-primary not-italic">recomenda.</em>
				</h2>
				<div className="h-[2px] w-20 bg-linear-to-r from-primary to-transparent mt-4" />
			</div>

			{/* Reviews — scrollable on mobile, grid on desktop */}
			<div className="relative">
				{/* Scroll arrows (mobile/tablet only) */}
				{!isDesktop && (
					<>
						<button
							onClick={() => scroll("left")}
							disabled={!canScrollLeft}
							aria-label="Ver anterior"
							className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-white disabled:opacity-20 hover:border-primary/50 transition-all"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<button
							onClick={() => scroll("right")}
							disabled={!canScrollRight}
							aria-label="Ver próximo"
							className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-white disabled:opacity-20 hover:border-primary/50 transition-all"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</>
				)}

				<div
					ref={trackRef}
					onScroll={updateArrows}
					className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible scrollbar-none"
					style={{ scrollbarWidth: "none" }}
				>
					{REVIEWS.map((r) => (
						<ReviewCard key={r.name} {...r} />
					))}
				</div>
			</div>

			{/* CTA bottom */}
			<div className="mt-10 flex justify-center">
				<a
					href="https://maps.google.com/?q=[Endereço+Completo]"
					target="_blank"
					rel="noopener noreferrer"
					className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 hover:border-primary/40 bg-white/3 hover:bg-primary/5 transition-all duration-300"
					aria-label="Ver todas as avaliações no Google Maps"
				>
					<GoogleIcon className="w-4 h-4" />
					<span className="font-['Barlow'] text-sm text-[#c4c4c4] group-hover:text-white transition-colors">
						Ver todas as avaliações no Google Maps
					</span>
					<ExternalLink className="w-3.5 h-3.5 text-primary/50 group-hover:text-primary transition-colors" />
				</a>
			</div>
		</section>
	);
}
