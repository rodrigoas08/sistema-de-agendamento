import { useQuery } from "@tanstack/react-query";
import { barbershopService } from "@/services/barbershopService";

/**
 * Hook para carregar dados do estabelecimento pelo slug (rotas públicas)
 *
 * @param {string} slug - Slug único do estabelecimento (extraído da URL)
 * @returns {Object} Query state com os dados do barbershop
 */
export function useBarbershopBySlug(slug: string) {
	const barbershopQuery = useQuery({
		queryKey: ["barbershop", "slug", slug],
		queryFn: () => barbershopService.getBySlug(slug),
		enabled: !!slug,
		staleTime: 5 * 60 * 1000, // Cache de 5 minutos (dados raramente mudam)
	});

	return {
		barbershop: barbershopQuery.data ?? null,
		isLoading: barbershopQuery.isLoading,
		isError: barbershopQuery.isError,
	};
}

/**
 * Hook para carregar dados do estabelecimento pelo owner_id (painel admin)
 *
 * @param {string} ownerId - UUID do owner autenticado
 * @returns {Object} Query state com os dados do barbershop
 */
export function useBarbershopByOwner(ownerId: string) {
	const barbershopQuery = useQuery({
		queryKey: ["barbershop", "owner", ownerId],
		queryFn: () => barbershopService.getByOwnerId(ownerId),
		enabled: !!ownerId,
		staleTime: 5 * 60 * 1000,
	});

	return {
		barbershop: barbershopQuery.data ?? null,
		isLoading: barbershopQuery.isLoading,
		isError: barbershopQuery.isError,
	};
}

/**
 * Hook para listar todos os estabelecimentos (Super Admin)
 *
 * @returns {Object} Query state com a lista de todos os barbershops
 */
export function useAllBarbershops() {
	const barbershopsQuery = useQuery({
		queryKey: ["barbershops", "all"],
		queryFn: () => barbershopService.getAll(),
	});

	return {
		barbershops: barbershopsQuery.data ?? [],
		isLoading: barbershopsQuery.isLoading,
		isError: barbershopsQuery.isError,
	};
}
