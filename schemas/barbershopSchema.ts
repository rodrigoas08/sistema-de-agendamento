import * as z from "zod";

/**
 * Zod schema for barbershop (tenant) validation
 */
export const barbershopSchema = z.object({
	id: z.string().uuid().optional(),
	owner_id: z.string().uuid(),
	slug: z
		.string()
		.min(3, "O slug deve ter pelo menos 3 caracteres")
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"O slug deve conter apenas letras minúsculas, números e hífens",
		),
	name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
	logo_url: z.string().url("URL inválida").optional().or(z.literal("")),
	theme_color: z.string().optional().default("#e63946"),
	address: z.string().optional(),
	google_maps_url: z.string().url("URL inválida").optional().or(z.literal("")),
	gallery_images: z.array(z.string().url()).optional().default([]),
	created_at: z.string().datetime().optional(),
});

export type Barbershop = z.infer<typeof barbershopSchema>;

/**
 * Schema parcial para atualização de configurações do estabelecimento
 */
export const barbershopSettingsSchema = z.object({
	name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
	logo_url: z.string().optional().default(""),
	theme_color: z.string().optional().default("#e63946"),
	address: z.string().optional().default(""),
	google_maps_url: z.string().optional().default(""),
	gallery_images: z.array(z.string()).optional().default([]),
});

export type BarbershopSettings = z.input<typeof barbershopSettingsSchema>;

