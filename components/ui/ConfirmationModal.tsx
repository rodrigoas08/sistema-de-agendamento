"use client";

interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	subtitle: string;
	confirmText?: string;
	cancelText?: string;
	loading?: boolean;
}

export default function ConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	subtitle,
	confirmText = "Confirmar",
	cancelText = "Cancelar",
	loading = false,
}: ConfirmationModalProps) {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-100 flex items-center justify-center py-2 px-4 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-in-out"
			onClick={onClose}
		>
			<div
				className="w-full max-w-sm relative flex flex-col p-8 gap-2 rounded-sm bg-white transition-all duration-300 animate-in fade-in zoom-in-95"
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="font-['Bebas_Neue'] text-lg tracking-[1px] text-black">
					{title}
				</h3>
				<p className="font-['Barlow_Condensed'] text-base font-medium tracking-wide text-gray-500">
					{subtitle}
				</p>
				<div className="mt-4 w-full flex justify-end gap-4 sm:flex-row">
					<button
						onClick={onClose}
						disabled={loading}
						className="px-4 py-[10px] rounded font-['Barlow_Condensed'] text-xs font-bold tracking-widest uppercase cursor-pointer text-red-500 hover:border-red-600 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
					>
						{cancelText}
					</button>

					<button
						onClick={onConfirm}
						disabled={loading}
						className="px-4 py-[10px] rounded bg-red-500 font-['Barlow_Condensed'] text-xs font-semibold tracking-widest uppercase cursor-pointer text-white hover:bg-red-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
					>
						{loading ? "Confirmando..." : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}
