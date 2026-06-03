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
  UserPlus,
  Trash2,
  Users,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import {
  fetchGroups,
  fetchIamUsers,
  fetchUserGroupMappings,
  bulkAddUserGroupMappings,
  removeUserGroupMapping,
} from "@/hooks/iam/iam-service"
import { Group, UserGroup } from "@/types/iam"
import { SearchableMultiSelect } from "@/components/common/searchable-select"
import { AccessDenied } from "@/components/access-denied"

export function GroupUserMappingsTab() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
  const [usersDialogTitle, setUsersDialogTitle] = useState("")
  const [usersTargetId, setUsersTargetId] = useState<number | null>(null)

  const [allUsers, setAllUsers] = useState<{ id: number; email: string }[]>([])
  const [allUsersError, setAllUsersError] = useState<string | null>(null)
  const [allUsersForbidden, setAllUsersForbidden] = useState(false)
  const [groupUsers, setGroupUsers] = useState<UserGroup[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [usersForbidden, setUsersForbidden] = useState(false)
  const [addUserForm, setAddUserForm] = useState({ userIds: [] as string[] })
  const [isAddingUsers, setIsAddingUsers] = useState(false)
  const [mappedUsersSearch, setMappedUsersSearch] = useState("")

  const loadAllUsers = useCallback(() => {
    fetchIamUsers({
      successTask: (data: { data: { id: number; email: string }[] }) => {
        setAllUsers(data.data ?? [])
      },
      failureTask: () => {
        setAllUsersError("Failed to load users")
        toast.error("Failed to load users")
      },
      errorTask: () => {
        setAllUsersError("An error occurred while loading users")
        toast.error("An error occurred while loading users")
      },
      forbiddenTask: () => {
        setAllUsersForbidden(true)
      },
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

  const openGroupUsersDialog = (group: Group) => {
    setUsersTargetId(group.id)
    setUsersDialogTitle(`Users in Space: ${group.name}`)
    setAddUserForm({ userIds: [] })
    setIsUsersDialogOpen(true)
    loadGroupUsers(group.id)
  }

  const loadGroupUsers = (groupId: number) => {
    setUsersLoading(true)
    setUsersError(null)
    setUsersForbidden(false)
    fetchUserGroupMappings({
      groupId,
      successTask: (data: { data: UserGroup[] }) => {
        setGroupUsers(data.data ?? [])
        setUsersLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to load space users")
        setUsersError("Failed to load space users")
        setUsersLoading(false)
      },
      errorTask: () => {
        toast.error("An error occurred while loading space users")
        setUsersError("An error occurred while loading space users")
        setUsersLoading(false)
      },
      forbiddenTask: () => {
        setUsersForbidden(true)
        setUsersLoading(false)
      },
    })
  }

  const handleAddUsers = () => {
    if (!usersTargetId || addUserForm.userIds.length === 0) return

    setIsAddingUsers(true)
    bulkAddUserGroupMappings({
      request: { group_id: usersTargetId, user_ids: addUserForm.userIds.map(Number) },
      successTask: () => {
        toast.success(`${addUserForm.userIds.length} user(s) added to space`)
        setAddUserForm({ userIds: [] })
        loadGroupUsers(usersTargetId!)
        setIsAddingUsers(false)
      },
      failureTask: () => { toast.error("Failed to add users"); setIsAddingUsers(false) },
      errorTask: () => { toast.error("An error occurred while adding users"); setIsAddingUsers(false) },
      forbiddenTask: () => { toast.error("Access denied"); setIsAddingUsers(false) },
    })
  }

  const handleRemoveGroupUser = (userId: number) => {
    if (!usersTargetId) return
    removeUserGroupMapping({
      userId,
      groupId: usersTargetId,
      successTask: () => {
        toast.success("User removed from space")
        loadGroupUsers(usersTargetId!)
      },
      failureTask: () => toast.error("Failed to remove user"),
      errorTask: () => toast.error("An error occurred while removing user"),
      forbiddenTask: () => toast.error("Access denied"),
    })
  }

  if (accessDenied) return <AccessDenied />

  return (
    <div className="space-y-4 mt-4">
      <p className="text-sm text-muted-foreground">
        Manage user mappings for spaces.
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
                    onClick={() => openGroupUsersDialog(group)}
                  >
                    <UserPlus className="mr-1 h-3 w-3" /> Manage Users
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
                {allUsersForbidden ? (
                  <p className="text-xs text-destructive py-2">Access denied. You don't have permission to view users.</p>
                ) : allUsersError ? (
                  <p className="text-xs text-destructive py-2">{allUsersError}</p>
                ) : (
                  <SearchableMultiSelect
                    items={allUsers
                      .filter(u => !groupUsers.some(m => m.user_id === u.id))
                      .map(u => ({ id: u.id.toString(), label: u.email }))}
                    value={addUserForm.userIds}
                    onValueChange={(val) => setAddUserForm({ userIds: val })}
                    placeholder="Select users..."
                    searchPlaceholder="Search users by email..."
                    emptyMessage="No users found."
                    selectionLabel="users"
                  />
                )}
              </div>
              <Button size="sm" onClick={handleAddUsers} className="cursor-pointer" disabled={allUsersForbidden || !!allUsersError || addUserForm.userIds.length === 0 || isAddingUsers}>
                <UserPlus className="h-4 w-4 mr-1" /> Add{addUserForm.userIds.length > 1 ? ` (${addUserForm.userIds.length})` : ""}
              </Button>
            </div>
            {usersLoading ? (
              <p className="text-xs text-muted-foreground">Loading users...</p>
            ) : usersForbidden ? (
              <p className="text-xs text-destructive">Access denied. You don't have permission to view users for this space.</p>
            ) : usersError ? (
              <p className="text-xs text-destructive">{usersError}</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search mapped users..."
                    value={mappedUsersSearch}
                    onChange={(e) => setMappedUsersSearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                {groupUsers
                  .filter((m) => {
                    if (!mappedUsersSearch) return true
                    const userEmail = allUsers.find(u => u.id === m.user_id)?.email ?? `User #${m.user_id}`
                    return userEmail.toLowerCase().includes(mappedUsersSearch.toLowerCase())
                  })
                  .map((m) => {
                  const userId = m.user_id
                  const key = `g-${m.group_id}-${userId}`
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
                        onClick={() => handleRemoveGroupUser(userId)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  )
                })}
                {groupUsers.length === 0 && !usersLoading && (
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
