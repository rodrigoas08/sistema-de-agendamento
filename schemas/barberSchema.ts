import * as z from "zod";

/**
 * Zod schema for barber validation
 */
export const barberSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
	role: z.string().min(3, "O cargo deve ter pelo menos 3 caracteres"),
	color: z.string().optional(),
	active: z.boolean().optional(),
	tags: z.array(z.string()).optional(),
	rating: z.number().optional().default(5),
	total_cuts: z.number().optional().default(0),
	badge: z.string().optional(),
});

export type Barber = z.infer<typeof barberSchema>;
