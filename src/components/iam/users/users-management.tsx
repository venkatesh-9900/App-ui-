"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
} from "lucide-react"
import { toast } from "sonner"
import {
  fetchRoles,
  fetchIamUsers,
  fetchUserRoleMappings,
  addUserRoleMapping,
  removeUserRoleMapping,
} from "@/hooks/iam/iam-service"
import { Role, UserRole } from "@/types/iam"
import { SearchableSelect } from "@/components/common/searchable-select"
import { AccessDenied } from "@/components/access-denied"

export function UsersManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [expandedRoleId, setExpandedRoleId] = useState<number | null>(null)
  const [allUsers, setAllUsers] = useState<{ id: number; email: string }[]>([])
  const [roleMappings, setRoleMappings] = useState<Record<number, UserRole[]>>({})
  const [mappingsLoading, setMappingsLoading] = useState<Record<number, boolean>>({})
  const [addUserInputs, setAddUserInputs] = useState<Record<number, string>>({})

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

  const handleAddUser = (roleId: number) => {
    const userId = addUserInputs[roleId]?.trim()
    if (!userId) return

    addUserRoleMapping({
      request: { role_id: roleId, user_id: Number(userId) },
      successTask: () => {
        toast.success("User added to role")
        setAddUserInputs((prev) => ({ ...prev, [roleId]: "" }))
        loadMappingsForRole(roleId)
      },
      failureTask: () => toast.error("Failed to add user to role"),
      errorTask: () => toast.error("An error occurred while adding user"),
      forbiddenTask: () => toast.error("Access denied"),
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
      <p className="text-sm text-muted-foreground">
        Manage user-role mappings. Expand a role to view and manage its assigned users.
      </p>

      {rolesLoading ? (
        <p className="text-sm text-muted-foreground">Loading roles...</p>
      ) : roles.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No roles found. Create roles first to manage user mappings.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {roles.map((role) => {
            const isExpanded = expandedRoleId === role.id
            const mappings = roleMappings[role.id] ?? []
            const isLoadingMappings = mappingsLoading[role.id] ?? false
            const userInput = addUserInputs[role.id] ?? ""

            return (
              <Card key={role.id} className="border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-4 py-3">
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
                        <Badge variant="outline" className="text-xs font-mono">
                          ID: {role.id}
                        </Badge>
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
                    <div className="px-6 py-4 bg-muted/30 border-t border-border/50 space-y-4">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 max-w-xs">
                          <SearchableSelect
                            items={allUsers.map(u => ({ id: u.id.toString(), label: u.email }))}
                            value={userInput}
                            onValueChange={(val) =>
                              setAddUserInputs((prev) => ({
                                ...prev,
                                [role.id]: val,
                              }))
                            }
                            placeholder="Select a user..."
                            searchPlaceholder="Search users by email..."
                            emptyMessage="No users found."
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddUser(role.id)}
                          className="cursor-pointer"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add User
                        </Button>
                      </div>

                      {isLoadingMappings ? (
                        <p className="text-xs text-muted-foreground">Loading users...</p>
                      ) : mappings.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No users assigned to this role.</p>
                      ) : (
                        <div className="space-y-2">
                          {mappings.map((mapping) => (
                            <div
                              key={`${mapping.role_id}-${mapping.user_id}`}
                              className="flex items-center justify-between p-2 rounded border bg-background"
                            >
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                                <Badge variant="outline" className="text-xs">
                                  {allUsers.find(u => u.id === mapping.user_id)?.email ?? `User #${mapping.user_id}`}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Added {new Date(mapping.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => handleRemoveUser(role.id, mapping.user_id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
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
    </div>
  )
}
