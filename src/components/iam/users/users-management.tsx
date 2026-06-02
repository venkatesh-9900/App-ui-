"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Shield,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Trash2,
  Plus,
  Search,
  Info,
} from "lucide-react"
import { toast } from "sonner"
import {
  fetchRoles,
  fetchIamUsers,
  fetchUserRoleMappings,
  bulkAddUserRoleMappings,
  removeUserRoleMapping,
} from "@/hooks/iam/iam-service"
import { Role, UserRole } from "@/types/iam"
import { SearchableMultiSelect } from "@/components/common/searchable-select"
import { AccessDenied } from "@/components/access-denied"
import { useAuth } from "@/contexts/auth-context"

export function UsersManagement() {
  const { userInfo } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [expandedRoleId, setExpandedRoleId] = useState<number | null>(null)
  const [allUsers, setAllUsers] = useState<{ id: number; email: string }[]>([])
  const [roleMappings, setRoleMappings] = useState<Record<number, UserRole[]>>({})
  const [mappingsLoading, setMappingsLoading] = useState<Record<number, boolean>>({})
  const [addUserInputs, setAddUserInputs] = useState<Record<number, string[]>>({})
  const [isAddingUsers, setIsAddingUsers] = useState<Record<number, boolean>>({}) 
  const [mappedUsersSearch, setMappedUsersSearch] = useState<Record<number, string>>({})

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

  const loadRoles = useCallback(() => {
    setRolesLoading(true)
    fetchRoles({
      limit: 100,
      successTask: (data: { data: Role[]; count: number }) => {
        setRoles(data.data ?? [])
        setRolesLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to load roles")
        setRolesLoading(false)
      },
      errorTask: () => {
        toast.error("An error occurred while loading roles")
        setRolesLoading(false)
      },
      forbiddenTask: () => {
        setAccessDenied(true)
        setRolesLoading(false)
      },
    })
  }, [])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const loadMappingsForRole = useCallback((roleId: number) => {
    setMappingsLoading((prev) => ({ ...prev, [roleId]: true }))
    fetchUserRoleMappings({
      roleId,
      successTask: (data: { data: UserRole[] }) => {
        setRoleMappings((prev) => ({ ...prev, [roleId]: data.data ?? [] }))
        setMappingsLoading((prev) => ({ ...prev, [roleId]: false }))
      },
      failureTask: () => {
        toast.error("Failed to load user mappings")
        setMappingsLoading((prev) => ({ ...prev, [roleId]: false }))
      },
      errorTask: () => {
        toast.error("An error occurred while loading user mappings")
        setMappingsLoading((prev) => ({ ...prev, [roleId]: false }))
      },
    })
  }, [])

  const toggleRole = (roleId: number) => {
    if (expandedRoleId === roleId) {
      setExpandedRoleId(null)
    } else {
      setExpandedRoleId(roleId)
      loadMappingsForRole(roleId)
    }
  }

  const handleAddUsers = (roleId: number) => {
    const userIds = addUserInputs[roleId] ?? []
    if (userIds.length === 0) return

    setIsAddingUsers((prev) => ({ ...prev, [roleId]: true }))
    bulkAddUserRoleMappings({
      request: { role_id: roleId, user_ids: userIds.map(Number) },
      successTask: () => {
        toast.success(`${userIds.length} user(s) added to role`)
        setAddUserInputs((prev) => ({ ...prev, [roleId]: [] }))
        loadMappingsForRole(roleId)
        setIsAddingUsers((prev) => ({ ...prev, [roleId]: false }))
      },
      failureTask: () => {
        toast.error("Failed to add users to role")
        setIsAddingUsers((prev) => ({ ...prev, [roleId]: false }))
      },
      errorTask: () => {
        toast.error("An error occurred while adding users")
        setIsAddingUsers((prev) => ({ ...prev, [roleId]: false }))
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setIsAddingUsers((prev) => ({ ...prev, [roleId]: false }))
      },
    })
  }

  const handleRemoveUser = (roleId: number, userId: number) => {
    removeUserRoleMapping({
      roleId,
      userId,
      successTask: () => {
        toast.success("User removed from role")
        loadMappingsForRole(roleId)
      },
      failureTask: () => toast.error("Failed to remove user from role"),
      errorTask: () => toast.error("An error occurred while removing user"),
      forbiddenTask: () => toast.error("Access denied"),
    })
  }

  if (accessDenied) return <AccessDenied />

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-2xl">Users</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage user-role mappings. Expand a role to view and manage its assigned users.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <span className="font-semibold">Individual role assignments may not take effect</span>{" "}
              if the user is already a member of a group. Group-level permissions take highest priority and will override any roles assigned here.
            </p>
          </div>
        </CardHeader>
        <CardContent>
      {rolesLoading ? (
        <p className="text-sm text-muted-foreground">Loading roles...</p>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Shield className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No roles found. Create roles first to manage user mappings.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {roles.map((role) => {
            const isExpanded = expandedRoleId === role.id
            const mappings = roleMappings[role.id] ?? []
            const isLoadingMappings = mappingsLoading[role.id] ?? false
            const selectedUserIds = addUserInputs[role.id] ?? []
            const mappedUserIds = new Set(mappings.map((m) => m.user_id))
            const addableUserItems = allUsers
              .filter((u) => !mappedUserIds.has(u.id))
              .map((u) => ({ id: u.id.toString(), label: u.email }))

            return (
              <Card key={role.id} className="border-border/50 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-3 sm:px-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 cursor-pointer"
                        onClick={() => toggleRole(role.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{role.name}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {isLoadingMappings ? "..." : mappings.length} user{mappings.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="px-3 py-3 sm:px-6 sm:py-4 bg-muted/30 border-t border-border/50 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                        <div className="flex-1 sm:max-w-xs">
                          <SearchableMultiSelect
                            items={addableUserItems}
                            value={selectedUserIds}
                            onValueChange={(val) =>
                              setAddUserInputs((prev) => ({
                                ...prev,
                                [role.id]: val,
                              }))
                            }
                            placeholder="Select users..."
                            searchPlaceholder="Search users by email..."
                            emptyMessage="No users found."
                            selectionLabel="users"
                          />
                        </div>
                        <Button
                          size="sm"
                          disabled={selectedUserIds.length === 0 || (isAddingUsers[role.id] ?? false)}
                          onClick={() => handleAddUsers(role.id)}
                          className="cursor-pointer"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add User{selectedUserIds.length > 1 ? "s" : ""}
                        </Button>
                      </div>

                      {isLoadingMappings ? (
                        <p className="text-xs text-muted-foreground">Loading users...</p>
                      ) : mappings.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No users assigned to this role.</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative mb-2">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Search mapped users..."
                              value={mappedUsersSearch[role.id] ?? ""}
                              onChange={(e) => setMappedUsersSearch((prev) => ({ ...prev, [role.id]: e.target.value }))}
                              className="w-full h-8 pl-8 pr-3 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </div>
                          {mappings
                            .filter((mapping) => {
                              const search = mappedUsersSearch[role.id] ?? ""
                              if (!search) return true
                              const email = allUsers.find(u => u.id === mapping.user_id)?.email ?? `User #${mapping.user_id}`
                              return email.toLowerCase().includes(search.toLowerCase())
                            })
                            .map((mapping) => {
                            const mappedEmail = allUsers.find(u => u.id === mapping.user_id)?.email
                            const isSelf = mappedEmail === userInfo?.email
                            return (
                            <div
                              key={`${mapping.role_id}-${mapping.user_id}`}
                              className="flex items-center justify-between p-2 rounded border bg-background"
                            >
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                                <Badge variant="outline" className="text-xs">
                                  {mappedEmail ?? `User #${mapping.user_id}`}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Added {new Date(mapping.created_at.endsWith('Z') ? mapping.created_at : mapping.created_at + 'Z').toLocaleDateString()}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                disabled={isSelf}
                                title={isSelf ? "You cannot remove yourself" : undefined}
                                onClick={() => handleRemoveUser(role.id, mapping.user_id)}
                              >
                                <Trash2 className={`h-3 w-3 ${isSelf ? 'text-muted-foreground' : 'text-destructive'}`} />
                              </Button>
                            </div>
                          )})}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
        </CardContent>
      </Card>
    </div>
  )
}
