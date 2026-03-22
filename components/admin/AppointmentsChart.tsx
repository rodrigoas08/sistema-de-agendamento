"use client";

import { useEffect, useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { createClient } from "@/utils/supabase/client";

// ─── TYPES ───────────────────────────────────────────────
type RawRow = {
	date: string;
	status: string;
	total: number;
};

type ChartPoint = {
	month: string;
	monthKey: string;
	confirmados: number;
	cancelados: number;
	faturamento: number;
};

type ViewMode = "appointments" | "revenue";

// ─── CONSTANTS ───────────────────────────────────────────
const MONTH_LABELS: Record<string, string> = {
	"01": "Jan",
	"02": "Fev",
	"03": "Mar",
	"04": "Abr",
	"05": "Mai",
	"06": "Jun",
	"07": "Jul",
	"08": "Ago",
	"09": "Set",
	"10": "Out",
	"11": "Nov",
	"12": "Dez",
};

function getLastNMonths(n: number): string[] {
	const months: string[] = [];
	const now = new Date();
	for (let i = n - 1; i >= 0; i--) {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		months.push(`${y}-${m}`);
	}
	return months;
}

// ─── TOOLTIP ─────────────────────────────────────────────
function CustomTooltip({
	active,
	payload,
	label,
	mode,
}: {
	active?: boolean;
	payload?: { name: string; value: number; color: string }[];
	label?: string;
	mode: ViewMode;
}) {
	if (!active || !payload?.length) return null;
	return (
		<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md text-sm">
			<p className="border-b border-gray-100 px-3 py-2 font-bold text-gray-700">
				{label}
			</p>
			{payload.map((p) => (
				<div
					key={p.name}
					className="flex items-center justify-between gap-6 px-3 py-1.5"
				>
					<span className="flex items-center gap-1.5 text-gray-500">
						<span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
						{p.name}
					</span>
					<span className="font-bold text-gray-800">
						{mode === "revenue"
							? `R$${Number(p.value).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
							: p.value}
					</span>
				</div>
			))}
		</div>
	);
}

// ─── BUTTON HELPERS ───────────────────────────────────────
const filterBtn = (active: boolean) => `
	px-2.5 py-1.5
	font-['Barlow_Condensed'] text-[11px] font-bold tracking-wide uppercase
	transition-all
	${active ? "bg-black text-white" : "bg-white text-gray-500 hover:bg-gray-50"}
`;

// ─── COMPONENT ───────────────────────────────────────────
export default function AppointmentsChart() {
	const [rows, setRows] = useState<RawRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [mode, setMode] = useState<ViewMode>("appointments");
	const [period, setPeriod] = useState<6 | 12>(6);
	const [year, setYear] = useState<number | null>(null); // null = usar period
	const supabase = createClient();

	const availableYears = useMemo(() => {
		const cur = new Date().getFullYear();
		return Array.from({ length: 5 }, (_, i) => cur - i);
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);

			let startDate: string;
			if (year !== null) {
				startDate = `${year}-01-01`;
			} else {
				const d = new Date();
				d.setMonth(d.getMonth() - period + 1);
				d.setDate(1);
				startDate = d.toISOString().split("T")[0];
			}

			const endDate = year !== null ? `${year}-12-31` : undefined;

			let query = supabase
				.from("appointments")
				.select("date, status, total")
				.gte("date", startDate)
				.in("status", ["confirmed", "done", "cancelled"]);

			if (endDate) query = query.lte("date", endDate);

			const { data, error } = await query;
			if (!error && data) setRows(data as RawRow[]);
			setLoading(false);
		};

		fetchData();
	}, [period, year, supabase]);

	const chartData = useMemo<ChartPoint[]>(() => {
		const monthKeys =
			year !== null
				? Array.from(
						{ length: 12 },
						(_, i) => `${year}-${String(i + 1).padStart(2, "0")}`,
					)
				: getLastNMonths(period);

		return monthKeys.map((key) => {
			const [y, m] = key.split("-");
			const monthRows = rows.filter((r) => r.date.startsWith(key));

			const confirmados = monthRows.filter(
				(r) => r.status === "confirmed" || r.status === "done",
			).length;

			const cancelados = monthRows.filter((r) => r.status === "cancelled").length;

			const faturamento = monthRows
				.filter((r) => r.status === "confirmed" || r.status === "done")
				.reduce((s, r) => s + Number(r.total ?? 0), 0);

			return {
				month: `${MONTH_LABELS[m] ?? m}/${y.slice(2)}`,
				monthKey: key,
				confirmados,
				cancelados,
				faturamento,
			};
		});
	}, [rows, period, year]);

	const isEmpty = chartData.every((d) =>
		mode === "appointments"
			? d.confirmados === 0 && d.cancelados === 0
			: d.faturamento === 0,
	);

	// ─── RENDER ───────────────────────────────────────────
	return (
		<div className="mb-6 overflow-hidden rounded-xl border-2 border-gray-200 bg-white">
			{/* ── header: título + toggle modo ── */}
			<div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 p-4 md:p-5">
				<div>
					<h2 className="font-['Bebas_Neue'] text-xl tracking-[1.5px]">VISÃO GERAL</h2>
					<p className="mt-0.5 text-xs text-gray-400">
						{mode === "appointments" ? "Confirmados vs cancelados" : "Faturamento mensal"}
					</p>
				</div>

				{/* toggle modo — sempre visível no canto direito */}
				<div className="flex overflow-hidden rounded border border-gray-200">
					<button
						onClick={() => setMode("appointments")}
						className={filterBtn(mode === "appointments")}
					>
						Agendamentos
					</button>
					<button
						onClick={() => setMode("revenue")}
						className={filterBtn(mode === "revenue")}
					>
						Faturamento
					</button>
				</div>
			</div>

			{/* ── filtros de período: linha própria, scroll horizontal no mobile ── */}
			<div className="overflow-x-auto border-b border-gray-100 bg-gray-50 px-4 py-2 md:px-5">
				<div className="flex w-max gap-1 md:w-auto md:flex-wrap">
					{/* períodos rápidos */}
					{([6, 12] as const).map((p) => (
						<button
							key={p}
							onClick={() => {
								setPeriod(p);
								setYear(null);
							}}
							className={`${filterBtn(year === null && period === p)} rounded border border-gray-200`}
						>
							{p === 6 ? "6M" : "12M"}
						</button>
					))}

					<div className="mx-1 w-px self-stretch bg-gray-200" />

					{/* anos */}
					{availableYears.map((y) => (
						<button
							key={y}
							onClick={() => setYear(y)}
							className={`${filterBtn(year === y)} rounded border border-gray-200`}
						>
							{y}
						</button>
					))}
				</div>
			</div>

			{/* ── gráfico ── */}
			<div className="p-3 md:p-5">
				{loading ? (
					<div className="flex h-48 items-center justify-center md:h-64">
						<p className="text-sm text-gray-400">Carregando gráfico...</p>
					</div>
				) : isEmpty ? (
					<div className="flex h-48 items-center justify-center md:h-64">
						<p className="text-sm font-semibold text-gray-400">
							Nenhum dado para o período selecionado.
						</p>
					</div>
				) : (
					/* altura menor no mobile, maior no desktop */
					<ResponsiveContainer width="100%" height={220} className="md:h-[280px]!">
						<BarChart
							data={chartData}
							barCategoryGap="30%"
							barGap={3}
							margin={{ top: 4, right: 0, left: -8, bottom: 0 }}
						>
							<CartesianGrid vertical={false} stroke="#f0f0f0" strokeDasharray="3 3" />
							<XAxis
								dataKey="month"
								axisLine={false}
								tickLine={false}
								tick={{
									fontSize: 10,
									fontFamily: "Barlow Condensed",
									fill: "#9ca3af",
									fontWeight: 600,
								}}
								/* no mobile mostra 1 em cada 2 labels se houver muitos meses */
								interval={chartData.length > 8 ? 1 : 0}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{
									fontSize: 10,
									fontFamily: "Barlow Condensed",
									fill: "#9ca3af",
									fontWeight: 600,
								}}
								tickFormatter={mode === "revenue" ? (v) => `R$${v}` : undefined}
								width={mode === "revenue" ? 52 : 24}
							/>
							<Tooltip content={<CustomTooltip mode={mode} />} cursor={{ fill: "#f9fafb" }} />
							<Legend
								iconSize={10}
								wrapperStyle={{
									fontSize: "10px",
									fontFamily: "Barlow Condensed",
									fontWeight: 600,
									textTransform: "uppercase",
									letterSpacing: "0.05em",
									paddingTop: "8px",
								}}
							/>

							{mode === "appointments" ? (
								<>
									<Bar
										dataKey="confirmados"
										name="Confirmados"
										fill="#4ade80"
										radius={[3, 3, 0, 0]}
									/>
									<Bar
										dataKey="cancelados"
										name="Cancelados"
										fill="#f87171"
										radius={[3, 3, 0, 0]}
									/>
								</>
							) : (
								<Bar
									dataKey="faturamento"
									name="Faturamento"
									fill="#0a0a0a"
									radius={[3, 3, 0, 0]}
								/>
							)}
						</BarChart>
					</ResponsiveContainer>
				)}
			</div>
		</div>
	);
}
