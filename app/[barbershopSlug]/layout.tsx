import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { BarbershopProvider } from "@/providers/BarbershopProvider";
import type { Barbershop } from "@/schemas/barbershopSchema";
import type { Metadata } from "next";

interface BarbershopLayoutProps {
	children: React.ReactNode;
	params: Promise<{ barbershopSlug: string }>;
}

/**
 * Gera metadata dinâmica baseada no barbershop para SEO
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ barbershopSlug: string }>;
}): Promise<Metadata> {
	const { barbershopSlug } = await params;
	const supabase = await createClient();

	const { data: barbershop } = await supabase
		.from("barbershops")
		.select("name, address")
		.eq("slug", barbershopSlug)
		.single();

	if (!barbershop) {
		return { title: "Estabelecimento não encontrado" };
	}

	return {
		title: `${barbershop.name} | Agendamento Online`,
		description: `Agende seu horário na ${barbershop.name}. ${barbershop.address ?? ""}. Rápido, fácil e sem filas!`,
		openGraph: {
			title: `${barbershop.name} | Agendamento Online`,
			description: `Agende agora na ${barbershop.name}!`,
			type: "website",
			locale: "pt_BR",
		},
	};
}

/**
 * Layout dinâmico para rotas públicas do barbershop
 * Carrega o barbershop pelo slug e injeta o tema (Whitelabel) via CSS vars
 */
export default async function BarbershopLayout({
	children,
	params,
}: BarbershopLayoutProps) {
	const { barbershopSlug } = await params;
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("barbershops")
		.select("*")
		.eq("slug", barbershopSlug)
		.single();

	if (error || !data) {
		notFound();
	}

	const barbershop = data as Barbershop;
	const themeColor = barbershop.theme_color ?? "#e63946";

	return (
		<BarbershopProvider barbershop={barbershop}>
			{/* Injeção de tema Whitelabel via CSS custom properties */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
						:root {
							--tenant-primary: ${themeColor};
						}
					`,
				}}
			/>
			{children}
		</BarbershopProvider>
	);
}
