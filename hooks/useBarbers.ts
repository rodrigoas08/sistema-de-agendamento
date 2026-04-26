import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { barberService } from "@/services/barberService";
import { Barber } from "@/schemas/barberSchema";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Hook to manage barbers state using TanStack Query
 * Filtrado por barbershop_id para isolamento multi-tenant
 *
 * @param {string} barbershopId - UUID do estabelecimento ativo
 * @returns {Object} Query and mutation methods
 */
export function useBarbers(barbershopId: string) {
	const queryClient = useQueryClient();
	const supabase = createClient();

	const barbersQuery = useQuery({
		queryKey: ["barbers", barbershopId],
		queryFn: () => barberService.getAll(barbershopId),
		enabled: !!barbershopId,
	});

	// Realtime subscription to keep data in sync across all components
	useEffect(() => {
		if (!barbershopId) return;

		const channel = supabase
			.channel(`barbers-realtime-${barbershopId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "barbers",
					filter: `barbershop_id=eq.${barbershopId}`,
				},
				() => {
					queryClient.invalidateQueries({ queryKey: ["barbers", barbershopId] });
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, queryClient, barbershopId]);

	const createBarberMutation = useMutation({
		mutationFn: (newBarber: Omit<Barber, "id">) => barberService.create(newBarber),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["barbers", barbershopId] });
		},
	});

	const updateBarberMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Barber> }) =>
			barberService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["barbers", barbershopId] });
		},
	});

	const toggleStatusMutation = useMutation({
		mutationFn: ({ id, active }: { id: string; active: boolean }) =>
			barberService.toggleStatus(id, active),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["barbers", barbershopId] });
		},
	});

	const deleteBarberMutation = useMutation({
		mutationFn: (id: string) => barberService.remove(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["barbers", barbershopId] });
		},
	});

	return {
		barbers: barbersQuery.data ?? [],
		activeBarbers: (barbersQuery.data ?? []).filter((b) => b.active),
		isLoading: barbersQuery.isLoading,
		isError: barbersQuery.isError,
		createBarber: createBarberMutation.mutateAsync,
		isCreating: createBarberMutation.isPending,
		updateBarber: updateBarberMutation.mutateAsync,
		isUpdating: updateBarberMutation.isPending,
		toggleStatus: toggleStatusMutation.mutateAsync,
		deleteBarber: deleteBarberMutation.mutateAsync,
		isDeleting: deleteBarberMutation.isPending,
	};
}
