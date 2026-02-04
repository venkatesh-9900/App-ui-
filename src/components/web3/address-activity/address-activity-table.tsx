"use client"

import React, { useEffect, useState } from 'react'
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
import { MoreHorizontal, Trash2, Calendar, Clock, Activity, Hash, Play, Pause, Group, Edit2, Users } from 'lucide-react'
import { AddressActivity, CreateAddressActivityRequest, UpdateAddressActivityRequest } from '@/types/address-activity'
import { format } from 'date-fns'
import { truncateText } from '@/utils/formatting'
import { AddressGroup } from '@/types/address-group'
import { useAuth } from '@/contexts'
import { NotificationSubscriber } from '@/types/subscriber'
import { NotificationGroup } from '@/types/topic'
import { AddressActivityFormDialog } from './address-activity-form-dialog'
import { deleteAddressActivity, toggleAddressActivity, updateAddressActivity } from '@/hooks/web3/address-activity-service'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
interface AddressActivityTableProps {
  activities: AddressActivity[]
  addressGroups: AddressGroup[]
  groups: NotificationGroup[]
  subscribers: NotificationSubscriber[]
  isLoading: boolean
  loadingAddressGroups: boolean
}

export function AddressActivityTable({
  activities,
  addressGroups,
  isLoading,
  loadingAddressGroups,
  groups,
  subscribers,
}: AddressActivityTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<AddressActivity | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [filteredActivities, setFilteredActivities] = useState<AddressActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean[]>([true, false]);
  const [statusCount, setStatusCount] = useState<{ active: number; inactive: number }>({
    active: 0,
    inactive: 0
  });
  const [localActivities, setLocalActivities] = useState<AddressActivity[]>([]);
  const { userInfo } = useAuth()

  useEffect(() => {
    setLocalActivities(activities);
    calculateStatusCount(activities);
  }, [activities]);

  useEffect(() => {
    const filtered = localActivities.filter(activity =>
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) && statusFilter.includes(activity.active as boolean)
    );
    setFilteredActivities(filtered);
  }, [searchQuery, statusFilter, localActivities]);

  const toggleStatusFilter = (status: boolean) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  }

  const calculateStatusCount = (activities: AddressActivity[]) => {
    const activeCount = activities.filter(activity => activity.active).length;
    setStatusCount({ active: activeCount, inactive: activities.length - activeCount });
  }

  const handleDeleteClick = (activity: AddressActivity) => {
    setSelectedActivity(activity)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedActivity) {
      handleDeleteActivity(selectedActivity.id)
    }
    setDeleteDialogOpen(false)
    setSelectedActivity(null)
  }

  const handleToggleClick = async (activity: AddressActivity) => {
    // Get current status, default to true if null/undefined
    const currentStatus = activity.active !== undefined && activity.active !== null ? activity.active : true
    const newStatus = !currentStatus
    setTogglingId(activity.id)
    handleToggleActivity(activity.id, newStatus)
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

  const handleToggleActivity = async (id: number, active: boolean) => {
    await toggleAddressActivity({
      id,
      active,
      successTask: () => {
        toast.success(`Watcher ${active ? 'activated' : 'paused'} successfully!`, {
          description: `The watcher is now ${active ? 'active' : 'paused'}.`,
        })
        const updatedActivities = localActivities.map((a) =>
          a.id === id ? { ...a, active } : a
        );
        setLocalActivities(updatedActivities);
        calculateStatusCount(updatedActivities);
      },
      failureTask: () => {
        toast.error('Failed to toggle watcher', {
          description: 'Please try again.',
        })
      },
      errorTask: () => {
        toast.error('An error occurred', {
          description: 'Please check your connection and try again.',
        })
      },
    })
  }

  const handleDeleteActivity = async (id: number) => {
    await deleteAddressActivity({
      id,
      successTask: () => {
        toast.success('Watcher deleted successfully!', {
          description: 'The address activity watcher has been removed.',
        })
        const updatedActivities = localActivities.filter((activity) => activity.id !== id);
        setLocalActivities(updatedActivities);
        calculateStatusCount(updatedActivities);
      },
      failureTask: () => {
        toast.error('Failed to delete watcher', {
          description: 'Please try again.',
        })
      },
      errorTask: () => {
        toast.error('An error occurred', {
          description: 'Please check your connection and try again.',
        })
      },
    })
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

  const getNotificationGroupsByIds = (groupIds: number[]) => {
    if (!groupIds || groupIds.length === 0) return [];
    return groups.filter(g => groupIds.includes(g.id));
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
      <div className="flex items-center gap-2">
        <div className="searchbar w-1/3">
          <Input
            placeholder="Search address activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='status-filter flex gap-2'>
          <Badge onClick={() => toggleStatusFilter(true)} className='cursor-pointer' variant={statusFilter.includes(true) ? 'default' : 'outline'}>Active <span className='ml-1'>({statusCount.active})</span></Badge>
          <Badge onClick={() => toggleStatusFilter(false)} className='cursor-pointer' variant={statusFilter.includes(false) ? 'default' : 'outline'}>Inactive <span className='ml-1'>({statusCount.inactive})</span></Badge>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border relative flex flex-col">
        {
          !filteredActivities.length
            ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No matching address activity watchers found.</p>
              </div>
            )
            :
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
                    {/* <TableHead className="px-4 py-2 text-left w-2/5 min-w-max">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Notification Groups</span>
                      </div>
                    </TableHead> */}
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
                  {filteredActivities.map((activity) => {
                    const addresses = getAddresses(activity)
                    return (
                      <TableRow key={activity.id} className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          setMode('view');
                          setSelectedActivity(activity);
                          setDialogOpen(true);
                        }}
                      >
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
                                      title={`${group.name}: ${group.addresses.length} addresses`}
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
                        {/* <TableCell className="px-4 py-3 w-2/5 min-w-max">
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              const groups = getNotificationGroupsByIds(activity.web3_address_group_ids);
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
                        </TableCell> */}
                        <TableCell className="px-4 py-3 w-1/6 min-w-max">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                            disabled={togglingId === activity.id}
                              type="button"
                              role="switch"
                              aria-checked={activity.active}
                              onClick={() => handleToggleClick(activity)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full
                            transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer
                            ${activity.active ? "bg-green-500" : "bg-gray-400"}`}>
                              <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform
                              ${activity.active ? "translate-x-5" : ""}`} />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 w-1/6 min-w-max text-sm">
                          {formatDate(activity.created_at)}
                        </TableCell>
                        <TableCell className="px-4 py-3 w-1/6 min-w-max text-sm text-muted-foreground">
                          {formatTime(activity.updated_at)}
                        </TableCell>
                        <TableCell className="px-4 py-3 w-20 min-w-max text-right" onClick={(e) => e.stopPropagation()}>
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
                                onClick={() => {
                                  setMode('edit');
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
        }
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
        mode={mode}
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

