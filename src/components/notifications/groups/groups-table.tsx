"use client"

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Pencil, Trash2, Copy, Calendar, Tag, Key, Clock, UserCircle2Icon, Webhook } from 'lucide-react'
import { NotificationGroup } from '@/types/notification-group'
import { formatDate } from '@/utils/formatting'
import { useAuth } from '@/contexts'
import { useSpace } from '@/contexts/space-context'
import { NotificationChannelInstance } from '@/types/notification-channel-instance'

interface GroupsTableProps {
  groups: NotificationGroup[]
  channelInstances: NotificationChannelInstance[]
  isLoading: boolean
  onEdit: (group: NotificationGroup) => void
  onDelete: (id: number) => void
  onCopyKey: (topicKey: string) => void
}

export function GroupsTable({
  groups,
  isLoading,
  channelInstances,
  onEdit,
  onDelete,
  onCopyKey,
}: GroupsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<NotificationGroup | null>(null)
  const { userInfo } = useAuth()
  const { selectedGroupId } = useSpace()

  // A group may be edited/deleted by its owner, or — when a space is active — by
  // any member of that space (the list is already scoped to the selected space,
  // so every visible row belongs to a space the user is a member of). Mirrors the
  // notification-engine authorizeMutation rule.
  const canModify = (group: NotificationGroup) =>
    group.user_id === userInfo?.email || selectedGroupId != null

  const handleDeleteClick = (group: NotificationGroup) => {
    setSelectedGroup(group)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedGroup) {
      onDelete(selectedGroup.id)
    }
    setDeleteDialogOpen(false)
    setSelectedGroup(null)
  }

  const getChannelInstances = (groupIds: number[]) => {
    if (!groupIds || groupIds.length === 0) return [];
    return channelInstances.filter(g => groupIds.includes(g.id));
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    try {
      // Treat naive timestamps as UTC, but leave an existing tz designator
      // (trailing 'Z' or a numeric offset like "+05:30") untouched.
      const isoDate = /(Z|[+-]\d{2}:?\d{2})$/.test(dateString) ? dateString : `${dateString}Z`
      const date = new Date(isoDate)
      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()

      // Handle future dates or invalid dates
      if (diffInMs < 0 || isNaN(diffInMs)) {
        return 'Just now'
      }

      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

      if (diffInMinutes < 1) {
        return 'Just now'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
      } else {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
      }
    } catch {
      return ''
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No notification groups found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first group to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border relative flex flex-col">
        <div className="overflow-x-auto flex-1">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead className="px-4 py-2 text-left w-1/4 min-w-max">
                  <div className="flex items-center gap-1">
                    <UserCircle2Icon className="w-4 h-4" />
                    <span>Groups</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-left w-2/5 min-w-max">
                  <div className="flex items-center gap-1">
                    <Webhook className="w-4 h-4" />
                    <span>Channel Instances</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-left min-w-max">
                  <div className="flex items-center gap-1">
                    <UserCircle2Icon className="w-4 h-4" />
                    <span>Created By</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-left min-w-max">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-left min-w-max">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Updated</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-right w-20 min-w-max">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {groups.map((group) => (
                <TableRow key={group.id} className="hover:bg-muted/50">
                  <TableCell className="px-4 py-3 w-1/4 min-w-max">
                    <div className="font-medium truncate">{group.name}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3 w-2/5 min-w-max">
                    <div className="flex flex-wrap gap-1">
                    {(() => {
                      const groups = getChannelInstances(group.channel_instance_ids);

                      return groups.length > 0 ? (
                        <>
                          {groups.slice(0, 3).map((group, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                              title={`${group.name}`}
                            >
                              {group.name}
                            </Badge>
                          ))}

                          {groups.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{groups.length - 3} more
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No groups
                        </span>
                      );
                    })()}
                  </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 min-w-max text-sm text-muted-foreground truncate max-w-[180px]" title={group.user_id || ''}>
                    {group.user_id || 'N/A'}
                  </TableCell>
                  <TableCell className="px-4 py-3 min-w-max text-sm">
                    {formatDate(group.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3 min-w-max text-sm text-muted-foreground">
                    {formatTime(group.updated_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3 w-20 min-w-max text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(group)} className="cursor-pointer" disabled={!canModify(group)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(group)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                          disabled={!canModify(group)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group &quot;{selectedGroup?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="cursor-pointer bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
