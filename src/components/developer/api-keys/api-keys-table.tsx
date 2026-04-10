"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { PermissionsCell } from "./permission-cell"
import { IconCheck, IconCopy, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"
import { getApiKeysList } from "@/hooks/api-keys-service"
import DeleteApiKeyDialog from "./delete-api-key-dialog"
import { useApiKeyContext } from "@/contexts/api-key-context"
import { Button } from "@/components/ui/button"
import SecretBanner from "./secret-banner"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar, CalendarX2, ChevronFirst, ChevronLast, KeySquare, LockKeyhole, Tag, User } from "lucide-react"
import { formatPrettyDate, truncateText } from "@/utils/formatting"
import { ApiKey, CreatedApiKeyResponse } from "@/types/api-keys"

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



/**
 * factory to create columns so we can pass removeKeyFromList into delete cell
 */
function getApiTokenColumns(removeKeyFromList: (key: string) => void): ColumnDef<ApiKey>[] {
  return [
    {
      accessorKey: "name",
      header: () => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Name
        </div>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "key",
      header: () => (
        <div className="flex items-center gap-2">
          <KeySquare className="h-4 w-4" />
          Key
        </div>
      ),
      cell: ({ row }) => {
        const key = truncateText(row.original.key);
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs break-all">{key}</span>
            <CopyButton text={row.original.key} />
          </div>
        )
      },
    },
    {
      accessorKey: "permissions",
      header: () => (
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-4 w-4" />
          Permissions
        </div>
      ),
      cell: ({ row }) => <PermissionsCell permissions={row.original.permissions} />,
    },
    {
      accessorKey: "expiry",
      header: () => (
        <div className="flex items-center gap-2">
          <CalendarX2 className="h-4 w-4" />
          Expiry
        </div>
      ),
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.expiry ? formatPrettyDate(row.original.expiry) : "—"}</span>
      },
    },
    {
      accessorKey: "created_at",
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Created At
        </div>
      ),
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.created_at ? formatPrettyDate(row.original.created_at) : "-"}</span>
      },
    },
    {
      accessorKey: "user_id",
      header: () => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Created By
        </div>
      ),
      cell: ({ row }) => <span className="text-sm">{row.original.user_id}</span>,
    },
    // delete column uses removeKeyFromList captured from outer scope
    {
      id: "delete",
      header: "Delete",
      enableSorting: false,
      cell: ({ row }) => (
        <DeleteApiKeyDialog
          tokenKey={row.original.key}
          tokenName={row.original.name}
          onDeleted={(k) => removeKeyFromList(k)}
        />
      ),
    },
  ]
}

type ApiKeysTableProps = {
  onForbidden?: () => void
}

export default function ApiKeysTable({ onForbidden }: ApiKeysTableProps) {
  const [data, setData] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const { takeApiKeyContext } = useApiKeyContext()
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<CreatedApiKeyResponse | null>(null)

  // pagination state
  const [pageSize, setPageSize] = useState<number>(10)
  const [pageIndex, setPageIndex] = useState<number>(0)

  function removeKeyFromList(key: string) {
    setData((prev) => prev.filter((t) => t.key !== key))
  }

  // create columns inside component so delete cell can use removeKeyFromList
  const apiTokenColumns = useMemo(() => getApiTokenColumns(removeKeyFromList), [removeKeyFromList])

  useEffect(() => {
    let mounted = true
    const newApiKey: CreatedApiKeyResponse | null = takeApiKeyContext() // takes and clears it
    if (newApiKey) {
      setNewlyCreatedKey(newApiKey)
    }
    setLoading(true)

    const successTask = (apiKeys: ApiKey[]) => {
      if (!mounted) return
      setData(apiKeys)
      setLoading(false)
    }

    const failureTask = () => {
      if (!mounted) return
      toast.error("Failed to load API keys")
      setLoading(false)
    }

    const errorTask = () => {
      if (!mounted) return
      toast.error("Unexpected error while fetching API keys")
      setLoading(false)
    }

    const forbiddenTask = () => {
      if (!mounted) return
      onForbidden?.()
      setLoading(false)
    }

    getApiKeysList({
      successTask,
      failureTask,
      errorTask,
      forbiddenTask,
      retry: false,
    }).catch((err) => {
      if (!mounted) return
      console.error("getApiKeysList threw:", err)
      setLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [takeApiKeyContext, onForbidden])

  // pageCount computed from data only (no merging)
  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / pageSize))
  }, [data.length, pageSize])

  // ensure pageIndex stays within bounds when data or pageSize changes
  useEffect(() => {
    if (pageIndex >= pageCount) {
      setPageIndex(Math.max(0, pageCount - 1))
    }
  }, [pageCount, pageIndex])

  // slice the data for current page (no merged data)
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, pageIndex, pageSize])

  // update table instance to use paginatedData
  const table = useReactTable({
    data: paginatedData,
    columns: apiTokenColumns,
    getCoreRowModel: getCoreRowModel(),
  })
  const dismissFlashPanel = () => setNewlyCreatedKey(null)

  return (
    <div>
      <SecretBanner createdKey={newlyCreatedKey} onDismiss={dismissFlashPanel} />

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <>
                {Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={`shimmer-${i}`} className="animate-pulse">
                    {apiTokenColumns.map((_, colIndex) => (
                      <TableCell key={colIndex} className="py-3">
                        <div className="h-4 w-full rounded bg-neutral-300 dark:bg-neutral-700" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={apiTokenColumns.length} className="h-24 text-center">
                  No Api Keys Added.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 mt-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex"></div>

        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>

            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                const n = Number(value)
                setPageSize(n)
                setPageIndex(0)
              }}
            >
              <SelectTrigger size="sm" className="w-20 cursor-pointer" id="rows-per-page">
                <SelectValue placeholder={`${pageSize}`} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 15, 20, 30, 40, 50].map((ps) => (
                  <SelectItem className="cursor-pointer" key={ps} value={`${ps}`}>
                    {ps}
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
              min={1}
              max={pageCount}
              value={pageIndex + 1}
              onChange={(e) => {
                const value = Number(e.target.value)

                if (!Number.isNaN(value)) {
                  const page = Math.max(1, Math.min(pageCount, value))
                  setPageIndex(page - 1)
                }
              }}
              onBlur={(e) => {
                const value = Number(e.target.value)
                if (value < 1) {
                  e.target.value = String(pageIndex + 1)
                }
              }}
              className="w-16 h-8 text-center"
            />

            <span className="text-muted-foreground">of {pageCount}</span>
          </div>


          {/* Pagination Buttons */}
          <div className="ml-auto flex items-center gap-2 lg:ml-0">

            {/* FIRST PAGE BUTTON */}
            <Button
              variant="outline"
              className="cursor-pointer size-8"
              size="icon"
              onClick={() => setPageIndex(0)}
              disabled={pageIndex === 0}
            >
              <ChevronFirst />
            </Button>

            {/* PREVIOUS PAGE BUTTON */}
            <Button
              variant="outline"
              className="cursor-pointer size-8"
              size="icon"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
            >
              <IconChevronLeft />
            </Button>

            {/* NEXT PAGE BUTTON */}
            <Button
              variant="outline"
              className="cursor-pointer size-8"
              size="icon"
              onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
              disabled={pageIndex >= pageCount - 1}
            >
              <IconChevronRight />
            </Button>

            {/* LAST PAGE BUTTON */}
            <Button
              variant="outline"
              className="cursor-pointer size-8"
              size="icon"
              onClick={() => setPageIndex(pageCount - 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronLast />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}