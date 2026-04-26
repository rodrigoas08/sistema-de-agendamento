"use client";

import { createContext, useContext } from "react";
import type { Barbershop } from "@/schemas/barbershopSchema";

interface BarbershopContextValue {
	barbershop: Barbershop;
	barbershopId: string;
}

const BarbershopContext = createContext<BarbershopContextValue | null>(null);

interface BarbershopProviderProps {
	barbershop: Barbershop;
	children: React.ReactNode;
}

/**
 * Provider que injeta os dados do barbershop ativo em toda a árvore
 * Utilizado tanto nas rotas públicas (via slug) quanto no admin (via owner)
 */
export function BarbershopProvider({
	barbershop,
	children,
}: BarbershopProviderProps) {
	return (
		<BarbershopContext.Provider
			value={{ barbershop, barbershopId: barbershop.id ?? "" }}
		>
			{children}
		</BarbershopContext.Provider>
	);
}

/**
 * Hook para acessar o barbershop ativo no contexto
 *
 * @throws {Error} Se chamado fora do BarbershopProvider
 * @returns {BarbershopContextValue} Os dados do barbershop ativo
 */
export function useBarbershopContext(): BarbershopContextValue {
	const context = useContext(BarbershopContext);

	if (!context) {
		throw new Error(
			"useBarbershopContext deve ser usado dentro de um BarbershopProvider",
		);
	}

	return context;
}
