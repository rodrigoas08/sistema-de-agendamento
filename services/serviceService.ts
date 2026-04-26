import { createClient } from "@/utils/supabase/client";
import { Service } from "@/schemas/serviceSchema";

const supabase = createClient();

/**
 * Service (Service layer) - Handles all database interactions for services
 * Filtrado por barbershop_id para isolamento multi-tenant
 */
export const serviceService = {
	/**
	 * Fetches all services from a specific barbershop
	 *
	 * @param {string} barbershopId - UUID do estabelecimento
	 * @returns {Promise<Service[]>} List of services
	 */
	async getAll(barbershopId: string): Promise<Service[]> {
		const { data, error } = await supabase
			.from("services")
			.select("*")
			.eq("barbershop_id", barbershopId)
			.order("name", { ascending: true });

		if (error) throw new Error(error.message);
		return data as Service[];
	},
};
