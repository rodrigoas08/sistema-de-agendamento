import { useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceService } from "@/services/serviceService";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Hook to manage services state using TanStack Query with Realtime support
 * Filtrado por barbershop_id para isolamento multi-tenant
 *
 * @param {string} barbershopId - UUID do estabelecimento ativo
 * @returns {Object} Query state
 */
export function useServices(barbershopId: string) {
	const queryClient = useQueryClient();
	const supabase = createClient();

	const servicesQuery = useQuery({
		queryKey: ["services", barbershopId],
		queryFn: () => serviceService.getAll(barbershopId),
		enabled: !!barbershopId,
	});

	// Realtime subscription
	useEffect(() => {
		if (!barbershopId) return;

		const channel = supabase
			.channel(`services-realtime-${barbershopId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "services",
					filter: `barbershop_id=eq.${barbershopId}`,
				},
				() => {
					queryClient.invalidateQueries({ queryKey: ["services", barbershopId] });
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, queryClient, barbershopId]);

	return {
		services: servicesQuery.data ?? [],
		activeServices: (servicesQuery.data ?? []).filter((s) => s.active),
		isLoading: servicesQuery.isLoading,
		isError: servicesQuery.isError,
	};
}
