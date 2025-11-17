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
import { MoreHorizontal, Pencil, Trash2, Copy, Calendar, Tag, Key, Clock, UserCircle2Icon } from 'lucide-react'
import { NotificationGroup } from '@/types/topic'
import { format } from 'date-fns'

interface GroupsTableProps {
  groups: NotificationGroup[]
  isLoading: boolean
  onEdit: (group: NotificationGroup) => void
  onDelete: (topicKey: string) => void
  onCopyKey: (topicKey: string) => void
}

export function GroupsTable({
  groups,
  isLoading,
  onEdit,
  onDelete,
  onCopyKey,
}: GroupsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<NotificationGroup | null>(null)

  const handleDeleteClick = (group: NotificationGroup) => {
    setSelectedGroup(group)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedGroup) {
      onDelete(selectedGroup.novu_topic_key)
    }
    setDeleteDialogOpen(false)
    setSelectedGroup(null)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch {
      return 'N/A'
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    try {
      // Handle UTC timestamps by appending 'Z' if not present
      const isoDate = dateString.endsWith('Z') ? dateString : `${dateString}Z`
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
                    <Key className="w-4 h-4" />
                    <span>Key</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
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
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className="font-mono text-xs truncate"
                      >
                        {group.novu_topic_key}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 shrink-0 cursor-pointer"
                        onClick={() => onCopyKey(group.novu_topic_key)}
                        title="Copy key"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 w-1/6 min-w-max text-sm">
                    {formatDate(group.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3 w-1/6 min-w-max text-sm text-muted-foreground">
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
                        <DropdownMenuItem onClick={() => onCopyKey(group.novu_topic_key)} className="cursor-pointer">
                          <Copy className="mr-2 h-4 w-4" />
                          Copy key
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(group)} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(group)}
                          className="text-destructive focus:text-destructive cursor-pointer"
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
