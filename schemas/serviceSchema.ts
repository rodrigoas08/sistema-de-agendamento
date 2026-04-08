import * as z from "zod";

/**
 * Zod schema for service validation
 */
export const serviceSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().min(3, "O nome do serviço deve ter pelo menos 3 caracteres"),
	description: z.string().optional(),
	price: z.number().min(0, "O preço não pode ser negativo"),
	duration: z.string().min(1, "A duração é obrigatória"),
	icon: z.string().optional(),
	active: z.boolean().optional().default(true),
});

export type Service = z.infer<typeof serviceSchema>;
