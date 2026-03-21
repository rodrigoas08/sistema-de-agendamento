import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
	variable: "--font-barlow-condensed",
	subsets: ["latin"],
	weight: "400",
});

export const metadata: Metadata = {
	title: "Sistema de Agendamento",
	description:
		"Sistema de agendamento online simples e eficiente, com confirmação automática via WhatsApp. Gerencie horários, clientes e serviços em um só lugar para barbearias, salões de beleza e clínicas de estética.",
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
			lang="en"
			className={`${geistSans.variable} ${barlowCondensed.variable} h-full antialiased`}
		>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@400;600;700;900&display=swap" rel="stylesheet" />
			</head>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
