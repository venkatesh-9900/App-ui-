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
  UserPlus,
  Trash2,
  Users,
  Link as LinkIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
  fetchGroups,
  fetchSubGroups,
  fetchIamUsers,
  fetchUserGroupMappings,
  addUserGroupMapping,
  removeUserGroupMapping,
  fetchUserSubGroupMappings,
  addUserSubGroupMapping,
  removeUserSubGroupMapping,
} from "@/hooks/iam/iam-service"
import { Group, SubGroup, UserGroup, UserSubGroup } from "@/types/iam"
import { SearchableSelect } from "@/components/common/searchable-select"
import { AccessDenied } from "@/components/access-denied"

export function GroupUserMappingsTab() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null)
  const [subGroups, setSubGroups] = useState<SubGroup[]>([])
  const [subGroupsLoading, setSubGroupsLoading] = useState(false)

  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
  const [usersDialogTitle, setUsersDialogTitle] = useState("")
  const [usersDialogType, setUsersDialogType] = useState<"group" | "subgroup">("group")
  const [usersTargetId, setUsersTargetId] = useState<number | null>(null)

  const [allUsers, setAllUsers] = useState<{ id: number; email: string }[]>([])
  const [groupUsers, setGroupUsers] = useState<UserGroup[]>([])
  const [subGroupUsers, setSubGroupUsers] = useState<UserSubGroup[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [addUserForm, setAddUserForm] = useState({ userId: "" })

  const loadAllUsers = useCallback(() => {
    fetchIamUsers({
      successTask: (data: { data: { id: number; email: string }[] }) => {
        setAllUsers(data.data ?? [])
      },
      failureTask: () => {},
      errorTask: () => {},
    })
  }, [])

  useEffect(() => {
    loadAllUsers()
  }, [loadAllUsers])

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

  const openGroupUsersDialog = (group: Group) => {
    setUsersDialogType("group")
    setUsersTargetId(group.id)
    setUsersDialogTitle(`Users in Group: ${group.name}`)
    setAddUserForm({ userId: "" })
    setIsUsersDialogOpen(true)
    loadGroupUsers(group.id)
  }

  const openSubGroupUsersDialog = (subGroup: SubGroup) => {
    setUsersDialogType("subgroup")
    setUsersTargetId(subGroup.id)
    setUsersDialogTitle(`Users in SubGroup: ${subGroup.name}`)
    setAddUserForm({ userId: "" })
    setIsUsersDialogOpen(true)
    loadSubGroupUsers(subGroup.id)
  }

  const loadGroupUsers = (groupId: number) => {
    setUsersLoading(true)
    fetchUserGroupMappings({
      groupId,
      successTask: (data: { data: UserGroup[] }) => {
        setGroupUsers(data.data ?? [])
        setUsersLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to load group users")
        setUsersLoading(false)
      },
      errorTask: () => {
        toast.error("An error occurred while loading group users")
        setUsersLoading(false)
      },
    })
  }

  const loadSubGroupUsers = (subGroupId: number) => {
    setUsersLoading(true)
    fetchUserSubGroupMappings({
      subGroupId,
      successTask: (data: { data: UserSubGroup[] }) => {
        setSubGroupUsers(data.data ?? [])
        setUsersLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to load subgroup users")
        setUsersLoading(false)
      },
      errorTask: () => {
        toast.error("An error occurred while loading subgroup users")
        setUsersLoading(false)
      },
    })
  }

  const handleAddUser = () => {
    if (!usersTargetId || !addUserForm.userId) return

    if (usersDialogType === "group") {
      addUserGroupMapping({
        request: { user_id: Number(addUserForm.userId), group_id: usersTargetId },
        successTask: () => {
          toast.success("User added to group")
          setAddUserForm({ userId: "" })
          loadGroupUsers(usersTargetId!)
        },
        failureTask: () => toast.error("Failed to add user"),
        errorTask: () => toast.error("An error occurred while adding user"),
        forbiddenTask: () => toast.error("Access denied"),
      })
    } else {
      addUserSubGroupMapping({
        request: { user_id: Number(addUserForm.userId), sub_group_id: usersTargetId },
        successTask: () => {
          toast.success("User added to subgroup")
          setAddUserForm({ userId: "" })
          loadSubGroupUsers(usersTargetId!)
        },
        failureTask: () => toast.error("Failed to add user"),
        errorTask: () => toast.error("An error occurred while adding user"),
        forbiddenTask: () => toast.error("Access denied"),
      })
    }
  }

  const handleRemoveGroupUser = (userId: number) => {
    if (!usersTargetId) return
    removeUserGroupMapping({
      userId,
      groupId: usersTargetId,
      successTask: () => {
        toast.success("User removed from group")
        loadGroupUsers(usersTargetId!)
      },
      failureTask: () => toast.error("Failed to remove user"),
      errorTask: () => toast.error("An error occurred while removing user"),
      forbiddenTask: () => toast.error("Access denied"),
    })
  }

  const handleRemoveSubGroupUser = (userId: number) => {
    if (!usersTargetId) return
    removeUserSubGroupMapping({
      userId,
      subGroupId: usersTargetId,
      successTask: () => {
        toast.success("User removed from subgroup")
        loadSubGroupUsers(usersTargetId!)
      },
      failureTask: () => toast.error("Failed to remove user"),
      errorTask: () => toast.error("An error occurred while removing user"),
      forbiddenTask: () => toast.error("Access denied"),
    })
  }

  const currentMappings = usersDialogType === "group" ? groupUsers : subGroupUsers

  if (accessDenied) return <AccessDenied />

  return (
    <div className="space-y-4 mt-4">
      <p className="text-sm text-muted-foreground">
        Manage user mappings for groups and subgroups.
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
                    onClick={() => openGroupUsersDialog(group)}
                  >
                    <UserPlus className="mr-1 h-3 w-3" /> Manage Users
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
                              onClick={() => openSubGroupUsersDialog(sg)}
                            >
                              <UserPlus className="mr-1 h-3 w-3" /> Users
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

      {/* Users Dialog */}
      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{usersDialogTitle}</DialogTitle>
            <DialogDescription>Add or remove user mappings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <SearchableSelect
                  items={allUsers.map(u => ({ id: u.id.toString(), label: u.email }))}
                  value={addUserForm.userId}
                  onValueChange={(val) => setAddUserForm({ userId: val })}
                  placeholder="Select a user..."
                  searchPlaceholder="Search users by email..."
                  emptyMessage="No users found."
                />
              </div>
              <Button size="sm" onClick={handleAddUser} className="cursor-pointer">
                <UserPlus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {usersLoading ? (
              <p className="text-xs text-muted-foreground">Loading users...</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {currentMappings.map((m) => {
                  const userId = m.user_id
                  const key =
                    usersDialogType === "group"
                      ? `g-${(m as UserGroup).group_id}-${userId}`
                      : `sg-${(m as UserSubGroup).sub_group_id}-${userId}`
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {allUsers.find(u => u.id === userId)?.email ?? `User #${userId}`}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() =>
                          usersDialogType === "group"
                            ? handleRemoveGroupUser(userId)
                            : handleRemoveSubGroupUser(userId)
                        }
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  )
                })}
                {currentMappings.length === 0 && !usersLoading && (
                  <p className="text-xs text-muted-foreground">No users mapped yet.</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsUsersDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
