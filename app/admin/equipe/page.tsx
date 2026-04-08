"use client";

import { useState } from "react";
import { useBarbers } from "@/hooks/useBarbers";
import { Plus, User, Loader2 } from "lucide-react";
import AddBarberModal from "./AddBarberModal";
import Switch from "@/components/ui/Switch";
import { cn } from "@/lib/utils";
import { Barber } from "@/schemas/barberSchema";

/**
 * EquipePage - Main management dashboard for the team
 *
 * Objectives:
 * 1. List all team members
 * 2. Add new members
 * 3. Toggle active/inactive status
 */
export default function EquipePage() {
	const { barbers, isLoading, createBarber, toggleStatus, isCreating } =
		useBarbers();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleAddBarber = async (data: Omit<Barber, "id">) => {
		await createBarber(data);
	};

	const handleToggle = async (id: string, currentStatus: boolean) => {
		try {
			await toggleStatus({ id, active: !currentStatus });
		} catch (error) {
			console.error("Erro ao alterar status:", error);
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
						onClick={() => setIsModalOpen(true)}
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
								className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
							>
								{/* Left side: Avatar and Info */}
								<div className="flex items-center gap-4">
									<div
										className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full text-white font-['Bebas_Neue'] text-lg shadow-sm"
										style={{ backgroundColor: barber.color || "#0a0a0a" }}
									>
										{barber.name ? (
											barber.name
												.split(" ")
												.map((w) => w[0])
												.join("")
												.slice(0, 2)
												.toUpperCase()
										) : (
											<User size={20} />
										)}
									</div>
									<div>
										<h4 className="font-bold text-[#0a0a0a] leading-tight text-sm">
											{barber.name}
										</h4>
										<p className="text-gray-400 text-xs font-medium uppercase tracking-wider mt-0.5">
											{barber.role}
										</p>
									</div>
								</div>

								{/* Right side: Status and Toggle */}
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2 mr-2">
										<div
											className={cn(
												"w-2 h-2 rounded-full",
												barber.active ? "bg-[#5DBE3F]" : "bg-gray-300",
											)}
										/>
										<span
											className={cn(
												"text-xs font-bold font-['Barlow'] tracking-wide",
												barber.active ? "text-[#5DBE3F]" : "text-gray-400",
											)}
										>
											{barber.active ? "Ativo" : "Inativo"}
										</span>
									</div>
									<Switch
										checked={!!barber.active}
										onChange={() => handleToggle(barber.id!, !!barber.active)}
										className="scale-90"
									/>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			<AddBarberModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={handleAddBarber}
				isLoading={isCreating}
			/>
		</>
	);
}
