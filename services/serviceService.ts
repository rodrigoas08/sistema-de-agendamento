import { createClient } from "@/utils/supabase/client";
import { Service } from "@/schemas/serviceSchema";

const supabase = createClient();

/**
 * Service (Service layer) - Handles all database interactions for services
 */
export const serviceService = {
	/**
	 * Fetches all services from the database
	 *
	 * @returns {Promise<Service[]>} List of services
	 */
	async getAll(): Promise<Service[]> {
		const { data, error } = await supabase
			.from("services")
			.select("*")
			.order("name", { ascending: true });

		if (error) throw new Error(error.message);
		return data as Service[];
	},
};
