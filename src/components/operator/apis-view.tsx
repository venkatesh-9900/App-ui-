"use client"

import React, { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Info, Search } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/common/searchable-select"
import { Api, ApiService } from "@/types/operator"
import { toast } from "sonner"
import { formatDate, formatRelativeDate } from "@/utils/formatting"
import { Pagination } from "@/components/common/pagination"
import { DataTable } from "@/components/common/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { KeySquare, Link as LinkIcon, Badge as BadgeIcon, Server, Calendar, Clock, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ApisViewProps {
  apis: Api[]
  services: ApiService[]
  isLoading: boolean
  totalCount: number
  page: number
  pageSize: number
  search: string
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSearchChange: (search: string) => void
  onCreate: (data: Partial<Api>) => Promise<void>
  onUpdate: (id: number, data: Partial<Api>) => Promise<void>
  onDelete: (id: number) => void
}

export function ApisView({
  apis,
  services,
  isLoading,
  totalCount,
  page,
  pageSize,
  search,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onCreate,
  onUpdate,
  onDelete,
}: ApisViewProps) {
  // Dialog state (local UI state)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentApi, setCurrentApi] = useState<Api | null>(null)
  
  // Form state (local UI state)
  const [formData, setFormData] = useState<Partial<Api>>({
    name: "",
    description: "",
    path: "",
    method: "GET",
    api_service_id: undefined,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [localSearch, setLocalSearch] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  const handleSearchInput = (value: string) => {
    setLocalSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearchChange(value)
    }, 400)
  }

  const openCreateDialog = () => {
    setCurrentApi(null)
    setFormData({ name: "", description: "", path: "", method: "GET", api_service_id: undefined })
    setIsDialogOpen(true)
  }

  const openEditDialog = (api: Api) => {
    setCurrentApi(api)
    setFormData({
      name: api.name || "",
      description: api.description || "",
      path: api.path || "",
      method: api.method || "GET",
      api_service_id: api.api_service_id,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (currentApi) {
        await onUpdate(currentApi.id, formData)
      } else {
        await onCreate(formData)
      }
      setIsDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getServiceName = (id: number) => {
    return services.find(s => s.id === id)?.name || `Service ID: ${id}`
  }

  const columns: ColumnDef<Api>[] = [
    {
      accessorKey: "api_service_id",
      header: () => (
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4" />
          <span>Service</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-foreground text-sm">
          {getServiceName(row.getValue("api_service_id"))}
        </div>
      ),
    },
    {
      accessorKey: "method",
      header: () => (
        <div className="flex items-center gap-2">
          <BadgeIcon className="w-4 h-4" />
          <span>Method</span>
        </div>
      ),
      cell: ({ row }) => {
        const method = row.getValue("method") as string
        return (
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-1.5 py-0.5 font-bold uppercase",
              method === 'GET' && "text-blue-500 border-blue-500/30 bg-blue-500/10",
              method === 'POST' && "text-green-500 border-green-500/30 bg-green-500/10",
              method === 'PUT' && "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
              method === 'DELETE' && "text-red-500 border-red-500/30 bg-red-500/10",
              method === 'PATCH' && "text-purple-500 border-purple-500/30 bg-purple-500/10",
            )}
          >
            {method}
          </Badge>
        )
      },
    },
    {
      accessorKey: "path",
      header: () => (
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          <span>API Path</span>
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono text-xs font-medium bg-muted/30 text-foreground border-border/50">
          {row.getValue("path")}
        </Badge>
      ),
    },
    {
      accessorKey: "name",
      header: () => (
        <div className="flex items-center gap-2">
          <KeySquare className="w-4 h-4" />
          <span>Name</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground text-xs">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: () => (
        <div className="flex items-center gap-2 text-left">
          <Calendar className="w-4 h-4" />
          <span>Created</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground/80 whitespace-nowrap">
          {formatDate(row.getValue("created_at"))}
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: () => (
        <div className="flex items-center gap-2 text-left">
          <Clock className="w-4 h-4" />
          <span>Updated</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground/60 whitespace-nowrap">
          {formatRelativeDate(row.getValue("updated_at"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-left">Actions</div>,
      cell: ({ row }) => {
        const api = row.original
        return (
          <div className="text-left">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[160px]">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openEditDialog(api)} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => onDelete(api.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex-1 p-4 pt-4 space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">API Management</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Manage and view all registered APIs mapped to backend services.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create API
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or path..."
          value={localSearch}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>
      
      <Card className="border-border/50 shadow-sm py-0 overflow-hidden">
        <CardContent className="p-0 flex flex-col">
          <div className="w-full">
            <DataTable
              columns={columns}
              data={apis}
              isLoading={isLoading}
              className="border-0 rounded-none bg-transparent"
            />
          </div>

          {!isLoading && totalCount > pageSize && (
            <div className="px-4 py-2 border-t border-border/50 bg-muted/5">
              <Pagination
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl">{currentApi ? "Edit API" : "Create API"}</DialogTitle>
              <DialogDescription className="text-sm">
                {currentApi 
                  ? "Update the details of the API endpoint." 
                  : "Register a new API endpoint targeting a specific service."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">API Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Update Profile"
                  className="bg-background"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="path" className="text-sm font-medium">Path</Label>
                <Input
                  id="path"
                  value={formData.path || ""}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="e.g. /v1/users/profile"
                  className="bg-background"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="method" className="text-sm font-medium">HTTP Method</Label>
                <SearchableSelect
                  items={[
                    { id: "GET", label: "GET" },
                    { id: "POST", label: "POST" },
                    { id: "PUT", label: "PUT" },
                    { id: "DELETE", label: "DELETE" },
                    { id: "PATCH", label: "PATCH" },
                  ]}
                  value={formData.method || "GET"}
                  onValueChange={(val) => setFormData({...formData, method: val})}
                  placeholder="Select Method..."
                  searchPlaceholder="Search Method..."
                  showSearch={false}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service" className="text-sm font-medium">Target Service</Label>
                <SearchableSelect
                  items={services.map(svc => ({ id: svc.id.toString(), label: svc.name }))}
                  value={formData.api_service_id?.toString() || ""}
                  onValueChange={(val) => setFormData({...formData, api_service_id: val ? parseInt(val) : undefined})}
                  placeholder="Select a Service..."
                  searchPlaceholder="Search Service..."
                  showSearch={false}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save API"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
