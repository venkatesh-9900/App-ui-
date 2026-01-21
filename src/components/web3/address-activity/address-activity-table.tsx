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
import { MoreHorizontal, Trash2, Calendar, Clock, Activity, Hash, Play, Pause, Group, Edit2 } from 'lucide-react'
import { AddressActivity, CreateAddressActivityRequest, UpdateAddressActivityRequest } from '@/types/address-activity'
import { format } from 'date-fns'
import { truncateText } from '@/utils/formatting'
import { AddressGroup } from '@/types/address-group'
import { useAuth } from '@/contexts'
import { NotificationSubscriber } from '@/types/subscriber'
import { NotificationGroup } from '@/types/topic'
import { AddressActivityFormDialog } from './address-activity-form-dialog'
import { updateAddressActivity } from '@/hooks/web3/address-activity-service'
import { toast } from 'sonner'
interface AddressActivityTableProps {
  activities: AddressActivity[]
  addressGroups: AddressGroup[]
  groups: NotificationGroup[]
  subscribers: NotificationSubscriber[]
  isLoading: boolean
  loadingAddressGroups: boolean
  onDelete: (id: number) => void
  onToggle: (id: number, isActive: boolean) => void
}

export function AddressActivityTable({
  activities,
  addressGroups,
  isLoading,
  loadingAddressGroups,
  groups,
  subscribers,
  onDelete,
  onToggle,
}: AddressActivityTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<AddressActivity | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false);
  const { userInfo } = useAuth()

  const handleDeleteClick = (activity: AddressActivity) => {
    setSelectedActivity(activity)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedActivity) {
      onDelete(selectedActivity.id)
    }
    setDeleteDialogOpen(false)
    setSelectedActivity(null)
  }

  const handleToggleClick = async (activity: AddressActivity) => {
    // Get current status, default to true if null/undefined
    const currentStatus = activity.active !== undefined && activity.active !== null ? activity.active : true
    const newStatus = !currentStatus
    setTogglingId(activity.id)
    onToggle(activity.id, newStatus)
    // Reset toggling state after a delay
    setTimeout(() => setTogglingId(null), 1000)
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
      const isoDate = dateString.endsWith('Z') ? dateString : `${dateString}Z`
      const date = new Date(isoDate)
      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      
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

  const getAddresses = (activity: AddressActivity): string[] => {
    try {
      if (activity.payload && typeof activity.payload === 'object') {
        if (Array.isArray(activity.payload.addresses)) {
          return activity.payload.addresses
        }
        // Try to parse if it's a JSON string
        if (typeof activity.payload === 'string') {
          const parsed = JSON.parse(activity.payload)
          return parsed.addresses || []
        }
      }
      return []
    } catch {
      return []
    }
  }

  async function handleUpdateActivity(id: number, formData: UpdateAddressActivityRequest) {
    setIsUpdating(true)
    const updatedActivity: AddressActivity = {
      id: id,
      name: formData.name || selectedActivity?.name || '',
      web3_address_group_ids: formData.address_group_ids,
      notification_group_ids: formData.notification_group_ids,
      notification_subscriber_ids: formData.notification_subscriber_ids,
      channel_ids: formData.channel_ids,
      organization_id: selectedActivity?.organization_id || '',
      payload: selectedActivity?.payload,
      notification_workflow_id: selectedActivity?.notification_workflow_id || '',
      active: selectedActivity?.active,
      trigger_id: selectedActivity?.trigger_id || '',
      type: selectedActivity?.type || '',
      user_id: selectedActivity?.user_id || '',
      created_at: selectedActivity?.created_at || '',
      updated_at: new Date().toISOString(),
    }
    setSelectedActivity(updatedActivity);
    await updateAddressActivity({
      id: id,
      request: formData,
      successTask: (data) => {
        toast.success('Updating address acitivity successful!', {
          description: `Updates to the address acitivity have been saved.`,
        })
        const index = activities.findIndex(g => g.id === id);
        if (index !== -1) {
          activities[index] = updatedActivity;
        }
        setDialogOpen(false)
        setIsUpdating(false)
      },
      failureTask: () => {
          toast.error('Failed to update address acitivity', {
            description: 'Please try again.',
          })
        setIsUpdating(false)
      },
      errorTask: () => {
        toast.error('An error occurred', {
          description: 'Please check your connection and try again.',
        })
        setIsUpdating(false)
      },
    })
  }

  const getGroupsByIds = (groupIds: number[]) => {
    if (!groupIds || groupIds.length === 0) return [];
    return addressGroups.filter(g => groupIds.includes(g.id));
  };


  if (isLoading || loadingAddressGroups) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No address activity watchers found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first watcher to monitor blockchain addresses.
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
              <TableHead className="px-4 py-2 text-left w-2/5 min-w-max">
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    <span>Name</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-left w-2/5 min-w-max">
                  <div className="flex items-center gap-1">
                    <Group className="w-4 h-4" />
                    <span>Address Groups</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                  <div className="flex items-center gap-1">
                    <span>Status</span>
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
            <TableBody>
              {activities.map((activity) => {
                const addresses = getAddresses(activity)
                return (
                  <TableRow key={activity.id} className="hover:bg-muted/50">
                    <TableCell className="px-4 py-3 w-2/5 min-w-max">
                      <div className="flex flex-wrap gap-1">
                        { activity.name }
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 w-2/5 min-w-max">
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const groups = getGroupsByIds(activity.web3_address_group_ids);

                          return groups.length > 0 ? (
                            <>
                              {groups.slice(0, 3).map((group, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                  title={group.name}
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
                    <TableCell className="px-4 py-3 w-1/6 min-w-max">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={(activity.active !== undefined && activity.active !== null ? activity.active : true) ? "default" : "secondary"} 
                          className={`text-xs ${(activity.active !== undefined && activity.active !== null ? activity.active : true) ? "bg-green-500 hover:bg-green-600" : ""}`}
                        >
                          {(activity.active !== undefined && activity.active !== null ? activity.active : true) ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 w-1/6 min-w-max text-sm">
                      {formatDate(activity.created_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3 w-1/6 min-w-max text-sm text-muted-foreground">
                      {formatTime(activity.updated_at)}
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
                          <DropdownMenuItem
                            onClick={() => handleToggleClick(activity)}
                            disabled={togglingId === activity.id || activity.user_id !== userInfo?.email}
                            className="cursor-pointer"
                          >
                            {(activity.active !== undefined && activity.active !== null ? activity.active : true) ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Watcher
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Activate Watcher
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedActivity(activity);
                              setDialogOpen(true);
                            }}
                            disabled={activity?.user_id !== userInfo?.email}
                            className="cursor-pointer"
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(activity)}
                            className="text-destructive focus:text-destructive cursor-pointer"
                            disabled={activity.user_id !== userInfo?.email}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
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
              This will permanently delete the address activity watcher (ID: {selectedActivity?.id}).
              This action cannot be undone and will stop monitoring the associated addresses.
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

      {selectedActivity &&( <AddressActivityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(data) => handleUpdateActivity(selectedActivity.id, data)}
        isSubmitting={isUpdating}
        mode="edit"
        initialData={{
          id: selectedActivity.id,
          name: selectedActivity.name,
          address_group_ids: selectedActivity.web3_address_group_ids,
          notification_group_ids: selectedActivity.notification_group_ids,
          notification_subscriber_ids: selectedActivity.notification_subscriber_ids,
          channel_ids: selectedActivity.channel_ids
        }}
        groups={groups}
        addressGroups={addressGroups}
        subscribers={subscribers}
        loadingGroups={false}
        loadingAddressGroups={false}
        loadingSubscribers={false}
      />
      )}
    </div>
  )
}

