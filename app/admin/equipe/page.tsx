"use client";

import { useState } from "react";
import { useBarbers } from "@/hooks/useBarbers";
import { useBarbershopContext } from "@/providers/BarbershopProvider";
import {
	Plus,
	User,
	Loader2,
	Pencil,
	CheckCircle2,
	Trash2,
} from "lucide-react";
import AddBarberModal from "./AddBarberModal";
import EditBarberModal from "./EditBarberModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import ActionButton from "@/components/admin/ActionButton";
import { cn } from "@/lib/utils";
import { Barber } from "@/schemas/barberSchema";

/**
 * EquipePage - Main management dashboard for the team
 *
 * Objectives:
 * 1. List all team members
 * 2. Add new members
 * 3. Edit existing members
 * 4. Toggle active/inactive status
 * 5. Remove members
 */
export default function EquipePage() {
	const { barbershopId } = useBarbershopContext();
	const {
		barbers,
		isLoading,
		createBarber,
		updateBarber,
		toggleStatus,
		deleteBarber,
		isCreating,
		isUpdating,
		isDeleting,
	} = useBarbers(barbershopId);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [barberToEdit, setBarberToEdit] = useState<Barber | null>(null);
	const [barberToDelete, setBarberToDelete] = useState<Barber | null>(null);

	const handleAddBarber = async (data: Omit<Barber, "id">) => {
		await createBarber({ ...data, barbershop_id: barbershopId });
	};

	const handleEditBarber = async (payload: {
		id: string;
		data: Partial<Barber>;
	}) => {
		await updateBarber(payload);
	};

	const handleToggle = async (id: string, currentStatus: boolean) => {
		try {
			await toggleStatus({ id, active: !currentStatus });
		} catch (error) {
			console.error("Erro ao alterar status:", error);
		}
	};

	const handleConfirmDelete = async () => {
		if (!barberToDelete?.id) return;
		try {
			await deleteBarber(barberToDelete.id);
			setBarberToDelete(null);
		} catch (error) {
			console.error("Erro ao remover barbeiro:", error);
		}
	};

	return (
		<>
			{/* Main Card Container */}
			<div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
				{/* Card Header */}
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5">
					<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px] uppercase flex items-center gap-2">
						EQUIPE DE BARBEIROS
					</h2>
					<button
						onClick={() => setIsAddModalOpen(true)}
						className="
						flex flex-row items-center gap-2
						px-4 py-2
						font-['Barlow_Condensed'] text-[11px] font-bold tracking-widest uppercase
						rounded border-2 border-[#e0e0e0]
						hover:border-[#0a0a0a] hover:bg-white
						transition-all bg-white
						cursor-pointer
						disabled:opacity-50 disabled:cursor-not-allowed
					"
					>
						<Plus size={14} /> ADICIONAR
					</button>
				</div>

				{/* Card Content / List */}
				<div className="divide-y divide-gray-100">
					{isLoading ? (
						<div className="p-20 flex items-center justify-center gap-2 text-gray-400">
							<Loader2 className="animate-spin" />
							<p className="font-semibold text-sm">Carregando equipe...</p>
						</div>
					) : barbers.length === 0 ? (
						<div className="p-20 text-center text-gray-400">
							<p className="font-semibold italic">Nenhum membro cadastrado.</p>
						</div>
					) : (
						barbers.map((barber) => (
							<div
								key={barber.id}
								className="flex flex-col gap-3 p-5 hover:bg-gray-50/50 transition-colors"
							>
								{/* Top row: Avatar + Info + Badge */}
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div
											className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full text-white font-['Bebas_Neue'] text-lg shadow-sm"
											style={{ backgroundColor: barber.color || "#0a0a0a" }}
										>
											{barber.name ? (
												barber.name
													.split(" ")
													.map((word) => word[0])
													.join("")
													.slice(0, 2)
													.toUpperCase()
											) : (
												<User size={20} />
											)}
										</div>
										<div>
											<div className="flex items-center gap-2">
												<h4 className="font-bold text-[#0a0a0a] leading-tight text-sm">
													{barber.name}
												</h4>
												{/* Status badge */}
												<span
													className={cn(
														"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
														barber.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500",
													)}
												>
													<span
														className={cn(
															"w-1.5 h-1.5 rounded-full",
															barber.active ? "bg-green-500" : "bg-gray-400",
														)}
													/>
													{barber.active ? "Ativo" : "Inativo"}
												</span>
											</div>
											<p className="text-gray-400 text-xs font-medium uppercase tracking-wider mt-0.5">
												{barber.role}
											</p>
											{barber.tags && barber.tags.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-1.5">
													{barber.tags.map((tag) => (
														<span
															key={tag}
															className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 capitalize"
														>
															{tag}
														</span>
													))}
												</div>
											)}
										</div>
									</div>

									{/* Desktop actions (hidden on mobile) */}
									<div className="hidden md:flex items-center gap-2">
										<ActionButton
											onClick={() => setBarberToEdit(barber)}
											title="Editar"
											icon={<Pencil size={16} />}
											className="hover:border-gray-500 hover:bg-gray-500 hover:text-white"
										/>
										<ActionButton
											onClick={() => handleToggle(barber.id!, !!barber.active)}
											title={barber.active ? "Inativar" : "Ativar"}
											icon={<CheckCircle2 size={16} />}
											className={
												barber.active
													? "text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white"
													: "text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-white"
											}
										/>
										<ActionButton
											onClick={() => setBarberToDelete(barber)}
											title="Remover"
											icon={<Trash2 size={16} />}
											className="text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white"
										/>
									</div>
								</div>

								{/* Mobile actions (hidden on desktop) */}
								<div className="flex md:hidden justify-between gap-2">
									<ActionButton
										onClick={() => setBarberToEdit(barber)}
										title="Editar"
										icon={<Pencil size={16} />}
										mobileActionBtn
										className="hover:border-gray-500 hover:bg-gray-500 hover:text-white"
									>
										Editar
									</ActionButton>
									<ActionButton
										onClick={() => handleToggle(barber.id!, !!barber.active)}
										title={barber.active ? "Inativar" : "Ativar"}
										icon={<CheckCircle2 size={16} />}
										mobileActionBtn
										className={
											barber.active
												? "text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white"
												: "text-green-500 hover:border-green-500 hover:bg-green-500 hover:text-white"
										}
									>
										{barber.active ? "Inativar" : "Ativar"}
									</ActionButton>
									<ActionButton
										onClick={() => setBarberToDelete(barber)}
										title="Remover"
										icon={<Trash2 size={16} />}
										mobileActionBtn
										className="text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white"
									>
										Remover
									</ActionButton>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			<AddBarberModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onSuccess={handleAddBarber}
				isLoading={isCreating}
			/>

			{barberToEdit && (
				<EditBarberModal
					isOpen={!!barberToEdit}
					onClose={() => setBarberToEdit(null)}
					onSuccess={handleEditBarber}
					isLoading={isUpdating}
					barber={barberToEdit}
				/>
			)}

			<ConfirmationModal
				isOpen={!!barberToDelete}
				onClose={() => setBarberToDelete(null)}
				onConfirm={handleConfirmDelete}
				loading={isDeleting}
				title={`Remover ${barberToDelete?.name ?? "membro"}`}
				subtitle="Tem certeza que deseja remover este membro? Esta ação não pode ser desfeita."
				confirmText="Remover"
			/>
		</>
	);
}
