import { useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceService } from "@/services/serviceService";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Hook to manage services state using TanStack Query with Realtime support
 * 
 * @returns {Object} Query state
 */
export function useServices() {
	const queryClient = useQueryClient();
	const supabase = createClient();

	const servicesQuery = useQuery({
		queryKey: ["services"],
		queryFn: () => serviceService.getAll(),
	});

	// Realtime subscription
	useEffect(() => {
		console.log("Subscribing to services realtime...");
		const channel = supabase
			.channel("services-realtime-channel")
			.on(
				"postgres_changes",
				{ 
					event: "*", 
					schema: "public", 
					table: "services" 
				},
				(payload) => {
					console.log("Services change detected:", payload);
					queryClient.invalidateQueries({ queryKey: ["services"] });
				}
			)
			.subscribe((status) => {
				console.log("Services subscription status:", status);
			});

		return () => {
			console.log("Unsubscribing from services realtime...");
			supabase.removeChannel(channel);
		};
	}, [supabase, queryClient]);

	return {
		services: servicesQuery.data ?? [],
		activeServices: (servicesQuery.data ?? []).filter(s => s.active),
		isLoading: servicesQuery.isLoading,
		isError: servicesQuery.isError,
	};
}
