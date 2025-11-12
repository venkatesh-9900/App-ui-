import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
	ColumnDef,
	ColumnFiltersState,
	Row,
	SortingState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import { NeighboursView } from "./neighbours-view";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
// import { ChaptersClient } from "../chapters/client";
// Define DataTableProps interface
interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	getRowCanExpand: (row: Row<TData>) => boolean;
}

// Define DataTable component
export function NeighboursTable<TData, TValue>({
	columns,
	data,
	getRowCanExpand,
}: DataTableProps<TData, TValue>) {
	const [expanded, setExpanded] = React.useState({});

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getRowCanExpand,
		getExpandedRowModel: getExpandedRowModel(),
		state: {
			sorting,
			columnFilters,
			expanded,
		},
		onExpandedChange: setExpanded,
	});

	return (
		<div>
			<div className="flex items-center py-2"></div>
			<div className="rounded-md border">
				<Table>
					<TableHeader className="bg-muted sticky top-0 z-10">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{[...headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								)), <TableHead key={"action"}></TableHead>]}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row: any) => (
								<React.Fragment key={row.id}>
									<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
										{row.getVisibleCells().map((cell: any) => (
											<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
										))}
										<TableCell>
											{row.original.neighbours && row.original.neighbours.length > 0 ? <Button variant="ghost" className="h-8 w-8 p-0" onClick={row.getToggleExpandedHandler()}>
												{row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}
											</Button>
                                            : <div className="px-3">-</div>}
										</TableCell>
									</TableRow>
									{row.original.neighbours && row.original.neighbours.length > 0 && row.getIsExpanded() && (
										<TableRow>
											<TableCell colSpan={columns.length + 1}>
												<NeighboursView current_address={row.original.address} depth={row.original.depth} data={row.original.neighbours} />
											</TableCell>
										</TableRow>
									)}
								</React.Fragment>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-between py-4">
				<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
				
				</div>
				<div className="flex w-full items-center gap-8 lg:w-fit">
					<div className="flex w-fit items-center justify-center text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} of{" "}
					{table.getPageCount()}
					</div>
					<div className="ml-auto flex items-center gap-2 lg:ml-0">
					<Button
						variant="outline"
						className="cursor-pointer hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(0)}
					>
						<span className="sr-only">Go to first page</span>
						<IconChevronsLeft />
					</Button>
					<Button
						variant="outline"
						className="cursor-pointer size-8"
						size="icon"
						onClick={() => table.previousPage()}
					>
						<span className="sr-only">Go to previous page</span>
						<IconChevronLeft />
					</Button>
					<Button
						variant="outline"
						className="cursor-pointer size-8"
						size="icon"
						onClick={() => table.nextPage()}
					>
						<span className="sr-only">Go to next page</span>
						<IconChevronRight />
					</Button>
					<Button
						variant="outline"
						className="cursor-pointer hidden size-8 lg:flex"
						size="icon"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
					>
						<span className="sr-only">Go to last page</span>
						<IconChevronsRight />
					</Button>
					</div>
				</div>
			</div>
		</div>
	);
}