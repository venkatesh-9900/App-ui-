"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface SearchableSelectProps {
  items: { id: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  showSearch?: boolean
}

export function SearchableSelect({
  items,
  value,
  onValueChange,
  placeholder = "Select item...",
  searchPlaceholder = "Search...",
  emptyMessage = "No item found.",
  className,
  showSearch = true,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedItem = items.find((item) => item.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full max-w-full justify-between bg-background font-normal overflow-hidden shrink", className)}
        >
          <span className="truncate min-w-0 flex-1 text-left flex items-center gap-2">
            {selectedItem ? (
              <>
                {(() => {
                  const methodMatch = selectedItem.label.match(/^\[(GET|POST|PUT|DELETE|PATCH)\] (.*)$/)
                  if (methodMatch) {
                    const method = methodMatch[1]
                    const label = methodMatch[2]
                    return (
                      <>
                        <span 
                          className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded font-black uppercase min-w-[42px] text-center border shrink-0",
                            method === 'GET' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                            method === 'POST' && "bg-green-500/10 text-green-400 border-green-500/20",
                            method === 'PUT' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                            method === 'DELETE' && "bg-red-500/10 text-red-400 border-red-500/20",
                            method === 'PATCH' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                          )}
                        >
                          {method}
                        </span>
                        <span className="truncate">{label}</span>
                      </>
                    )
                  }
                  return selectedItem.label
                })()}
              </>
            ) : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" collisionPadding={8}>
        {showSearch && (
          <div className="flex items-center border-b px-3 py-1 bg-muted/20">
            <Search className="h-4 w-4 shrink-0 opacity-50 mr-2" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full border-none bg-transparent px-1 py-1 focus-visible:ring-0 text-sm shadow-none"
            />
          </div>
        )}
        <div 
          className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overscroll-contain touch-pan-y"
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="p-1 space-y-0.5">
            {filteredItems.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const methodMatch = item.label.match(/^\[(GET|POST|PUT|DELETE|PATCH)\] (.*)$/)
                const method = methodMatch ? methodMatch[1] : null
                const label = methodMatch ? methodMatch[2] : item.label

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 px-3 text-sm outline-none transition-all",
                      "hover:bg-accent hover:text-accent-foreground",
                      value === item.id 
                        ? "bg-accent/50 text-accent-foreground font-semibold" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => {
                      onValueChange(item.id === value ? "" : item.id)
                      setOpen(false)
                      setSearchQuery("")
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {method && (
                        <div 
                          className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded font-black uppercase min-w-[42px] text-center border",
                            method === 'GET' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                            method === 'POST' && "bg-green-500/10 text-green-400 border-green-500/20",
                            method === 'PUT' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                            method === 'DELETE' && "bg-red-500/10 text-red-400 border-red-500/20",
                            method === 'PATCH' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                          )}
                        >
                          {method}
                        </div>
                      )}
                      <span className="truncate flex-1 tracking-tight">{label}</span>
                    </div>
                    {value === item.id && (
                      <Check className="ml-2 h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface SearchableMultiSelectProps {
  items: { id: string; label: string }[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  showSearch?: boolean
}

export function SearchableMultiSelect({
  items,
  value,
  onValueChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyMessage = "No item found.",
  className,
  showSearch = true,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onValueChange(value.filter((v) => v !== id))
    } else {
      onValueChange([...value, id])
    }
  }

  const summary =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? items.find((i) => i.id === value[0])?.label ?? `${value.length} selected`
        : `${value.length} permissions selected`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full max-w-full justify-between bg-background font-normal overflow-hidden shrink", className)}
        >
          <span className="truncate min-w-0 flex-1 text-left">{summary}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" collisionPadding={8}>
        {showSearch && (
          <div className="flex items-center border-b px-3 py-1 bg-muted/20">
            <Search className="h-4 w-4 shrink-0 opacity-50 mr-2" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full border-none bg-transparent px-1 py-1 focus-visible:ring-0 text-sm shadow-none"
            />
          </div>
        )}
        <div
          className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overscroll-contain touch-pan-y"
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="p-1 space-y-0.5">
            {filteredItems.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const methodMatch = item.label.match(/^\[(GET|POST|PUT|DELETE|PATCH)\] (.*)$/)
                const method = methodMatch ? methodMatch[1] : null
                const label = methodMatch ? methodMatch[2] : item.label
                const checked = value.includes(item.id)

                return (
                  <div
                    key={item.id}
                    title={item.label}
                    className={cn(
                      "group relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 px-3 text-sm outline-none transition-all",
                      "hover:bg-accent hover:text-accent-foreground",
                      checked
                        ? "bg-accent/50 text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => toggle(item.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary",
                          checked && "bg-primary text-primary-foreground"
                        )}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </div>
                      {method && (
                        <div
                          className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded font-black uppercase min-w-[42px] text-center border",
                            method === "GET" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                            method === "POST" && "bg-green-500/10 text-green-400 border-green-500/20",
                            method === "PUT" && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                            method === "DELETE" && "bg-red-500/10 text-red-400 border-red-500/20",
                            method === "PATCH" && "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          )}
                        >
                          {method}
                        </div>
                      )}
                      <span className="truncate flex-1 tracking-tight">{label}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
