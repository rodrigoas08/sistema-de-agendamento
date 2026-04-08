"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { barberSchema, Barber } from "@/schemas/barberSchema";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddBarberModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (data: Omit<Barber, "id">) => Promise<void>;
	isLoading: boolean;
}

/**
 * AddBarberModal - Modal form to add a new team member
 */
export default function AddBarberModal({ isOpen, onClose, onSuccess, isLoading }: AddBarberModalProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<Barber>({
		resolver: zodResolver(barberSchema),
		defaultValues: {
			active: true,
			tags: [],
			color: "#0a0a0a",
		},
	});

	if (!isOpen) return null;

	const onSubmit = async (data: Barber) => {
		try {
			await onSuccess({
				name: data.name,
				role: data.role,
				active: data.active ?? true,
				color: data.color ?? "#0a0a0a",
				tags: data.tags ?? [],
			});
			reset();
			onClose();
		} catch (error) {
			console.error("Erro ao adicionar barbeiro:", error);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
			<div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
				<div className="flex items-center justify-between p-6 border-b border-gray-100">
					<h3 className="font-['Bebas_Neue'] text-2xl tracking-wider">ADICIONAR MEMBRO</h3>
					<button 
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
					>
						<X size={20} className="text-gray-500" />
					</button>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
					<div>
						<label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
							Nome Completo
						</label>
						<input
							{...register("name")}
							className={cn(
								"w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm",
								errors.name && "border-red-500"
							)}
							placeholder="Ex: Diego Moura"
						/>
						{errors.name && (
							<p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name.message}</p>
						)}
					</div>

					<div>
						<label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
							Especialidade / Cargo
						</label>
						<input
							{...register("role")}
							className={cn(
								"w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm",
								errors.role && "border-red-500"
							)}
							placeholder="Ex: Especialista em Degradê"
						/>
						{errors.role && (
							<p className="text-red-500 text-[10px] mt-1 font-bold">{errors.role.message}</p>
						)}
					</div>

					<div className="pt-4 flex gap-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
						>
							CANCELAR
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-200"
						>
							{isLoading ? <Loader2 className="animate-spin" size={18} /> : "SALVAR MEMBRO"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
