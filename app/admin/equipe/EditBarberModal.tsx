"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Barber } from "@/schemas/barberSchema";
import TagsInput from "./TagsInput";

const editBarberSchema = z.object({
	name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
	role: z.string().min(3, "O cargo deve ter pelo menos 3 caracteres"),
	tags: z.array(z.string()).optional(),
});

type EditBarberFormData = z.infer<typeof editBarberSchema>;

interface EditBarberModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (data: { id: string; data: Partial<Barber> }) => Promise<void>;
	isLoading: boolean;
	barber: Barber;
}

/**
 * EditBarberModal - Modal form to edit an existing team member
 *
 * @param {EditBarberModalProps} props - Component props
 */
export default function EditBarberModal({
	isOpen,
	onClose,
	onSuccess,
	isLoading,
	barber,
}: EditBarberModalProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<EditBarberFormData>({
		resolver: zodResolver(editBarberSchema),
		defaultValues: {
			name: barber.name,
			role: barber.role,
			tags: barber.tags ?? [],
		},
	});

	const currentTags = watch("tags") ?? [];

	if (!isOpen) return null;

	const handleTagsChange = (updatedTags: string[]) => {
		setValue("tags", updatedTags, { shouldValidate: true });
	};

	const onSubmit = async (formData: EditBarberFormData) => {
		try {
			await onSuccess({
				id: barber.id!,
				data: {
					name: formData.name,
					role: formData.role,
					tags: formData.tags,
				},
			});
			onClose();
		} catch (submitError) {
			console.error("Erro ao editar barbeiro:", submitError);
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="flex items-center justify-between p-6 border-b border-gray-100">
					<h3 className="font-['Bebas_Neue'] text-2xl tracking-wider">EDITAR MEMBRO</h3>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
					>
						<X size={20} className="text-gray-500" />
					</button>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
					<div>
						<label
							htmlFor="edit-barber-name"
							className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
						>
							Nome Completo
						</label>
						<input
							id="edit-barber-name"
							{...register("name")}
							className={cn(
								"w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm",
								errors.name && "border-red-500",
							)}
							placeholder="Ex: Diego Moura"
						/>
						{errors.name && (
							<p
								className="text-red-500 text-[10px] mt-1 font-bold"
								role="alert"
								aria-live="polite"
							>
								{errors.name.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="edit-barber-role"
							className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
						>
							Especialidade / Cargo
						</label>
						<input
							id="edit-barber-role"
							{...register("role")}
							className={cn(
								"w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm",
								errors.role && "border-red-500",
							)}
							placeholder="Ex: Especialista em Degradê"
						/>
						{errors.role && (
							<p
								className="text-red-500 text-[10px] mt-1 font-bold"
								role="alert"
								aria-live="polite"
							>
								{errors.role.message}
							</p>
						)}
					</div>

					<TagsInput tags={currentTags} onChange={handleTagsChange} />

					<div className="pt-4 flex gap-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
						>
							CANCELAR
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className="flex-1 py-3 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-200"
						>
							{isLoading ? (
								<Loader2 className="animate-spin" size={18} />
							) : (
								"SALVAR ALTERAÇÕES"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
