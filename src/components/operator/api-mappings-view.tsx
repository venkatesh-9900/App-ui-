"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Info } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/common/searchable-select"
import { Api, Permission, ApiMapping, ApiService } from "@/types/operator"
import { toast } from "sonner"
import { formatDate, formatRelativeDate } from "@/utils/formatting"
import { Pagination } from "@/components/common/pagination"
import { DataTable } from "@/components/common/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Shield, Link as LinkIcon, MoreHorizontal, Pencil, Trash2, Calendar, Clock, Server, Badge as BadgeIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ApiMappingsViewProps {
  mappings: ApiMapping[]
  apis: Api[]
  permissions: Permission[]
  services: ApiService[]
  isLoading: boolean
  totalCount: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onCreate: (data: { api_id: number; permission_id: number }) => Promise<void>
  onUpdate: (id: number, data: { api_id: number; permission_id: number }) => Promise<void>
  onDelete: (apiId: number, permissionId: number) => void
}

export function ApiMappingsView({
  mappings,
  apis,
  permissions,
  services,
  isLoading,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onCreate,
  onUpdate,
  onDelete,
}: ApiMappingsViewProps) {
  // Dialog state (local UI state)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentMapping, setCurrentMapping] = useState<ApiMapping | null>(null)
  
  // Form state (local UI state)
  const [formData, setFormData] = useState({
    api_id: "",
    permission_id: "",
  })

  const openCreateDialog = () => {
    setCurrentMapping(null)
    setFormData({ api_id: "", permission_id: "" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (mapping: ApiMapping) => {
    setCurrentMapping(mapping)
    setFormData({
      api_id: mapping.api_id.toString(),
      permission_id: mapping.permission_id.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.api_id || !formData.permission_id) {
      toast.error("Please select both API and Permission")
      return
    }

    setIsSubmitting(true)
    
    const requestData = {
      api_id: parseInt(formData.api_id),
      permission_id: parseInt(formData.permission_id)
    }

    try {
      if (currentMapping) {
        await onUpdate(currentMapping.id, requestData)
      } else {
        await onCreate(requestData)
      }
      setIsDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: ColumnDef<ApiMapping>[] = [
    {
      accessorKey: "service_id",
      header: () => (
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4" />
          <span>Service</span>
        </div>
      ),
      cell: ({ row }) => {
        const api = apis.find(a => a.id === row.getValue("api_id"))
        const service = api ? services.find(s => s.id === api.api_service_id) : null
        return (
          <div className="font-medium text-foreground">
            {service ? service.name : 'Unknown Service'}
          </div>
        )
      },
    },
    {
      id: "method",
      header: () => (
        <div className="flex items-center gap-2">
          <BadgeIcon className="w-4 h-4" />
          <span>Method</span>
        </div>
      ),
      cell: ({ row }) => {
        const api = apis.find(a => a.id === row.getValue("api_id"))
        if (!api) return null
        return (
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-1.5 py-0.5 font-bold uppercase",
              api.method === 'GET' && "text-blue-500 border-blue-500/30 bg-blue-500/10",
              api.method === 'POST' && "text-green-500 border-green-500/30 bg-green-500/10",
              api.method === 'PUT' && "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
              api.method === 'DELETE' && "text-red-500 border-red-500/30 bg-red-500/10",
              api.method === 'PATCH' && "text-purple-500 border-purple-500/30 bg-purple-500/10",
            )}
          >
            {api.method}
          </Badge>
        )
      },
    },
    {
      accessorKey: "api_id",
      header: () => (
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          <span>API Path</span>
        </div>
      ),
      cell: ({ row }) => {
        const api = apis.find((a) => a.id === row.getValue("api_id"))
        return (
          <Badge variant="secondary" className="font-mono text-xs font-medium bg-muted/30 text-foreground border-border/50">
            {api ? api.path : `ID: ${row.getValue("api_id")}`}
          </Badge>
        )
      },
    },
    {
      accessorKey: "permission_id",
      header: () => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Permission</span>
        </div>
      ),
      cell: ({ row }) => {
        const perm = permissions.find(p => p.id === row.getValue("permission_id"))
        return (
          <Badge variant="secondary" className="font-medium bg-muted/30 text-foreground border-border/50">
            {perm ? perm.name : `ID: ${row.getValue("permission_id")}`}
          </Badge>
        )
      },
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
        const mapping = row.original
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
                <DropdownMenuItem onClick={() => openEditDialog(mapping)} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Binding
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => onDelete(mapping.api_id, mapping.permission_id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Unbind
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
          <h2 className="text-2xl font-bold tracking-tight">API Mappings</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Map API endpoints to their required permissions for Gatekeeper authorization.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Bind Permission
          </Button>
        </div>
      </div>
      
      <Card className="border-border/50 shadow-sm py-0 overflow-hidden">
        <CardContent className="p-0 flex flex-col">
          <div className="w-full">
            <DataTable
              columns={columns}
              data={mappings}
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
              <DialogTitle className="text-xl">{currentMapping ? "Edit Binding" : "Create Binding"}</DialogTitle>
              <DialogDescription className="text-sm">
                {currentMapping 
                  ? "Update the permission assigned to this API endpoint." 
                  : "Select an API and the Permission required to access it."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-2">
              <div className="grid gap-2">
                <Label htmlFor="api" className="text-sm font-medium">Target API</Label>
                <SearchableSelect
                  items={apis.map(api => ({ 
                    id: api.id.toString(), 
                    label: `[${api.method}] ${api.path}` 
                  }))}
                  value={formData.api_id}
                  onValueChange={(val) => setFormData({...formData, api_id: val})}
                  placeholder="Select an API path..."
                  searchPlaceholder="Search API path..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="permission" className="text-sm font-medium">Required Permission</Label>
                <SearchableSelect
                  items={permissions.map(p => ({ id: p.id.toString(), label: p.name }))}
                  value={formData.permission_id}
                  onValueChange={(val) => setFormData({...formData, permission_id: val})}
                  placeholder="Select a Permission..."
                  searchPlaceholder="Search Permission..."
                />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (currentMapping ? "Updating..." : "Binding...") : (currentMapping ? "Update Binding" : "Bind Permission")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
