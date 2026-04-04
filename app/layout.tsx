import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Barlow, Bebas_Neue, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
	variable: "--font-barlow-condensed",
	subsets: ["latin"],
	weight: ["400", "600", "700", "900"],
});

const barlow = Barlow({
	variable: "--font-barlow",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
	variable: "--font-bebas-neue",
	subsets: ["latin"],
	weight: "400",
});

const BASE_URL = "https://sistema-de-agendamento-ras.vercel.app";

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title:
		"Barbearia [Nome da Barbearia] | Corte na Régua e Agendamento Online em [Sua Cidade]",
	description:
		"A melhor barbearia de [Sua Cidade]. Especialistas em degradê, barba e freestyle. Agende seu horário online em segundos e saia com a régua máxima. Sem filas!",
	keywords: [
		"barbearia [sua cidade]",
		"corte de cabelo masculino",
		"degradê",
		"agendamento online barbearia",
		"barbeiro profissional [seu bairro]",
	],
	robots: {
		index: true,
		follow: true,
	},
	openGraph: {
		type: "website",
		url: BASE_URL,
		title: "Barbearia [Nome da Barbearia] | O Trato que Você Merece",
		description:
			"Corte na régua e estilo impecável. Agende agora pelo nosso sistema online!",
		images: [
			{
				url: "/images/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Barbearia [Nome da Barbearia]",
			},
		],
		locale: "pt_BR",
		siteName: "Barbearia [Nome da Barbearia]",
	},
	twitter: {
		card: "summary_large_image",
		title: "Barbearia [Nome da Barbearia] | Agendamento Fácil",
		description:
			"Garanta sua vaga na melhor barbearia de [Sua Cidade]. Clique e agende!",
		images: ["/images/og-image.jpg"],
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="pt-BR"
			className={`${geistSans.variable} ${barlowCondensed.variable} ${barlow.variable} ${bebasNeue.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
