import { createClient } from "@/utils/supabase/client";
import { Barber } from "@/schemas/barberSchema";

const supabase = createClient();

/**
 * Barber Service - Handles all database interactions for barbers
 * Filtrado por barbershop_id para isolamento multi-tenant
 */
export const barberService = {
	/**
	 * Fetches all barbers from a specific barbershop
	 *
	 * @param {string} barbershopId - UUID do estabelecimento
	 * @returns {Promise<Barber[]>} List of barbers
	 */
	async getAll(barbershopId: string): Promise<Barber[]> {
		const { data, error } = await supabase
			.from("barbers")
			.select("*")
			.eq("barbershop_id", barbershopId)
			.order("name", { ascending: true });

		if (error) throw new Error(error.message);
		return data as Barber[];
	},

	/**
	 * Adds a new barber to the database
	 *
	 * @param {Omit<Barber, "id">} barber - Barber data to insert
	 * @returns {Promise<Barber>} The inserted barber
	 */
	async create(barber: Omit<Barber, "id">): Promise<Barber> {
		const { data, error } = await supabase
			.from("barbers")
			.insert(barber)
			.select()
			.single();

		if (error) throw new Error(error.message);
		return data as Barber;
	},

	/**
	 * Updates an existing barber
	 *
	 * @param {string} id - Barber ID
	 * @param {Partial<Barber>} barber - Data to update
	 * @returns {Promise<Barber>} The updated barber
	 */
	async update(id: string, barber: Partial<Barber>): Promise<Barber> {
		const { data, error } = await supabase
			.from("barbers")
			.update(barber)
			.eq("id", id)
			.select()
			.single();

		if (error) throw new Error(error.message);
		return data as Barber;
	},

	/**
	 * Toggles the active status of a barber
	 *
	 * @param {string} id - Barber ID
	 * @param {boolean} active - New active status
	 * @returns {Promise<Barber>} The updated barber
	 */
	async toggleStatus(id: string, active: boolean): Promise<Barber> {
		return this.update(id, { active });
	},

	/**
	 * Removes a barber from the database
	 *
	 * @param {string} id - Barber ID to delete
	 */
	async remove(id: string): Promise<void> {
		const { error } = await supabase
			.from("barbers")
			.delete()
			.eq("id", id);

		if (error) throw new Error(error.message);
	},
};
