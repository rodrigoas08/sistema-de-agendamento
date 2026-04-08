"use client";

import { useState } from "react";
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	useReactTable,
	SortingState,
	ColumnDef,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	loading?: boolean;
	emptyMessage?: string;
	className?: string;
	getRowClassName?: (data: TData) => string;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	loading = false,
	emptyMessage = "Nenhum resultado encontrado.",
	className = "",
	getRowClassName,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting,
		},
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	return (
		<div className={`w-full flex flex-col ${className}`}>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="bg-[#f9f9f9] border-b-2 border-gray-100">
								{headerGroup.headers.map((header) => {
									const canSort = header.column.getCanSort();
									const isSorted = header.column.getIsSorted();

									return (
										<th
											key={header.id}
											className="py-4 px-5 font-['Barlow_Condensed'] text-[11px] font-bold tracking-[1.5px] uppercase text-gray-400 select-none whitespace-nowrap"
										>
											{header.isPlaceholder ? null : (
												<div
													className={`flex items-center gap-1 ${
														canSort ? "cursor-pointer hover:text-black transition-colors" : ""
													}`}
													onClick={header.column.getToggleSortingHandler()}
												>
													{flexRender(header.column.columnDef.header, header.getContext())}
													{canSort && (
														<span className="w-3 h-3 flex items-center justify-center text-gray-400">
															{{
																asc: <ChevronUp size={12} />,
																desc: <ChevronDown size={12} />,
															}[isSorted as string] ?? <ChevronsUpDown size={12} opacity={0.5} />}
														</span>
													)}
												</div>
											)}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={columns.length} className="py-10">
									<p className="flex items-center justify-center gap-2 text-sm text-gray-400">
										<Loader2 className="animate-spin" /> Carregando dados...
									</p>
								</td>
							</tr>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									className={`
										border-b border-gray-100 text-sm hover:bg-gray-50 bg-white group transition-colors
										${getRowClassName ? getRowClassName(row.original) : ""}
									`}
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="py-4 px-5 align-middle">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={columns.length}
									className="py-10 text-center text-sm font-semibold text-gray-400"
								>
									{emptyMessage}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination Controls */}
			{table.getPageCount() > 1 && (
				<div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-white">
					<div className="text-xs text-gray-500 font-medium">
						Página{" "}
						<strong className="text-black">
							{table.getState().pagination.pageIndex + 1}
						</strong>{" "}
						de <strong className="text-black">{table.getPageCount()}</strong>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className="px-3 py-1.5 rounded border border-gray-200 text-xs font-bold font-['Barlow_Condensed'] uppercase tracking-wider text-gray-600 hover:border-black hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						>
							Anterior
						</button>
						<button
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className="px-3 py-1.5 rounded border border-gray-200 text-xs font-bold font-['Barlow_Condensed'] uppercase tracking-wider text-gray-600 hover:border-black hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						>
							Próximo
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
