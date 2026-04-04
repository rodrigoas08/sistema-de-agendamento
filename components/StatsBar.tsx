import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface StatsBarProps {
	statsCountColor?: string;
}

export function StatsBar({
	statsCountColor = "text-[#d4a017]",
}: StatsBarProps) {
	const supabase = createClient();
	const [barbersCount, setBarbersCount] = useState(0);
	const [servicesCount, setServicesCount] = useState(0);

	useEffect(() => {
		const loadInitialData = async () => {
			const [{ count: bCount }, { count: sCount }] = await Promise.all([
				supabase.from("barbers").select("*", { count: "exact", head: true }),
				supabase.from("services").select("*", { count: "exact", head: true }),
			]);
			if (bCount !== null) setBarbersCount(bCount);
			if (sCount !== null) setServicesCount(sCount);
		};
		loadInitialData();
	}, [supabase]);

	function LoaderSpinner() {
		return (
			<div className="flex flex-col items-center justify-center text-lg text-[#d4a017]/90">
				<Loader2 className="animate-spin" /> Carregando...
			</div>
		);
	}

	return (
		<Suspense fallback={<LoaderSpinner />}>
			<div className="relative z-10 grid grid-cols-4 mt-auto pt-8 md:px-18 lg:px-55 border-t border-white/10 text-3xl">
				<div className="text-center px-0 border-r border-white/10">
					<b className={cn(statsCountColor, "block leading-none")}>{barbersCount}</b>
					<span className="text-[11px] text-[#888] uppercase tracking-[2px] font-semibold">
						Barbeiros
					</span>
				</div>
				<div className="text-center border-r border-white/10">
					<b className={cn(statsCountColor, "block leading-none")}>{servicesCount}</b>
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
