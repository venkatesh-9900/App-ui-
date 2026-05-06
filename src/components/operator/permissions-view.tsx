"use client"

import React, { useState, useEffect, useRef } from "react"
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
import { Permission } from "@/types/operator"
import { toast } from "sonner"
import { formatDate, formatRelativeDate } from "@/utils/formatting"
import { Pagination } from "@/components/common/pagination"
import { DataTable } from "@/components/common/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Shield, FileText, Calendar, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface PermissionsViewProps {
  permissions: Permission[]
  isLoading: boolean
  totalCount: number
  page: number
  pageSize: number
  search: string
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSearchChange: (search: string) => void
  onCreate: (data: { name: string; description: string }) => Promise<void>
  onUpdate: (id: number, data: { name: string; description: string }) => Promise<void>
  onDelete: (id: number) => void
}

export function PermissionsView({
  permissions,
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
}: PermissionsViewProps) {
  // Dialog state (local UI state)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null)
  
  // Form state (local UI state)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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
    setCurrentPermission(null)
    setFormData({ name: "", description: "" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (perm: Permission) => {
    setCurrentPermission(perm)
    setFormData({
      name: perm.name || "",
      description: perm.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (currentPermission) {
        await onUpdate(currentPermission.id, formData)
      } else {
        await onCreate(formData)
      }
      setIsDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: ColumnDef<Permission>[] = [
    {
      accessorKey: "name",
      header: () => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Name</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-foreground text-sm">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: () => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Description</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-[11px] text-muted-foreground line-clamp-2">
          {row.getValue("description")}
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
        const perm = row.original
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
                <DropdownMenuItem onClick={() => openEditDialog(perm)} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => onDelete(perm.id)}
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
    <div className="flex flex-col gap-4 px-2 py-2 md:gap-6 md:py-4 md:px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-2xl">Permissions</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Manage the permissions that can be mapped to Roles or APIs.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={localSearch}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="pl-9 h-9 w-full sm:w-[250px] bg-background"
                />
              </div>
              <Button onClick={openCreateDialog} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Permission
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border relative flex flex-col">
            <div className="overflow-x-auto flex-1">
              <DataTable
                columns={columns}
                data={permissions}
                isLoading={isLoading}
                className="border-0 rounded-none bg-transparent"
              />
            </div>
          </div>

          {!isLoading && totalCount > pageSize && (
            <div className="px-4 py-2 border-t border-border/50 bg-muted/5 mt-2">
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
              <DialogTitle className="text-xl">{currentPermission ? "Edit Permission" : "Create Permission"}</DialogTitle>
              <DialogDescription className="text-sm">
                {currentPermission 
                  ? "Update the details of the permission." 
                  : "Register a new permission into the system."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">Permission Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. user:read"
                  className="bg-background"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this permission allow?"
                  className="bg-background"
                />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Permission"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
