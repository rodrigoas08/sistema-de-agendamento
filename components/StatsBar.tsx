import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useBarbers } from "@/hooks/useBarbers";

interface StatsBarProps {
	statsCountColor?: string;
}

function LoaderSpinner() {
	return (
		<div className="flex flex-col items-center justify-center text-lg text-white/90">
			<Loader2 className="animate-spin text-[#d4a017]" /> Carregando...
		</div>
	);
}

import { useServices } from "@/hooks/useServices";

export function StatsBar({
	statsCountColor = "text-[#d4a017]",
}: StatsBarProps) {
	const { activeBarbers, isLoading: isBarbersLoading } = useBarbers();
	const { activeServices, isLoading: isServicesLoading } = useServices();

	if (isBarbersLoading || isServicesLoading) return <LoaderSpinner />;

	return (
		<Suspense fallback={<LoaderSpinner />}>
			<div className="relative z-10 grid grid-cols-4 mt-auto py-8 md:px-18 lg:px-55 text-3xl">
				<div className="text-center px-0 border-r border-white/10">
					<b className={cn(statsCountColor, "block leading-none")}>
						{activeBarbers.length}
					</b>
					<span className="text-[11px] text-[#888] uppercase tracking-[2px] font-semibold">
						Barbeiros
					</span>
				</div>
				<div className="text-center border-r border-white/10">
					<b className={cn(statsCountColor, "block leading-none")}>
						{activeServices.length}
					</b>
					<span className="text-[11px] text-[#888] uppercase tracking-[2px] font-semibold">
						Serviços
					</span>
				</div>
				<div className="text-center border-r border-white/10">
					<b className={cn(statsCountColor, "block leading-none")}>100%</b>
					<span className="text-[11px] text-[#888] uppercase tracking-[2px] font-semibold">
						Online
					</span>
				</div>
				<div className="text-center">
					<b className={cn(statsCountColor, "block leading-none")}>0</b>
					<span className="text-[11px] text-[#888] uppercase tracking-[2px] font-semibold">
						Fila
					</span>
				</div>
			</div>
		</Suspense>
	);
}
