import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { barberService } from "@/services/barberService";
import { Barber } from "@/schemas/barberSchema";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Hook to manage barbers state using TanStack Query
 *
 * @returns {Object} Query and mutation methods
 */
export function useBarbers() {
	const queryClient = useQueryClient();
	const supabase = createClient();

	const barbersQuery = useQuery({
		queryKey: ["barbers"],
		queryFn: () => barberService.getAll(),
	});

	// Realtime subscription to keep data in sync across all components
	useEffect(() => {
		console.log("Subscribing to barbers realtime...");
		const channel = supabase
			.channel("barbers-realtime-channel")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "barbers",
				},
				(payload) => {
					console.log("Barbers change detected:", payload);
					queryClient.invalidateQueries({ queryKey: ["barbers"] });
				},
			)
			.subscribe((status) => {
				console.log("Barbers subscription status:", status);
			});

		return () => {
			console.log("Unsubscribing from barbers realtime...");
			supabase.removeChannel(channel);
		};
	}, [supabase, queryClient]);

	const createBarberMutation = useMutation({
		mutationFn: (newBarber: Omit<Barber, "id">) => barberService.create(newBarber),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["barbers"] });
		},
	});

	const updateBarberMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Barber> }) =>
			barberService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["barbers"] });
		},
	});

	const toggleStatusMutation = useMutation({
		mutationFn: ({ id, active }: { id: string; active: boolean }) =>
			barberService.toggleStatus(id, active),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["barbers"] });
		},
	});

	const deleteBarberMutation = useMutation({
		mutationFn: (id: string) => barberService.remove(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["barbers"] });
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
