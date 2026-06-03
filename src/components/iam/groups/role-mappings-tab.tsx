"use client"

import React, { useState, useEffect, useCallback } from "react"
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
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Trash2,
  Users,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import {
  fetchGroups,
  fetchRoles,
  fetchGroupRoleMappings,
  bulkAddGroupRoleMappings,
  removeGroupRoleMapping,
} from "@/hooks/iam/iam-service"
import { Group, GroupRole, Role } from "@/types/iam"
import { SearchableMultiSelect } from "@/components/common/searchable-select"
import { AccessDenied } from "@/components/access-denied"
import { useAuth } from "@/contexts/auth-context"

export function GroupRoleMappingsTab() {
  const { isRootUser } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false)
  const [rolesDialogTitle, setRolesDialogTitle] = useState("")
  const [rolesTargetId, setRolesTargetId] = useState<number | null>(null)

  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [allRolesError, setAllRolesError] = useState<string | null>(null)
  const [allRolesForbidden, setAllRolesForbidden] = useState(false)
  const [groupRoles, setGroupRoles] = useState<GroupRole[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [rolesError, setRolesError] = useState<string | null>(null)
  const [rolesForbidden, setRolesForbidden] = useState(false)
  const [addRoleForm, setAddRoleForm] = useState({ roleIds: [] as string[] })
  const [isAddingRoles, setIsAddingRoles] = useState(false)
  const [mappedRolesSearch, setMappedRolesSearch] = useState("")

  const loadAllRoles = useCallback(() => {
    fetchRoles({
      limit: 200,
      successTask: (data: { data: Role[]; count: number }) => {
        setAllRoles(data.data ?? [])
      },
      failureTask: () => {
        setAllRolesError("Failed to load roles")
        toast.error("Failed to load roles")
      },
      errorTask: () => {
        setAllRolesError("An error occurred while loading roles")
        toast.error("An error occurred while loading roles")
      },
      forbiddenTask: () => {
        setAllRolesForbidden(true)
      },
    })
  }, [])

  useEffect(() => {
    loadAllRoles()
  }, [loadAllRoles])

  const loadGroups = useCallback(() => {
    setIsLoading(true)
    fetchGroups({
      successTask: (data: { data: Group[]; totalCount: number }) => {
        setGroups(data.data ?? [])
        setIsLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to load spaces")
        setIsLoading(false)
      },
      errorTask: () => {
        toast.error("An error occurred while loading spaces")
        setIsLoading(false)
      },
      forbiddenTask: () => {
        setAccessDenied(true)
        setIsLoading(false)
      },
    })
  }, [])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const openGroupRolesDialog = (group: Group) => {
    setRolesTargetId(group.id)
    setRolesDialogTitle(`Roles for Space: ${group.name}`)
    setAddRoleForm({ roleIds: [] })
    setIsRolesDialogOpen(true)
    loadGroupRoles(group.id)
  }

  const loadGroupRoles = (groupId: number) => {
    setRolesLoading(true)
    setRolesError(null)
    setRolesForbidden(false)
    fetchGroupRoleMappings({
      groupId,
      successTask: (data: { data: GroupRole[] }) => {
        setGroupRoles(data.data ?? [])
        setRolesLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to load space roles")
        setRolesError("Failed to load space roles")
        setRolesLoading(false)
      },
      errorTask: () => {
        toast.error("An error occurred while loading space roles")
        setRolesError("An error occurred while loading space roles")
        setRolesLoading(false)
      },
      forbiddenTask: () => {
        setRolesForbidden(true)
        setRolesLoading(false)
      },
    })
  }

  const handleAddRoles = () => {
    if (!rolesTargetId || addRoleForm.roleIds.length === 0) return

    setIsAddingRoles(true)
    bulkAddGroupRoleMappings({
      request: { group_id: rolesTargetId, role_ids: addRoleForm.roleIds.map(Number) },
      successTask: () => {
        toast.success(`${addRoleForm.roleIds.length} role(s) mapped to space`)
        setAddRoleForm({ roleIds: [] })
        loadGroupRoles(rolesTargetId!)
        setIsAddingRoles(false)
      },
      failureTask: () => { toast.error("Failed to map roles"); setIsAddingRoles(false) },
      errorTask: () => { toast.error("An error occurred while mapping roles"); setIsAddingRoles(false) },
      forbiddenTask: () => { toast.error("Access denied"); setIsAddingRoles(false) },
    })
  }

  const handleRemoveGroupRole = (roleId: number) => {
    if (!rolesTargetId) return
    removeGroupRoleMapping({
      groupId: rolesTargetId,
      roleId,
      successTask: () => {
        toast.success("Role mapping removed")
        loadGroupRoles(rolesTargetId!)
      },
      failureTask: () => toast.error("Failed to remove role mapping"),
      errorTask: () => toast.error("An error occurred while removing role mapping"),
      forbiddenTask: () => toast.error("Access denied"),
    })
  }

  if (accessDenied) return <AccessDenied />

  return (
    <div className="space-y-4 mt-4">
      <p className="text-sm text-muted-foreground">
        Manage role mappings for spaces.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading spaces...</p>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <Card key={group.id} className="border-border/50 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-3 sm:px-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{group.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{group.admin_email}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => openGroupRolesDialog(group)}
                  >
                    <Shield className="mr-1 h-3 w-3" /> Manage Roles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {groups.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">No spaces found.</p>
          )}
        </div>
      )}

      {/* Roles Dialog */}
      <Dialog open={isRolesDialogOpen} onOpenChange={setIsRolesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{rolesDialogTitle}</DialogTitle>
            <DialogDescription>Add or remove role mappings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                {allRolesForbidden ? (
                  <p className="text-xs text-destructive py-2">Access denied. You don't have permission to view roles.</p>
                ) : allRolesError ? (
                  <p className="text-xs text-destructive py-2">{allRolesError}</p>
                ) : (
                  <SearchableMultiSelect
                    items={allRoles
                      .filter(r => !groupRoles.some(m => m.role_id === r.id))
                      .map(r => ({ id: r.id.toString(), label: r.name }))}
                    value={addRoleForm.roleIds}
                    onValueChange={(val) => setAddRoleForm({ roleIds: val })}
                    placeholder="Select roles..."
                    searchPlaceholder="Search roles..."
                    emptyMessage="No roles found."
                    selectionLabel="roles"
                  />
                )}
              </div>
              <Button size="sm" onClick={handleAddRoles} className="cursor-pointer" disabled={allRolesForbidden || !!allRolesError || addRoleForm.roleIds.length === 0 || isAddingRoles}>
                <Shield className="h-4 w-4 mr-1" /> Add{addRoleForm.roleIds.length > 1 ? ` (${addRoleForm.roleIds.length})` : ""}
              </Button>
            </div>
            {rolesLoading ? (
              <p className="text-xs text-muted-foreground">Loading roles...</p>
            ) : rolesForbidden ? (
              <p className="text-xs text-destructive">Access denied. You don't have permission to view roles for this space.</p>
            ) : rolesError ? (
              <p className="text-xs text-destructive">{rolesError}</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search mapped roles..."
                    value={mappedRolesSearch}
                    onChange={(e) => setMappedRolesSearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                {groupRoles
                  .filter((r) => {
                    if (!mappedRolesSearch) return true
                    const roleName = allRoles.find(rl => rl.id === r.role_id)?.name ?? `Role #${r.role_id}`
                    return roleName.toLowerCase().includes(mappedRolesSearch.toLowerCase())
                  })
                  .map((r) => {
                  const roleId = r.role_id
                  const key = `g-${r.group_id}-${roleId}`
                  const roleName = allRoles.find(rl => rl.id === roleId)?.name
                  const isWildcard = isRootUser && roleName === '*'
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {roleName ?? `Role #${roleId}`}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        disabled={isWildcard}
                        title={isWildcard ? "Cannot remove wildcard role" : undefined}
                        onClick={() => handleRemoveGroupRole(roleId)}
                      >
                        <Trash2 className={`h-3 w-3 ${isWildcard ? 'text-muted-foreground' : 'text-destructive'}`} />
                      </Button>
                    </div>
                  )
                })}
                {groupRoles.length === 0 && !rolesLoading && (
                  <p className="text-xs text-muted-foreground">No roles mapped yet.</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsRolesDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
