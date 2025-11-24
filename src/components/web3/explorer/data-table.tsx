"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconCopy,
  IconGripVertical,
  IconLoader,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconCheck } from "@tabler/icons-react"
import {
  Checkbox,
} from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { BlockchainSearch } from "@/components/web3/explorer/blockchain-search"
import { searchBlockchainTransaction } from "@/hooks/web3/explorer-service"
import { toast } from "sonner"
import { truncateText } from "@/utils/formatting"
import { TransactionDetailsDialog } from "./transaction-details-dialog"

interface SearchParams {
  chainId: number
  tnxHash?: string
  address?: string
}

interface SearchResultsData {
  txns?: Array<{
    txn_hash: string
    block_number: number
    block_hash: string
    timestamp: string
    from_address: string
    to_address: string
    value: number
    gas: number
    gas_price: number
    gas_used: number
    status: string
    nonce: number
    max_fee_per_gas: number
    max_priority_fee_per_gas: number
  }>
  errors?: string[]
}

export const schema = z.object({
  txn_hash: z.string(),
  block_number: z.number(),
  block_hash: z.string(),
  timestamp: z.string(),
  from_address: z.string(),
  to_address: z.string(),
  value: z.number(),
  gas: z.number(),
  gas_price: z.number(),
  gas_used: z.number(),
  status: z.string(),
  nonce: z.number(),
  max_fee_per_gas: z.number(),
  max_priority_fee_per_gas: z.number(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation() // avoid triggering row click/drag
    try {
      await navigator.clipboard.writeText(text ?? "")
      setCopied(true)
      toast.success("Copied to clipboard")
      // reset icon after short delay
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy"
      title="Copy"
      className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded px-1 text-sm hover:bg-muted/50 focus:outline-none cursor-pointer"
    >
      {copied ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
    </button>
  )
}


const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "txn_hash",
    header: "Transaction Hash",
    cell: ({ row }) => {
      const hash = row.original.txn_hash
      const [open, setOpen] = React.useState(false);
      if (!hash) return <div className="text-muted-foreground">-</div>
      return (
        <div className="flex items-center gap-2 min-w-0 group">
          <div className="font-mono text-sm max-w-[170px] min-w-0 truncate cursor-pointer" onClick={() => setOpen(true)}>
            {truncateText(hash)}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <CopyButton text={hash} />
          </div>
          <TransactionDetailsDialog
            open={open}
            setOpen={setOpen}
            data={row.original}
          />
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "block_number",
    header: "Block",
    cell: ({ row }) => (
      <div className="text-left">
        {row.original.block_number || "-"}
      </div>
    ),
  },
  {
    accessorKey: "from_address",
    header: "From",
    cell: ({ row }) => {
      const address = row.original.from_address
      if (!address) return <div className="text-muted-foreground">-</div>
      return (
        <div className="flex items-center gap-2 min-w-0 group">
          <div className="font-mono text-sm max-w-[200px] min-w-0 truncate">
            {truncateText(address)}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <CopyButton text={address} />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "to_address",
    header: "To",
    cell: ({ row }) => {
      const address = row.original.to_address
      if (!address) {
        return (
          <div className="font-mono text-sm text-muted-foreground">
            Contract Creation
          </div>
        )
      }
      return (
        <div className="flex items-center gap-2 min-w-0 group">
          <div className="font-mono text-sm max-w-[200px] min-w-0 truncate">
            {truncateText(address)}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <CopyButton text={address} />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "timestamp",
    header: "Time",
    cell: ({ row }) => {
      const timestamp = row.original.timestamp
      if (!timestamp) return <div className="text-muted-foreground">-</div>
      const date = new Date(parseInt(timestamp) * 1000)
      return <div className="text-sm text-left">{date.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "gas_used",
    header: "Gas Used",
    cell: ({ row }) => {
      const gasUsed = row.original.gas_used
      if (gasUsed === null || gasUsed === undefined) {
        return <div className="text-left text-sm">-</div>
      }
      return (
        <div className="text-left text-sm">
          {(gasUsed / 1e6).toFixed(2)}M
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      if (!status) {
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            Unknown
          </Badge>
        )
      }
      const isSuccess = status === "1"
      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {isSuccess ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 mr-1" />
          ) : (
            <IconLoader className="mr-1" />
          )}
          {isSuccess ? "Success" : "Failed"}
        </Badge>
      )
    },
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.index,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [error, setError] = React.useState<string | null>(null)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
  })
  const [searchParams, setSearchParams] = React.useState<SearchParams | null>(
    null
  )
  const [loading, setLoading] = React.useState<boolean>(false)
  const sortableId = React.useId()
  const previousPageRef = React.useRef<number>(0)
  const previousPageSizeRef = React.useRef<number>(15)

  const handlePaginationChange = React.useCallback(
    (paginationState: any) => {
      setPagination(paginationState)
    },
    []
  )

  const handleSearchResults = (response: any) => {
    setLoading(false);
    // Check if response has errors
    if (response && response.errors && response.errors.length > 0) {
      console.log("Response errors:", response.errors)
      setError(response.errors[0])
      setData([])
      setRowSelection({})
      return
    }

    // Clear error and set data if successful
    if (response && response.txns) {
      setError(null)
      const txns = response.txns.map(
        (txn: any, index: number) => ({
          ...txn,
          id: index,
        })
      )
      setData(txns)
      setRowSelection({})
    }
  }

  const handleSearchResultsWithParams = (response: any, params: SearchParams) => {
    setSearchParams(params)
    handleSearchResults(response)
    previousPageRef.current = 0
    previousPageSizeRef.current = 15
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize })
  }
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map((_, index) => index) || [],
    [data]
  )

  React.useEffect(() => {
    const fetchData = async () => {
      if (!searchParams) return
      const { chainId, tnxHash, address } = searchParams
      if (!tnxHash && !address) {
            toast.error("Please enter a transaction hash or address")
            return
          }
          setLoading(true);
      
          await searchBlockchainTransaction({
            chainId: chainId,
            txhash: tnxHash,
            address: address,
            page: pagination.pageIndex + 1,
            offset: pagination.pageSize,
            successTask: (response) => {
              const apiResponse = response as any
              
              // Check if response has errors
              if (apiResponse.errors && apiResponse.errors.length > 0) {
                toast.error(apiResponse.errors[0])
                const mappedData: SearchResultsData = {
                  errors: apiResponse.errors,
                }
                handleSearchResults(mappedData);
                return
              }
      
              // Success case
              const mappedData: SearchResultsData = {
                txns: apiResponse.data?.txns || [],
              }
               handleSearchResults(mappedData);
            },
            failureTask: () => {
              toast.error("Search failed")
            },
            errorTask: () => {
              toast.error("An error occurred during search")
            },
          })
    }
    // Only fetch data if page index has changed
    if (previousPageRef.current !== pagination.pageIndex || previousPageSizeRef.current !== pagination.pageSize) {
      fetchData()
      previousPageRef.current = pagination.pageIndex
      previousPageSizeRef.current = pagination.pageSize
    }
  }, [pagination])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    manualPagination: true,
    getRowId: (_, index) => index.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <BlockchainSearch onSearchResults={handleSearchResultsWithParams} setLoading={setLoading}/>
        <div className="overflow-hidden rounded-lg border relative">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {loading ? (
                  <>
                    {Array.from({ length: pagination.pageSize }).map((_, i) => (
                      <TableRow key={`shimmer-${i}`} className="animate-pulse">
                        {columns.map((_, idx) => (
                          <TableCell key={idx} className="py-3">
                            <div className="h-4 w-full rounded bg-neutral-300 dark:bg-neutral-700" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="text-destructive font-medium">
                          Error
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {error}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
           
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
                disabled={searchParams === null}
              >
                <SelectTrigger size="sm" className="w-20 cursor-pointer" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 15, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem className="cursor-pointer" key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium gap-2">
              <span>Page</span>

              {/* Page Jump Input */}
              <Input
                type="number"
                value={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const value = Number(e.target.value)

                  if (!Number.isNaN(value)) {
                    // Page numbers are 1-based for user, 0-based for table
                    const page = Math.max(1, value)
                    table.setPageIndex(page - 1)
                  }
                }}
                onBlur={(e) => {
                  // Ensure value stays valid on blur
                  const value = Number(e.target.value)
                  if (value < 1) {
                    e.target.value = String(table.getState().pagination.pageIndex + 1)
                  }
                }}
                className="w-16 h-8 text-center"
                disabled={searchParams === null}
              />
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
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
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}
