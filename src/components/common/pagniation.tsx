"use client"

import React from "react"
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
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react"

interface PaginationProps {
  page: number
  pageSize: number
  totalCount: number
  loading?: boolean

  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void

  pageSizeOptions?: number[]
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  loading = false,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 20, 25],
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))

  if (totalCount === 0) return null

  return (
    <div className="flex w-full justify-end mt-4">
      <div className="flex items-center gap-4">

        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            disabled={loading}
            onValueChange={(value) => {
              onPageSizeChange(Number(value))
              onPageChange(1) // reset to first page
            }}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
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
            value={page}
            disabled={loading}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (Number.isNaN(value)) return
              const next = Math.min(Math.max(1, value), pageCount)
              onPageChange(next)
            }}
            className="h-8 w-16 text-center"
          />
          <span className="text-xs text-muted-foreground">
            of {pageCount}
          </span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          {/* First */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => onPageChange(1)}
            disabled={page === 1 || loading}
            title="First page"
          >
            <ChevronsLeft className="size-4" />
          </Button>

          {/* Previous */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || loading}
            title="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {/* Next */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => onPageChange(page + 1)}
            disabled={page === pageCount || loading}
            title="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>

          {/* Last */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => onPageChange(pageCount)}
            disabled={page === pageCount || loading}
            title="Last page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
