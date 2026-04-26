import { createClient } from "@/utils/supabase/client";
import type { Barbershop, BarbershopSettings } from "@/schemas/barbershopSchema";

const supabase = createClient();

/**
 * Barbershop Service - Handles all database interactions for tenants
 */
export const barbershopService = {
	/**
	 * Busca um estabelecimento pelo slug (usado nas rotas públicas)
	 *
	 * @param {string} slug - Slug único do estabelecimento
	 * @returns {Promise<Barbershop | null>} O estabelecimento encontrado ou null
	 */
	async getBySlug(slug: string): Promise<Barbershop | null> {
		const { data, error } = await supabase
			.from("barbershops")
			.select("*")
			.eq("slug", slug)
			.single();

		if (error) return null;
		return data as Barbershop;
	},

	/**
	 * Busca o estabelecimento vinculado ao usuário logado (owner)
	 *
	 * @param {string} ownerId - UUID do owner autenticado
	 * @returns {Promise<Barbershop | null>} O estabelecimento do owner
	 */
	async getByOwnerId(ownerId: string): Promise<Barbershop | null> {
		const { data, error } = await supabase
			.from("barbershops")
			.select("*")
			.eq("owner_id", ownerId)
			.single();

		if (error) return null;
		return data as Barbershop;
	},

	/**
	 * Lista todos os estabelecimentos (apenas para Super Admin)
	 *
	 * @returns {Promise<Barbershop[]>} Lista de todos os estabelecimentos
	 */
	async getAll(): Promise<Barbershop[]> {
		const { data, error } = await supabase
			.from("barbershops")
			.select("*")
			.order("name", { ascending: true });

		if (error) throw new Error(error.message);
		return data as Barbershop[];
	},

	/**
	 * Atualiza as configurações visuais de um estabelecimento
	 *
	 * @param {string} barbershopId - UUID do estabelecimento
	 * @param {BarbershopSettings} settings - Dados a atualizar
	 * @returns {Promise<Barbershop>} O estabelecimento atualizado
	 */
	async updateSettings(
		barbershopId: string,
		settings: BarbershopSettings,
	): Promise<Barbershop> {
		const { data, error } = await supabase
			.from("barbershops")
			.update(settings)
			.eq("id", barbershopId)
			.select()
			.single();

		if (error) throw new Error(error.message);
		return data as Barbershop;
	},
};
