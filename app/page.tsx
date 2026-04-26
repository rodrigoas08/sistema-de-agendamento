import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import type { Barbershop } from "@/schemas/barbershopSchema";

/**
 * Home page do SaaS — lista os estabelecimentos disponíveis
 * Em produção, pode ser uma landing page comercial do seu produto
 */
export default async function Home() {
	const supabase = await createClient();

	const { data } = await supabase
		.from("barbershops")
		.select("id, slug, name, logo_url, theme_color")
		.order("name", { ascending: true });

	const barbershops = (data ?? []) as Pick<
		Barbershop,
		"id" | "slug" | "name" | "logo_url" | "theme_color"
	>[];

	return (
		<div className="font-['Barlow'] bg-[#0a0a0a] text-white min-h-dvh flex flex-col">
			{/* Header */}
			<header className="flex items-center justify-between h-16 px-4 md:px-18 lg:px-58 bg-[#0a0a0a] border-b-2 border-b-primary shrink-0 z-20">
				<span className="font-['Bebas_Neue'] text-xl md:text-[26px] tracking-[2px]">
					AGENDA<em className="text-primary italic">PRO</em>
				</span>
				<Link
					href="/login"
					className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
				>
					Área Admin →
				</Link>
			</header>

			{/* Hero */}
			<main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
				<p className="font-['Barlow_Condensed'] text-xs font-bold tracking-[4px] uppercase text-primary mb-4 px-3 py-1.5 bg-primary/10 rounded-md inline-block">
					✂ Plataforma de Agendamento
				</p>
				<h1 className="font-['Bebas_Neue'] text-[clamp(36px,10vw,64px)] leading-[0.9] tracking-[3px] mb-6">
					O SISTEMA QUE <br />
					<em className="text-primary not-italic">AGENDA PRA VOCÊ</em>
				</h1>
				<p className="max-w-md text-[#888] text-base font-medium mb-12">
					Gerencie sua barbearia com agendamento online, whitelabel e painel
					administrativo completo.
				</p>

				{/* Listagem de barbearias */}
				{barbershops.length > 0 && (
					<div className="w-full max-w-2xl">
						<h2 className="font-['Barlow_Condensed'] text-xs font-bold tracking-[4px] uppercase text-gray-500 mb-6">
							Estabelecimentos
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{barbershops.map((shop) => (
								<Link
									key={shop.id}
									href={`/${shop.slug}`}
									className="group flex items-center gap-4 p-5 rounded-xl border border-white/10 bg-white/3 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
								>
									<div
										className="w-12 h-12 rounded-full flex items-center justify-center font-['Bebas_Neue'] text-lg text-white shrink-0"
										style={{
											backgroundColor: shop.theme_color ?? "#e63946",
										}}
									>
										{shop.name
											.split(" ")
											.map((word) => word[0])
											.join("")
											.slice(0, 2)
											.toUpperCase()}
									</div>
									<div className="text-left">
										<p className="font-['Barlow_Condensed'] text-lg font-semibold text-white group-hover:text-primary transition-colors">
											{shop.name}
										</p>
										<p className="text-xs text-gray-500">/{shop.slug}</p>
									</div>
								</Link>
							))}
						</div>
					</div>
				)}

				{barbershops.length === 0 && (
					<div className="text-center text-gray-500 text-sm">
						<p>Nenhum estabelecimento cadastrado ainda.</p>
						<p className="mt-2">
							<Link href="/login" className="text-primary hover:underline font-semibold">
								Faça login para começar →
							</Link>
						</p>
					</div>
				)}
			</main>

			{/* Footer */}
			<footer className="h-20 py-6 text-center text-gray-500 text-xs border-t border-gray-800 bg-black">
				<p>
					Desenvolvido por <span className="text-primary">Rodrigo</span>
					<span className="text-white italic">as</span>
					<span className="text-primary">Dev</span>.
					<br />
					AgendaPRO — Plataforma SaaS
				</p>
			</footer>
		</div>
	);
}
