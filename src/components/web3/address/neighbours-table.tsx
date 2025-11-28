import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
	ColumnDef,
	ColumnFiltersState,
	Row,
	ExpandedState,
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
import { NeighbourData, NeighbourResponse, NeighboursColumn, NeighboursColumnData } from "@/types/blockchain";
import { toast } from "sonner";
import { blockchainAddressLookup } from "@/hooks/web3/address-service";
import AddressStatic from "@/components/web3/address/address-static";
// import { ChaptersClient } from "../chapters/client";
// Define DataTableProps interface
interface DataTableProps<TData, TValue> {
	chainId: number;
	currentAddress: string;
	startDate: Date;
	endDate: Date;
	direction: number;
	depth: number;
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	getRowCanExpand: (row: Row<TData>) => boolean;
}

// Define DataTable component
export function NeighboursTable<TData, TValue>({
	chainId,
	currentAddress,
	columns,
	data,
	getRowCanExpand,
	startDate,
	endDate,
	direction
}: DataTableProps<TData, TValue>) {
	const [expanded, setExpanded] = React.useState<ExpandedState>({});
	const [isNeighboursLoading, setIsNeighboursLoading] = React.useState<boolean>(false);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [neighboursData, setNeighboursData] = React.useState<Record<string, NeighboursColumnData>>({});
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
		onExpandedChange: setExpanded, // We'll keep this for now and use a side-effect to manage single expansion
	});

	const previousExpanded = React.useRef<ExpandedState>(expanded);

	React.useEffect(() => {
		const newExpandedKeys = Object.keys(expanded);
		if (newExpandedKeys.length > 1) {
			const oldExpandedKeys = Object.keys(previousExpanded.current);
			const latestExpandedKey = newExpandedKeys.find(
				(key) => !oldExpandedKeys.includes(key)
			);
			if (latestExpandedKey) {
				setExpanded({ [latestExpandedKey]: true });
			}
		}
		previousExpanded.current = expanded;
	}, [expanded]);

	// This is a mock API call function. Replace with your actual API call.
	const fetchNeighbours = async (address: string, startDate: Date, endDate: Date, direction: number, excludeAddress: string): Promise<NeighbourData> => {
		console.log(`Fetching neighbours for ${address}...`);
		// Simulate network delay
		let startTime: number = 0;
		let endTime: number = 0;
		if (startDate && endDate) {
			startTime = Math.trunc(startDate.getTime() / 1000);
			endTime = Math.trunc(endDate.getTime() / 1000) + 86399;
			if (startTime > endTime) {
				toast.error("Start date cannot be greater than end date")
				return {
					neighbours: [],
					tx_count: 0
				}
			}
		}

    	toast.info("Processing request...")

		let finalResponse : NeighbourData = {
			neighbours: [],
			tx_count: 0
		};
    
		await blockchainAddressLookup({
			chainId: chainId,
			address: address,
			startTime: startTime,
			endTime: endTime,
			direction: direction,
			excludeAddress: excludeAddress.toLowerCase(),
			successTask: (response) => {
				// const tableData : NeighboursColumn[] = response.map((item: NeighbourResponse) => {
				// 	return { address: item.address, depth: depth + 1, txns_no: item.tx_count }
				// });
				finalResponse = response;
			},
			failureTask: () => {
				toast.error("Search failed")
			},
			errorTask: () => {
				toast.error("An error occurred during search")
			}
		})
		return finalResponse;
	};

	const handleExpandClick = async (row: any) => {
		if (row.getIsExpanded()) {
			row.toggleExpanded(false);
			return;
		}

		setIsNeighboursLoading(true);
		row.toggleExpanded(true);
		const fetchedData = await fetchNeighbours(row.original.address, startDate, endDate, direction, currentAddress);
		const tableData : NeighboursColumn[] = fetchedData.neighbours.map((item: NeighbourResponse) => {
			return { address: item.address, depth: row.original.depth + 1, txns_no: item.tx_count }
		});

		setNeighboursData(prev => ({ ...prev, [row.id]: { neighbours: tableData, tx_count: fetchedData.tx_count } }));
		setIsNeighboursLoading(false);
		//row.toggleExpanded(true);
	};
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
											{getRowCanExpand(row) ? <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleExpandClick(row)} disabled={isNeighboursLoading && !row.getIsExpanded()}>
												{row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}
											</Button>
                                            : <div className="px-3">-</div>}
										</TableCell>
									</TableRow>
									{row.getIsExpanded() && (
										<TableRow>
											<TableCell colSpan={columns.length + 1} className="p-1">
												{isNeighboursLoading ? <AddressStatic type="loading" message="Loading..." /> :
												<NeighboursView 
													chain_id={chainId} 
													current_address={row.original.address} 
													start_date={startDate} 
													end_date={endDate} 
													direction={direction} 
													depth={row.original.depth + 1} 
													data={neighboursData[row.id].neighbours || []} 
													tx_count={neighboursData[row.id].tx_count || 0}
												/>}
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