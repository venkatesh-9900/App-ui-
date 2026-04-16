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
} from "lucide-react"
import { toast } from "sonner"
import {
  fetchGroups,
  fetchRoles,
  fetchGroupRoleMappings,
  addGroupRoleMapping,
  removeGroupRoleMapping,
} from "@/hooks/iam/iam-service"
import { Group, GroupRole, Role } from "@/types/iam"
import { SearchableSelect } from "@/components/common/searchable-select"
import { AccessDenied } from "@/components/access-denied"

export function GroupRoleMappingsTab() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false)
  const [rolesDialogTitle, setRolesDialogTitle] = useState("")
  const [rolesTargetId, setRolesTargetId] = useState<number | null>(null)

  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [groupRoles, setGroupRoles] = useState<GroupRole[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [addRoleForm, setAddRoleForm] = useState({ roleId: "" })

  const loadAllRoles = useCallback(() => {
    fetchRoles({
      limit: 200,
      successTask: (data: { data: Role[]; count: number }) => {
        setAllRoles(data.data ?? [])
      },
      failureTask: () => {},
      errorTask: () => {},
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
        toast.error("Failed to load groups")
        setIsLoading(false)
      },
      errorTask: () => {
        toast.error("An error occurred while loading groups")
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
    setRolesDialogTitle(`Roles for Group: ${group.name}`)
    setAddRoleForm({ roleId: "" })
    setIsRolesDialogOpen(true)
    loadGroupRoles(group.id)
  }

  const loadGroupRoles = (groupId: number) => {
    setRolesLoading(true)
    fetchGroupRoleMappings({
      groupId,
      successTask: (data: { data: GroupRole[] }) => {
        setGroupRoles(data.data ?? [])
        setRolesLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to load group roles")
        setRolesLoading(false)
      },
      errorTask: () => {
        toast.error("An error occurred while loading group roles")
        setRolesLoading(false)
      },
    })
  }

  const handleAddRole = () => {
    if (!rolesTargetId || !addRoleForm.roleId) return

    addGroupRoleMapping({
      request: { group_id: rolesTargetId, role_id: Number(addRoleForm.roleId) },
      successTask: () => {
        toast.success("Role mapped to group")
        setAddRoleForm({ roleId: "" })
        loadGroupRoles(rolesTargetId!)
      },
      failureTask: () => toast.error("Failed to map role"),
      errorTask: () => toast.error("An error occurred while mapping role"),
      forbiddenTask: () => toast.error("Access denied"),
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
        Manage role mappings for groups.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading groups...</p>
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
            <p className="text-sm text-muted-foreground">No groups found.</p>
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
                <SearchableSelect
                  items={allRoles.map(r => ({ id: r.id.toString(), label: r.name }))}
                  value={addRoleForm.roleId}
                  onValueChange={(val) => setAddRoleForm({ roleId: val })}
                  placeholder="Select a role..."
                  searchPlaceholder="Search roles..."
                  emptyMessage="No roles found."
                />
              </div>
              <Button size="sm" onClick={handleAddRole} className="cursor-pointer">
                <Shield className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {rolesLoading ? (
              <p className="text-xs text-muted-foreground">Loading roles...</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {groupRoles.map((r) => {
                  const roleId = r.role_id
                  const key = `g-${r.group_id}-${roleId}`
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {allRoles.find(rl => rl.id === roleId)?.name ?? `Role #${roleId}`}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleRemoveGroupRole(roleId)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
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
