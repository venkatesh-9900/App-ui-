"use client"

import * as React from "react"
import { useEffect } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCopy,
  IconSearch,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

import { getAccounts } from "@/hooks/web3/top-accounts-service"
import { ArrowLeftRight, Hash, Network, Wallet } from "lucide-react"
import { AccountsResponse } from "@/types/top-accounts"

type AccountRow = {
  id: string
  address: string
  balance: number
  transactions: number
  networkName: string
  currency: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded hover:bg-muted"
      title="Copy"
    >
      {copied ? "✓" : <IconCopy className="size-3.5" />}
    </button>
  )
}
const toEvmNative = (wei: string | number) => { 
  if (!wei) return "0";
  return (Number(wei) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 10 }); 
};

/* =======================
   Columns
======================= */

export const columns: ColumnDef<AccountRow>[] = [
  {
    accessorKey: "address",
    header: () => (
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <span>Address</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs w-[320px]">
          {row.original.address}
        </span>
        <CopyButton text={row.original.address} />
      </div>
    ),
  },
  {
    accessorKey: "balance",
    header: () => (
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <span>Balance</span>
      </div>
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {toEvmNative(row.original.balance)} {row.original.currency}
      </span>
    ),
  },
  {
    accessorKey: "percentage",
    header: () => (
      <div className="flex items-center gap-2">
        <Network className="h-4 w-4 text-muted-foreground"/>
        <span>Network</span>
      </div>
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.networkName}
      </span>
    ),
  },
  {
    accessorKey: "transactions",
    header: () => (
      <div className="flex items-center gap-2">
        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
        <span>Tx Count</span>
      </div>
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.transactions}
      </span>
    ),
  },
]


/* =======================
   Main Component
======================= */

export function TopAccountsTable() {
  const [data, setData] = React.useState<AccountRow[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [addressSearch, setAddressSearch] = React.useState("")

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  /* =======================
     Fetch Data
  ======================= */

  const fetchPage = (pageIndex: number, pageSize: number) => {
    setLoading(true)
    setError(null)

    getAccounts({
      pageIndex,
      pageSize,
      address: addressSearch,
      successTask: (res: AccountsResponse) => {
        const rows =
          res.data?.accounts.map((row, idx) => ({
            id: `${pageIndex}-${idx}-${row.address}`,
            address: row.address,
            balance: Number(row.balance),
            transactions: Number(row.successfully_sent_transaction_count),
            networkName: row.network_name,
            currency: row.currency
          })) ?? []

        setData(rows)
        setTotal(res.data?.total_count ?? rows.length)
        setLoading(false)
      },
      failureTask: () => {
        setError("Failed to load accounts")
        setLoading(false)
      },
      errorTask: () => {
        setError("Something went wrong")
        setLoading(false)
      },
    })
  }

  useEffect(() => {
    fetchPage(pagination.pageIndex, pagination.pageSize)
  }, [pagination.pageIndex, pagination.pageSize])

  const pageCount = React.useMemo(() => {
    if (!total) return 1
    return Math.max(1, Math.ceil(total / pagination.pageSize))
  }, [total, pagination.pageSize])

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const handleSearch = () => {
    fetchPage(0, pagination.pageSize);
  }

  const currentPage = pagination.pageIndex + 1

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by address"
          value={addressSearch}
          onChange={(e) => setAddressSearch(e.target.value)}
          className="h-9 max-w-md"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={handleSearch}
        >
          <IconSearch className="size-4" />
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <>
                {Array.from({ length: 10 }).map((_, i) => (
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
                  className="h-24 text-center text-destructive"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex w-full justify-end">
        <div className="flex items-center gap-4">

          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page</span>
            <Select
              value={String(pagination.pageSize)}
              disabled={loading}
              onValueChange={(value) =>
                setPagination((prev) => ({
                  ...prev,
                  pageSize: Number(value),
                  pageIndex: 0,
                }))
              }
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 15, 20, 25].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page input */}
          <div className="flex items-center gap-2">
            <span className="text-xs">Page</span>
            <Input
              type="number"
              min={1}
              max={pageCount}
              value={currentPage}
              disabled={loading}
              onChange={(e) => {
                const value = Number(e.target.value)
                if (Number.isNaN(value)) return
                const next = Math.min(Math.max(1, value), pageCount)
                table.setPageIndex(next - 1)
              }}
              className="h-8 w-16 text-center"
            />
            <span className="text-xs text-muted-foreground">
              of {pageCount}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* First page */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage() || loading}
              title="First page"
            >
              <IconChevronsLeft className="size-4" />
            </Button>

            {/* Previous */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || loading}
              title="Previous page"
            >
              <IconChevronLeft className="size-4" />
            </Button>

            {/* Next */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || loading}
              title="Next page"
            >
              <IconChevronRight className="size-4" />
            </Button>

            {/* Last page */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage() || loading}
              title="Last page"
            >
              <IconChevronsRight className="size-4" />
            </Button>
          </div>


        </div>
      </div>

    </div>
  )
}