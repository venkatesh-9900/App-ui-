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
  ChevronDown,
  ChevronRight,
  Shield,
  Trash2,
  Users,
  Link as LinkIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
  fetchGroups,
  fetchSubGroups,
  fetchRoles,
  fetchGroupRoleMappings,
  addGroupRoleMapping,
  removeGroupRoleMapping,
  fetchSubGroupRoleMappings,
  addSubGroupRoleMapping,
  removeSubGroupRoleMapping,
} from "@/hooks/iam/iam-service"
import { Group, SubGroup, GroupRole, SubGroupRole, Role } from "@/types/iam"
import { SearchableSelect } from "@/components/common/searchable-select"
import { AccessDenied } from "@/components/access-denied"

export function GroupRoleMappingsTab() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null)
  const [subGroups, setSubGroups] = useState<SubGroup[]>([])
  const [subGroupsLoading, setSubGroupsLoading] = useState(false)

  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false)
  const [rolesDialogTitle, setRolesDialogTitle] = useState("")
  const [rolesDialogType, setRolesDialogType] = useState<"group" | "subgroup">("group")
  const [rolesTargetId, setRolesTargetId] = useState<number | null>(null)

  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [groupRoles, setGroupRoles] = useState<GroupRole[]>([])
  const [subGroupRoles, setSubGroupRoles] = useState<SubGroupRole[]>([])
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

  const loadSubGroups = useCallback((groupId: number) => {
    setSubGroupsLoading(true)
    fetchSubGroups({
      groupId,
      successTask: (data: { data: SubGroup[] }) => {
        setSubGroups(data.data ?? [])
        setSubGroupsLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to load subgroups")
        setSubGroupsLoading(false)
      },
      errorTask: () => {
        toast.error("An error occurred while loading subgroups")
        setSubGroupsLoading(false)
      },
    })
  }, [])

  const toggleExpand = (groupId: number) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null)
      setSubGroups([])
    } else {
      setExpandedGroupId(groupId)
      loadSubGroups(groupId)
    }
  }

  const openGroupRolesDialog = (group: Group) => {
    setRolesDialogType("group")
    setRolesTargetId(group.id)
    setRolesDialogTitle(`Roles for Group: ${group.name}`)
    setAddRoleForm({ roleId: "" })
    setIsRolesDialogOpen(true)
    loadGroupRoles(group.id)
  }

  const openSubGroupRolesDialog = (subGroup: SubGroup) => {
    setRolesDialogType("subgroup")
    setRolesTargetId(subGroup.id)
    setRolesDialogTitle(`Roles for SubGroup: ${subGroup.name}`)
    setAddRoleForm({ roleId: "" })
    setIsRolesDialogOpen(true)
    loadSubGroupRoles(subGroup.id)
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

  const loadSubGroupRoles = (subGroupId: number) => {
    setRolesLoading(true)
    fetchSubGroupRoleMappings({
      subGroupId,
      successTask: (data: { data: SubGroupRole[] }) => {
        setSubGroupRoles(data.data ?? [])
        setRolesLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to load subgroup roles")
        setRolesLoading(false)
      },
      errorTask: () => {
        toast.error("An error occurred while loading subgroup roles")
        setRolesLoading(false)
      },
    })
  }

  const handleAddRole = () => {
    if (!rolesTargetId || !addRoleForm.roleId) return

    if (rolesDialogType === "group") {
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
    } else {
      addSubGroupRoleMapping({
        request: { sub_group_id: rolesTargetId, role_id: Number(addRoleForm.roleId) },
        successTask: () => {
          toast.success("Role mapped to subgroup")
          setAddRoleForm({ roleId: "" })
          loadSubGroupRoles(rolesTargetId!)
        },
        failureTask: () => toast.error("Failed to map role"),
        errorTask: () => toast.error("An error occurred while mapping role"),
        forbiddenTask: () => toast.error("Access denied"),
      })
    }
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

  const handleRemoveSubGroupRole = (roleId: number) => {
    if (!rolesTargetId) return
    removeSubGroupRoleMapping({
      subGroupId: rolesTargetId,
      roleId,
      successTask: () => {
        toast.success("Role mapping removed")
        loadSubGroupRoles(rolesTargetId!)
      },
      failureTask: () => toast.error("Failed to remove role mapping"),
      errorTask: () => toast.error("An error occurred while removing role mapping"),
      forbiddenTask: () => toast.error("Access denied"),
    })
  }

  const currentMappings = rolesDialogType === "group" ? groupRoles : subGroupRoles

  if (accessDenied) return <AccessDenied />

  return (
    <div className="space-y-4 mt-4">
      <p className="text-sm text-muted-foreground">
        Manage role mappings for groups and subgroups.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading groups...</p>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <Card key={group.id} className="border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={() => toggleExpand(group.id)}
                    >
                      {expandedGroupId === group.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
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

                {expandedGroupId === group.id && (
                  <div className="px-6 py-4 bg-muted/30 border-t border-border/50">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <LinkIcon className="h-4 w-4" />
                      SubGroups
                    </h4>
                    {subGroupsLoading ? (
                      <p className="text-xs text-muted-foreground">Loading...</p>
                    ) : (
                      <div className="space-y-2">
                        {subGroups.map((sg) => (
                          <div
                            key={sg.id}
                            className="flex items-center justify-between p-2 rounded bg-background border"
                          >
                            <span className="text-sm">{sg.name}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer"
                              onClick={() => openSubGroupRolesDialog(sg)}
                            >
                              <Shield className="mr-1 h-3 w-3" /> Roles
                            </Button>
                          </div>
                        ))}
                        {subGroups.length === 0 && (
                          <p className="text-xs text-muted-foreground">No subgroups.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
                {currentMappings.map((r) => {
                  const roleId = r.role_id
                  const key =
                    rolesDialogType === "group"
                      ? `g-${(r as GroupRole).group_id}-${roleId}`
                      : `sg-${(r as SubGroupRole).sub_group_id}-${roleId}`
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
                        onClick={() =>
                          rolesDialogType === "group"
                            ? handleRemoveGroupRole(roleId)
                            : handleRemoveSubGroupRole(roleId)
                        }
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  )
                })}
                {currentMappings.length === 0 && !rolesLoading && (
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
