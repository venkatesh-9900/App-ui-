"use client"

import * as React from "react"
import { format, addDays } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

type ExpirationValue =
  | "7d"
  | "30d"
  | "60d"
  | "90d"
  | "custom"
  | "never"

export function ExpirationSelect({
  value,
  onChange,
  customDate,
  setCustomDate,
}: {
  value: ExpirationValue
  onChange: (v: ExpirationValue) => void
  customDate: Date | null
  setCustomDate: (d: Date | null) => void
}) {
  const today = new Date()

  const options = [
    { key: "7d", label: "7 days", date: addDays(today, 7) },
    { key: "30d", label: "30 days", date: addDays(today, 30) },
    { key: "60d", label: "60 days", date: addDays(today, 60) },
    { key: "90d", label: "90 days", date: addDays(today, 90) },
  ]

  return (
    <div className="flex items-center gap-3">
      {/* Dropdown */}
      <Select
        value={value}
        onValueChange={(val) => {
          onChange(val as ExpirationValue)
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select" />
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.key} value={opt.key}>
              {opt.label}{" "}
              <span className="text-muted-foreground ml-1">
                ({format(opt.date, "MMM dd, yyyy")})
              </span>
            </SelectItem>
          ))}

          <SelectItem value="custom">Custom</SelectItem>

          <SelectItem value="never">
            <span className="font-medium">No expiration</span>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Date picker (only visible for Custom) */}
      {value === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex w-[160px] items-center justify-between rounded border px-3 py-2 text-left text-sm"
            >
              {customDate ? (
                format(customDate, "dd / MM / yyyy")
              ) : (
                <span className="text-muted-foreground">Select date *</span>
              )}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </button>
          </PopoverTrigger>

          <PopoverContent className="p-0" align="start">
            <Calendar
              mode="single"
              selected={customDate ?? undefined}
              onSelect={(d: any) => setCustomDate(d ?? null)}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}