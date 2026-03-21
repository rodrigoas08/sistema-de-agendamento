"use client";
import LoginButton from "@/components/ui/LoginButton";
import { CalendarDays, Star } from "lucide-react";

export default function Home() {
	return (
		<main className="w-full min-h-dvh bg-black text-white flex flex-col pt-[76px]">
			{/* <header className="flex items-center justify-between w-full h-25 p-5 bg-[#0a0a0a] border-b-2 border-b-[#ff0000]">
				<h2 className="text-amber-300 text-xl">Seu Negócio</h2>
				<h1 className="text-amber-300 text-2xl text-center">
					Sistema de agendamento online
				</h1>
				<LoginButton />
			</header> */}
			{/* Header */}
			<header className="fixed top-0 left-0 w-full z-50 border-b border-[#e63946] px-4 py-4 bg-black">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<h1 className="font-bold tracking-tight">
								SEU <span className="text-red-500 italic">NEGÓCIO</span>
							</h1>
						</div>
						<div className="flex gap-2">
							<LoginButton />
						</div>
					</div>
				</header>

				{/* Hero Section */}
				<section className="px-4 py-12 text-center">
					<div className="max-w-md mx-auto">
						<div className="flex items-center justify-center gap-2 mb-4">
							<div className="w-3 h-3 bg-red-500 transform rotate-45"></div>
							<span className="text-red-500 text-xs font-bold tracking-wider">
								AGENDAMENTO ONLINE
							</span>
						</div>

						<h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
							BARBEARIA
						</h2>
						<h2 className="text-4xl md:text-5xl font-black text-red-500 mb-6 tracking-tight">
							DO SEU JEITO
						</h2>

						<p className="text-gray-400 text-sm mb-8">
							Escolha seu barbeiro, seu horário e apareça na hora — sem fila, sem papo.
						</p>

						<button className="bg-red-500 hover:bg-red-600 transition-colors px-8 py-4 rounded font-bold tracking-wide flex items-center justify-center gap-2 mx-auto">
							<div className="w-4 h-4 flex items-center justify-center">
								<CalendarDays />
							</div>
							AGENDAR AGORA
						</button>

						{/* Stats */}
						<div className="grid grid-cols-4 gap-4 mt-12 py-8 border-t border-b border-gray-800">
							<div>
								<div className="text-2xl font-bold text-yellow-500">2</div>
								<div className="text-[10px] text-gray-400 tracking-wider mt-1">BARBEIROS</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-yellow-500">4</div>
								<div className="text-[10px] text-gray-400 tracking-wider mt-1">SERVIÇOS</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-yellow-500">100%</div>
								<div className="text-[10px] text-gray-400 tracking-wider mt-1">ONLINE</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-yellow-500">0</div>
								<div className="text-[10px] text-gray-400 tracking-wider mt-1">FILA</div>
							</div>
						</div>
					</div>
				</section>

				{/* Booking Section */}
				<section className="bg-white text-black px-4 py-12">
					<div className="max-w-3xl mx-auto">
						<h3 className="text-2xl font-black mb-2">FAÇA SEU AGENDAMENTO</h3>
						<p className="text-gray-600 text-sm mb-6">
							Rápido, fácil e sem complicação — do jeito que tem que ser.
						</p>

						{/* Steps */}
						<div className="grid grid-cols-5 gap-2 mb-12">
							<div className="bg-black text-white rounded p-3 text-center">
								<div className="text-lg font-bold text-red-500">01</div>
								<div className="text-[9px] tracking-wider mt-1">BARBEIRO</div>
							</div>
							<div className="bg-gray-100 rounded p-3 text-center">
								<div className="text-lg font-bold text-gray-400">02</div>
								<div className="text-[9px] tracking-wider mt-1 text-gray-400">SERVIÇO</div>
							</div>
							<div className="bg-gray-100 rounded p-3 text-center">
								<div className="text-lg font-bold text-gray-400">03</div>
								<div className="text-[9px] tracking-wider mt-1 text-gray-400">HORÁRIO</div>
							</div>
							<div className="bg-gray-100 rounded p-3 text-center">
								<div className="text-lg font-bold text-gray-400">04</div>
								<div className="text-[9px] tracking-wider mt-1 text-gray-400">DADOS</div>
							</div>
							<div className="bg-gray-100 rounded p-3 text-center">
								<div className="text-lg font-bold text-gray-400">05</div>
								<div className="text-[9px] tracking-wider mt-1 text-gray-400">CONFIRMAR</div>
							</div>
						</div>

						{/* Choose Professional */}
						<h4 className="text-xl font-black mb-2">ESCOLHE O CARA</h4>
						<p className="text-gray-600 text-sm mb-6">
							Seleciona o barbeiro que vai te deixar na régua.
						</p>

						{/* Professional Cards */}
						<div className="space-y-4">
							{/* Professional 1 */}
							<div className="border-2 border-gray-200 rounded-lg p-4 relative hover:border-gray-300 transition-colors cursor-pointer">
								<div className="absolute top-4 right-4 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded">
									TOP
								</div>
								<div className="flex gap-4">
									<div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold flex-shrink-0">
										DM
									</div>
									<div className="flex-1">
										<h5 className="font-bold mb-1">Diego Moura</h5>
										<p className="text-xs text-gray-600 mb-2">Especialista em Degradê</p>
										<div className="flex items-center gap-1 mb-3">
											{[1, 2, 3, 4, 5].map((i) => (
												<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
											))}
											<span className="text-xs text-gray-500 ml-1">★ 4.9 (130 cortes)</span>
										</div>
										<div className="flex gap-2 flex-wrap">
											<span className="text-[10px] px-2 py-1 bg-gray-100 rounded">Degradê</span>
											<span className="text-[10px] px-2 py-1 bg-gray-100 rounded">Navalhado</span>
											<span className="text-[10px] px-2 py-1 bg-gray-100 rounded">Barba</span>
										</div>
									</div>
								</div>
							</div>

							{/* Professional 2 */}
							<div className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer">
								<div className="flex gap-4">
									<div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold flex-shrink-0">
										RC
									</div>
									<div className="flex-1">
										<h5 className="font-bold mb-1">Rafael Costa</h5>
										<p className="text-xs text-gray-600 mb-2">Mestre em Barba</p>
										<div className="flex items-center gap-1 mb-3">
											{[1, 2, 3, 4, 5].map((i) => (
												<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
											))}
											<span className="text-xs text-gray-500 ml-1">★ 4.8 (186 cortes)</span>
										</div>
										<div className="flex gap-2 flex-wrap">
											<span className="text-[10px] px-2 py-1 bg-gray-100 rounded">Barba</span>
											<span className="text-[10px] px-2 py-1 bg-gray-100 rounded">Bigode</span>
											<span className="text-[10px] px-2 py-1 bg-gray-100 rounded">Corte Social</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Next Button */}
						<button className="w-full bg-gray-200 hover:bg-gray-300 transition-colors text-black font-bold py-4 rounded mt-8 tracking-wide">
							PRÓXIMO: ESCOLHER SERVIÇO →
						</button>
					</div>
				</section>

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
		</main>
	);
}
