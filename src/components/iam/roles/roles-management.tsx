"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { DataTable } from "@/components/common/data-table"
import { Pagination } from "@/components/common/pagination"
import { SearchableMultiSelect } from "@/components/common/searchable-select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, MoreHorizontal, Pencil, Trash2, Shield, Key } from "lucide-react"
import { toast } from "sonner"
import { formatDate, formatRelativeDate } from "@/utils/formatting"
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchRolePermissionMappings,
  bulkAddRolePermissionMappings,
  removeRolePermissionMapping,
} from "@/hooks/iam/iam-service"
import { fetchPermissions } from "@/hooks/operator/permissions-service"
import { Role, RolePermission } from "@/types/iam"
import { Permission } from "@/types/operator"
import { AccessDenied } from "@/components/access-denied"

export function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [roleForm, setRoleForm] = useState({ name: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [isPermsDialogOpen, setIsPermsDialogOpen] = useState(false)
  const [permsRoleId, setPermsRoleId] = useState<number | null>(null)
  const [permMappings, setPermMappings] = useState<RolePermission[]>([])
  const [permsLoading, setPermsLoading] = useState(false)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])
  const [isAddingPerms, setIsAddingPerms] = useState(false)

  const loadAllPermissions = useCallback(() => {
    fetchPermissions({
      limit: 200,
      successTask: (data: any) => {
        const items = data?.data ?? data?.items ?? data ?? []
        setAllPermissions(Array.isArray(items) ? items : [])
      },
      failureTask: () => {},
      errorTask: () => {},
    })
  }, [])

  useEffect(() => {
    loadAllPermissions()
  }, [loadAllPermissions])

  const loadRoles = useCallback(() => {
    setIsLoading(true)
    fetchRoles({
      page,
      limit: pageSize,
      successTask: (data: { data: Role[]; count: number }) => {
        setRoles(data.data ?? [])
        setTotalCount(data.count ?? 0)
        setIsLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to fetch roles")
        setIsLoading(false)
      },
      errorTask: () => {
        toast.error("Error fetching roles")
        setIsLoading(false)
      },
      forbiddenTask: () => {
        setAccessDenied(true)
        setIsLoading(false)
      },
    })
  }, [page, pageSize])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const openCreateDialog = () => {
    setCurrentRole(null)
    setRoleForm({ name: "" })
    setIsRoleDialogOpen(true)
  }

  const openEditDialog = (role: Role) => {
    setCurrentRole(role)
    setRoleForm({ name: role.name || "" })
    setIsRoleDialogOpen(true)
  }

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    createRole({
      request: { name: roleForm.name },
      successTask: () => {
        toast.success("Role created")
        setIsRoleDialogOpen(false)
        setIsSubmitting(false)
        loadRoles()
      },
      failureTask: () => {
        toast.error("Failed to create role")
        setIsSubmitting(false)
      },
      errorTask: () => {
        toast.error("Error creating role")
        setIsSubmitting(false)
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setIsSubmitting(false)
      },
    })
  }

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentRole) return
    setIsSubmitting(true)
    updateRole({
      id: currentRole.id,
      request: { name: roleForm.name },
      successTask: () => {
        toast.success("Role updated")
        setIsRoleDialogOpen(false)
        setIsSubmitting(false)
        loadRoles()
      },
      failureTask: () => {
        toast.error("Failed to update role")
        setIsSubmitting(false)
      },
      errorTask: () => {
        toast.error("Error updating role")
        setIsSubmitting(false)
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setIsSubmitting(false)
      },
    })
  }

  const handleDeleteRole = (id: number) => {
    deleteRole({
      id,
      successTask: () => {
        toast.success("Role deleted")
        loadRoles()
      },
      failureTask: () => {
        toast.error("Failed to delete role")
      },
      errorTask: () => {
        toast.error("Error deleting role")
      },
      forbiddenTask: () => {
        toast.error("Access denied")
      },
    })
  }

  const openPermsDialog = (roleId: number) => {
    setPermsRoleId(roleId)
    setSelectedPermissionIds([])
    setIsPermsDialogOpen(true)
    loadPermMappings(roleId)
  }

  const loadPermMappings = (roleId: number) => {
    setPermsLoading(true)
    fetchRolePermissionMappings({
      roleId,
      successTask: (data: { data: RolePermission[] }) => {
        setPermMappings(data.data ?? [])
        setPermsLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to load permission mappings")
        setPermsLoading(false)
      },
      errorTask: () => {
        toast.error("Error loading permission mappings")
        setPermsLoading(false)
      },
    })
  }

  const handleAddSelectedPermissions = () => {
    if (!permsRoleId || selectedPermissionIds.length === 0) return
    const permissionIds = selectedPermissionIds.map(Number)
    setIsAddingPerms(true)
    bulkAddRolePermissionMappings({
      request: { role_id: permsRoleId, permission_ids: permissionIds },
      successTask: (data: any) => {
        const count = data?.count ?? permissionIds.length
        toast.success(count === 1 ? "Permission added to role" : `${count} permissions added to role`)
        setSelectedPermissionIds([])
        setIsAddingPerms(false)
        loadPermMappings(permsRoleId)
      },
      failureTask: () => {
        toast.error("Failed to add permissions")
        setIsAddingPerms(false)
      },
      errorTask: () => {
        toast.error("Error adding permissions")
        setIsAddingPerms(false)
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setIsAddingPerms(false)
      },
    })
  }

  const handleRemovePermission = (permissionId: number) => {
    if (!permsRoleId) return
    removeRolePermissionMapping({
      roleId: permsRoleId,
      permissionId,
      successTask: () => {
        toast.success("Permission removed from role")
        loadPermMappings(permsRoleId)
      },
      failureTask: () => {
        toast.error("Failed to remove permission")
      },
      errorTask: () => {
        toast.error("Error removing permission")
      },
      forbiddenTask: () => {
        toast.error("Access denied")
      },
    })
  }

  const addablePermissionItems = useMemo(() => {
    const mapped = new Set(permMappings.map((m) => m.permission_id))
    return allPermissions
      .filter((p) => !mapped.has(p.id))
      .map((p) => ({ id: p.id.toString(), label: p.name }))
  }, [allPermissions, permMappings])

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: () => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Name</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "organization_id",
      header: "Organization ID",
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.getValue("organization_id")}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Created</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          {formatDate(row.getValue("created_at"))}
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground/60">
          {formatRelativeDate(row.getValue("updated_at"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[180px]">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openEditDialog(role)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openPermsDialog(role.id)} className="cursor-pointer">
                <Key className="mr-2 h-4 w-4" /> Permissions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => handleDeleteRole(role.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (accessDenied) return <AccessDenied />

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage roles and their permission assignments.
        </p>
        <Button onClick={openCreateDialog} size="sm" className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Create Role
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm py-0 overflow-hidden">
        <CardContent className="p-0 flex flex-col">
          <DataTable
            columns={columns}
            data={roles}
            isLoading={isLoading}
            className="border-0 rounded-none bg-transparent"
          />
          {!isLoading && totalCount > pageSize && (
            <div className="px-4 py-2 border-t border-border/50 bg-muted/5">
              <Pagination
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <form onSubmit={currentRole ? handleUpdateRole : handleCreateRole}>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl">
                {currentRole ? "Edit Role" : "Create Role"}
              </DialogTitle>
              <DialogDescription>
                {currentRole ? "Update role details." : "Create a new role."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-2">
              <div className="grid gap-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="e.g. admin, viewer"
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setIsRoleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? "Saving..." : "Save Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermsDialogOpen} onOpenChange={setIsPermsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Role Permissions</DialogTitle>
            <DialogDescription>
              Select one or more permissions, then add them to this role in one step.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 min-w-0">
                <SearchableMultiSelect
                  items={addablePermissionItems}
                  value={selectedPermissionIds}
                  onValueChange={setSelectedPermissionIds}
                  placeholder="Select permissions..."
                  searchPlaceholder="Search permissions..."
                  emptyMessage="No unmapped permissions."
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddSelectedPermissions}
                disabled={selectedPermissionIds.length === 0 || isAddingPerms}
                className="cursor-pointer shrink-0"
              >
                <Key className="h-4 w-4 mr-1" />
                {isAddingPerms ? "Adding..." : "Add"}
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {permMappings.map((m) => (
                <div key={m.permission_id} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">
                    {allPermissions.find(p => p.id === m.permission_id)?.name ?? `Permission #${m.permission_id}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handleRemovePermission(m.permission_id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
              {!permsLoading && permMappings.length === 0 && (
                <p className="text-xs text-muted-foreground">No permissions assigned.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
