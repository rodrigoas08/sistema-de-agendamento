"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBarbershopContext } from "@/providers/BarbershopProvider";
import { barbershopService } from "@/services/barbershopService";
import {
	barbershopSettingsSchema,
	type BarbershopSettings,
} from "@/schemas/barbershopSchema";
import {
	Save,
	Loader2,
	Store,
	Palette,
	MapPin,
	ImagePlus,
	Trash2,
	ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * ConfiguracoesPage - Painel de configuração Whitelabel do estabelecimento
 *
 * Permite ao dono alterar: nome, cor, logo, endereço, Google Maps e galeria
 */
export default function ConfiguracoesPage() {
	const { barbershop, barbershopId } = useBarbershopContext();
	const queryClient = useQueryClient();
	const [saveSuccess, setSaveSuccess] = useState(false);

	const router = useRouter();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<BarbershopSettings>({
		resolver: zodResolver(barbershopSettingsSchema),
		defaultValues: {
			name: barbershop.name,
			logo_url: barbershop.logo_url ?? "",
			theme_color: barbershop.theme_color ?? "#e63946",
			address: barbershop.address ?? "",
			google_maps_url: barbershop.google_maps_url ?? "",
			gallery_images: barbershop.gallery_images ?? [],
		},
	});

	const updateMutation = useMutation({
		mutationFn: (settings: BarbershopSettings) =>
			barbershopService.updateSettings(barbershopId, settings),
		onSuccess: (_, variables) => {
			reset(variables); // atualiza os defaultValues do form apagando o isDirty
			router.refresh(); // re-executa os Server Components (admin/layout.tsx) pra bater as novas props no Context
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		},
	});

	const onSubmit = (data: BarbershopSettings) => {
		updateMutation.mutate(data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px] uppercase">
						CONFIGURAÇÕES DO ESTABELECIMENTO
					</h2>
					<p className="text-xs text-gray-400 mt-1">
						Personalize a identidade visual e informações do seu negócio.
					</p>
				</div>
				<button
					type="submit"
					disabled={!isDirty || updateMutation.isPending}
					className={cn(
						"flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all",
						isDirty
							? "bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] cursor-pointer"
							: "bg-gray-100 text-gray-400 cursor-not-allowed",
					)}
				>
					{updateMutation.isPending ? (
						<Loader2 size={16} className="animate-spin" />
					) : (
						<Save size={16} />
					)}
					Salvar
				</button>
			</div>

			{/* Success toast */}
			{saveSuccess && (
				<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
					✅ Configurações salvas com sucesso!
				</div>
			)}

			{/* Error toast */}
			{updateMutation.isError && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
					❌ Erro ao salvar. Tente novamente.
				</div>
			)}

			{/* ── Identidade Visual ── */}
			<fieldset className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-5">
				<legend className="flex items-center gap-2 font-['Bebas_Neue'] text-lg tracking-[1px] px-2">
					<Store size={18} className="text-gray-400" />
					IDENTIDADE VISUAL
				</legend>

				{/* Nome */}
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="name"
						className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500"
					>
						Nome do Estabelecimento *
					</label>
					<input
						id="name"
						type="text"
						{...register("name")}
						className="px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0a0a0a] transition-colors"
						placeholder="Ex: Barbearia do Zé"
					/>
					{errors.name && (
						<p className="text-red-500 text-xs mt-1" aria-live="polite">
							{errors.name.message}
						</p>
					)}
				</div>

				{/* Logo URL */}
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="logo_url"
						className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500"
					>
						URL da Logo
					</label>
					<input
						id="logo_url"
						type="url"
						{...register("logo_url")}
						className="px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0a0a0a] transition-colors"
						placeholder="https://exemplo.com/logo.png"
					/>
					{errors.logo_url && (
						<p className="text-red-500 text-xs mt-1" aria-live="polite">
							{errors.logo_url.message}
						</p>
					)}
				</div>

				{/* Theme Color */}
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="theme_color"
						className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 flex items-center gap-2"
					>
						<Palette size={14} />
						Cor Primária
					</label>
					<div className="flex items-center gap-3">
						<input
							id="theme_color"
							type="color"
							{...register("theme_color")}
							className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
						/>
						<input
							type="text"
							{...register("theme_color")}
							className="flex-1 px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm font-medium font-mono focus:outline-none focus:border-[#0a0a0a] transition-colors"
							placeholder="#e63946"
						/>
					</div>
					{errors.theme_color && (
						<p className="text-red-500 text-xs mt-1" aria-live="polite">
							{errors.theme_color.message}
						</p>
					)}
				</div>
			</fieldset>

			{/* ── Localização ── */}
			<fieldset className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-5">
				<legend className="flex items-center gap-2 font-['Bebas_Neue'] text-lg tracking-[1px] px-2">
					<MapPin size={18} className="text-gray-400" />
					LOCALIZAÇÃO
				</legend>

				{/* Endereço */}
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="address"
						className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500"
					>
						Endereço Completo
					</label>
					<textarea
						id="address"
						{...register("address")}
						rows={2}
						className="px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0a0a0a] transition-colors resize-y"
						placeholder="Rua Exemplo, 123 - Centro, Cidade - UF"
					/>
				</div>

				{/* Google Maps */}
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="google_maps_url"
						className="font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-500 flex items-center gap-2"
					>
						<ExternalLink size={14} />
						Link do Google Maps
					</label>
					<input
						id="google_maps_url"
						type="url"
						{...register("google_maps_url")}
						className="px-4 py-3 border-[1.5px] border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0a0a0a] transition-colors"
						placeholder="https://maps.google.com/..."
					/>
					{errors.google_maps_url && (
						<p className="text-red-500 text-xs mt-1" aria-live="polite">
							{errors.google_maps_url.message}
						</p>
					)}
				</div>
			</fieldset>

			{/* ── Galeria ── */}
			<fieldset className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-5">
				<legend className="flex items-center gap-2 font-['Bebas_Neue'] text-lg tracking-[1px] px-2">
					<ImagePlus size={18} className="text-gray-400" />
					GALERIA DE FOTOS
				</legend>

				<p className="text-xs text-gray-400">
					Adicione URLs das fotos do seu espaço e trabalhos. As imagens aparecerão na sua página pública.
				</p>

				{/* Galeria: placeholder informativo */}
				<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
					{(barbershop.gallery_images ?? []).length === 0 ? (
						<div className="col-span-full text-center py-10 text-gray-300">
							<ImagePlus size={40} className="mx-auto mb-3 opacity-50" />
							<p className="text-sm font-medium">Nenhuma foto na galeria ainda</p>
							<p className="text-xs text-gray-400 mt-1">
								Este recurso será expandido em breve com upload de imagens.
							</p>
						</div>
					) : (
						(barbershop.gallery_images ?? []).map((imageUrl, index) => (
							<div
								key={index}
								className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group"
							>
								<img
									src={imageUrl}
									alt={`Foto ${index + 1}`}
									className="w-full h-full object-cover"
								/>
								<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<button
										type="button"
										className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
										title="Remover foto"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</fieldset>

			{/* Info do Slug (read-only) */}
			<div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
				<p className="text-xs text-gray-400 font-medium">
					<span className="font-bold text-gray-500">URL Pública:</span>{" "}
					<code className="bg-white px-2 py-1 rounded border border-gray-200 text-[#0a0a0a] font-mono">
						site.com/{barbershop.slug}/agendar
					</code>
				</p>
				<p className="text-[10px] text-gray-400 mt-1.5">
					O slug não pode ser alterado por aqui. Se precisar, entre em contato com o suporte.
				</p>
			</div>
		</form>
	);
}
