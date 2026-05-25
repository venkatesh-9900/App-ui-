"use client"

import React, { useState, useEffect, useCallback } from "react"
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
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/common/data-table"
import { Pagination } from "@/components/common/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/utils/formatting"
import {
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from "@/hooks/iam/iam-service"
import { Group } from "@/types/iam"
import { AccessDenied } from "@/components/access-denied"
import { useSpace } from "@/contexts/space-context"
import { useAuth } from "@/contexts/auth-context"

export function GroupManagementTab() {
  const { refreshGroups, selectedSpace, setSelectedSpace } = useSpace()
  const { isRootUser, isSuperAdmin } = useAuth()
  const canCreateGroup = isRootUser || isSuperAdmin
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [groupForm, setGroupForm] = useState({ name: "", adminEmail: "" })

  const loadGroups = useCallback(() => {
    setIsLoading(true)
    fetchGroups({
      page,
      limit: pageSize,
      successTask: (data: { data: Group[]; totalCount: number }) => {
        setGroups(data.data ?? [])
        setTotalCount(data.totalCount ?? 0)
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
  }, [page, pageSize])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const openCreateGroupDialog = () => {
    setCurrentGroup(null)
    setGroupForm({ name: "", adminEmail: "" })
    setIsGroupDialogOpen(true)
  }

  const openEditGroupDialog = (group: Group) => {
    setCurrentGroup(group)
    setGroupForm({ name: group.name || "", adminEmail: group.admin_email || "" })
    setIsGroupDialogOpen(true)
  }

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    createGroup({
      request: { name: groupForm.name, admin_email: groupForm.adminEmail },
      successTask: () => {
        toast.success("Group created successfully")
        setIsGroupDialogOpen(false)
        setIsSubmitting(false)
        loadGroups()
        refreshGroups()
      },
      failureTask: () => {
        toast.error("Failed to create group")
        setIsSubmitting(false)
      },
      errorTask: () => {
        toast.error("An error occurred while creating group")
        setIsSubmitting(false)
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setIsSubmitting(false)
      },
    })
  }

  const handleUpdateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentGroup) return
    setIsSubmitting(true)
    updateGroup({
      id: currentGroup.id,
      request: { name: groupForm.name, admin_email: groupForm.adminEmail },
      successTask: () => {
        toast.success("Group updated successfully")
        setIsGroupDialogOpen(false)
        setIsSubmitting(false)
        loadGroups()
      },
      failureTask: () => {
        toast.error("Failed to update group")
        setIsSubmitting(false)
      },
      errorTask: () => {
        toast.error("An error occurred while updating group")
        setIsSubmitting(false)
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setIsSubmitting(false)
      },
    })
  }

  const handleDeleteGroup = (id: number) => {
    deleteGroup({
      id,
      successTask: () => {
        toast.success("Group deleted successfully")
        if (selectedSpace?.id === id) setSelectedSpace(null)
        loadGroups()
        refreshGroups()
      },
      failureTask: () => toast.error("Failed to delete group"),
      errorTask: () => toast.error("An error occurred while deleting group"),
      forbiddenTask: () => toast.error("Access denied"),
    })
  }

  const columns: ColumnDef<Group>[] = [
    {
      accessorKey: "name",
      header: () => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
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
      accessorKey: "admin_email",
      header: "Admin Email",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("admin_email")}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground/80 whitespace-nowrap">
          {formatDate(row.getValue("created_at"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-left">Actions</div>,
      cell: ({ row }) => {
        const group = row.original
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
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openEditGroupDialog(group)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => handleDeleteGroup(group.id)}
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

  if (accessDenied) return <AccessDenied />

  return (
    <div className="space-y-4 mt-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-2xl">Groups</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Manage groups and their structure.</p>
              </div>
            </div>
            {canCreateGroup && (
              <Button onClick={openCreateGroupDialog} size="lg" className="w-fit">
                <Plus className="w-4 h-4 mr-2" /> Create Group
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border relative flex flex-col">
            <div className="overflow-x-auto flex-1">
              <DataTable
                columns={columns}
                data={groups}
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

      {/* Create / Edit Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <form onSubmit={currentGroup ? handleUpdateGroup : handleCreateGroup}>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl">
                {currentGroup ? "Edit Group" : "Create Group"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {currentGroup
                  ? "Update the details of the group."
                  : "Create a new group to organize users and roles."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-2">
              <div className="grid gap-2">
                <Label htmlFor="group-name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="group-name"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g. Engineering"
                  className="bg-background"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="group-admin-email" className="text-sm font-medium">
                  Admin Email
                </Label>
                <Input
                  id="group-admin-email"
                  type="email"
                  value={groupForm.adminEmail}
                  onChange={(e) => setGroupForm({ ...groupForm, adminEmail: e.target.value })}
                  placeholder="admin@example.com"
                  className="bg-background"
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setIsGroupDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? "Saving..." : currentGroup ? "Save Changes" : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
