"use client";

import Image from "next/image";

const IMAGES = [
	"/images/gallery/imagem1.jpg",
	"/images/gallery/imagem2.jpg",
	"/images/gallery/imagem3.jpg",
	"/images/gallery/imagem4.jpg",
	"/images/gallery/imagem5.jpg",
	"/images/gallery/imagem6.jpg",
	"/images/gallery/imagem1.jpg",
	"/images/gallery/imagem2.jpg",
	"/images/gallery/imagem3.jpg",
];

export default function Gallery() {
	return (
		<section className="bg-[#0a0a0a] py-20 px-4 md:px-18 lg:px-58 border-t border-white/5 relative overflow-hidden">
			{/* Decorative background elements */}
			<div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#e63946]/5 blur-[100px] -z-10"></div>
			<div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#d4a017]/5 blur-[120px] -z-10"></div>

			<div className="mb-12 relative">
				<div className="flex items-center gap-4 mb-3">
					<span className="h-[2px] w-12 bg-[#e63946]"></span>
					<span className="font-['Barlow_Condensed'] text-xs font-bold tracking-[4px] uppercase text-[#e63946]">
						Portfolio visual
					</span>
				</div>
				<h2 className="font-['Bebas_Neue'] text-[48px] md:text-[64px] text-white leading-none tracking-[2px]">
					NOSSA <em className="text-[#e63946] not-italic">GALERIA</em>
				</h2>
				<div className="h-1 w-24 bg-linear-to-r from-[#e63946] to-transparent mt-4"></div>
			</div>

			<div className="columns-2 lg:columns-4">
				{IMAGES.map((src, idx) => (
					<div
						key={idx}
						className="break-inside-avoid group mb-5 relative overflow-hidden border border-white/10 transition-all duration-500 hover:border-[#e63946]/50"
					>
						<Image
							loading="eager"
							src={src}
							alt={`Trabalho ${idx + 1}`}
							width={800}
							height={800}
							className="w-full h-auto object-cover grayscale-30 group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.03]"
							loading="lazy"
						/>

						{/* Premium Overlay */}
						<div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
							<div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
								<p className="font-['Bebas_Neue'] text-center lg:text-left text-lg lg:text-xl text-white lg:tracking-[1px]">
									TRABALHO REALIZADO
								</p>
								<p className="font-['Barlow'] text-center lg:text-left text-[10px] text-[#e63946] font-bold tracking-[2px] uppercase">
									Estilo Profissional
								</p>
							</div>
						</div>

						{/* Grid Lines Effect Highlight */}
						<div className="absolute inset-0 pointer-events-none border-[0.5px] border-white/5 group-hover:border-white/20 transition-colors"></div>
					</div>
				))}
			</div>
		</section>
	);
}
