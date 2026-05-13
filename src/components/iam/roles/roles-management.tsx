"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, MoreHorizontal, Pencil, Trash2, Shield, Key, Search } from "lucide-react"
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
import { useAuth } from "@/contexts/auth-context"

export function RolesManagement() {
  const { isRootUser } = useAuth()
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
  const [permsRoleName, setPermsRoleName] = useState<string | null>(null)
  const [permMappings, setPermMappings] = useState<RolePermission[]>([])
  const [permsLoading, setPermsLoading] = useState(false)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])
  const [isAddingPerms, setIsAddingPerms] = useState(false)
  const [mappedPermsSearch, setMappedPermsSearch] = useState("")

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
    console.log("Current roleeeee", role)
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

  const openPermsDialog = (roleId: number, roleName: string) => {
    setPermsRoleId(roleId)
    setPermsRoleName(roleName)
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
      .map((p) => ({ id: p.id.toString(), label: p.description ? `${p.description} (${p.name})` : p.name }))
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
              <DropdownMenuItem onClick={() => openPermsDialog(role.id, role.name)} className="cursor-pointer">
                <Key className="mr-2 h-4 w-4" /> Permissions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => handleDeleteRole(role.id)}
                disabled={role.name === "root"}
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
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-2xl">Roles</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Manage roles and their permission assignments.</p>
              </div>
            </div>
            <Button onClick={openCreateDialog} size="lg" className="w-fit">
              <Plus className="w-4 h-4 mr-2" /> Create Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border relative flex flex-col">
            <div className="overflow-x-auto flex-1">
              <DataTable
                columns={columns}
                data={roles}
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
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search mapped permissions..."
                  value={mappedPermsSearch}
                  onChange={(e) => setMappedPermsSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              {permMappings
                .filter((m) => {
                  if (!mappedPermsSearch) return true
                  const perm = allPermissions.find(p => p.id === m.permission_id)
                  const label = perm ? (perm.description ? `${perm.description} (${perm.name})` : perm.name) : `Permission #${m.permission_id}`
                  return label.toLowerCase().includes(mappedPermsSearch.toLowerCase())
                })
                .map((m) => {
                const perm = allPermissions.find(p => p.id === m.permission_id)
                const isWildcard = isRootUser && perm?.name === '*'
                const isCurrentRoleRoot = permsRoleName === "root"
                return (
                <div key={m.permission_id} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">
                    {perm ? (perm.description ? `${perm.description} (${perm.name})` : perm.name) : `Permission #${m.permission_id}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    disabled={isWildcard && isCurrentRoleRoot}
                    title={isWildcard && isCurrentRoleRoot ? "Cannot remove wildcard permission" : undefined}
                    onClick={() => handleRemovePermission(m.permission_id)}
                  >
                    <Trash2 className={`h-3 w-3 ${isWildcard && isCurrentRoleRoot ? 'text-muted-foreground' : 'text-destructive'}`} />
                  </Button>
                </div>
              )})}
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
