"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Activity } from 'lucide-react'
import { 
  createAddressActivity, 
  listAddressActivities, 
  deleteAddressActivity,
  toggleAddressActivity 
} from '@/hooks/web3/address-activity-service'
import { listNotificationGroups } from '@/hooks/notification-group-service'
import { AddressActivity, CreateAddressActivityRequest } from '@/types/address-activity'
import { NotificationGroup } from '@/types/notification-group'
import { AddressActivityFormDialog } from '@/components/web3/address-activity/address-activity-form-dialog'
import { AddressActivityTable } from '@/components/web3/address-activity/address-activity-table'
import { ProtectedRoute } from "@/components/protected-route"
import { AccessDenied } from "@/components/access-denied"
import { DashboardNavbar } from '@/components/web3/explorer/dashboard-navbar'
import { AddressGroup } from '@/types/address-group'
import { listAddressGroups } from '@/hooks/web3/address-group-service'
import { AddressWatcherInfo } from '@/components/web3/address-activity/address-activity-info'
import { useSearchParams } from 'next/navigation'
import { useSpace } from '@/contexts/space-context'

export default function AddressActivityPage() {
    const [activities, setActivities] = useState<AddressActivity[]>([])
    const [groups, setGroups] = useState<NotificationGroup[]>([])
    const [addressGroups, setAddressGroups] = useState<AddressGroup[]>([]); // Adjust type as needed
    const [isLoadingActivities, setIsLoadingActivities] = useState(true)
    const [isLoadingGroups, setIsLoadingGroups] = useState(false)
    const [isLoadingAddressGroups, setIsLoadingAddressGroups] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [accessDenied, setAccessDenied] = useState(false)
    const searchParams = useSearchParams()
    const { selectedGroupId } = useSpace()
    const [initialData, setInitialData] = useState<{
        name?: string
        address_group_ids?: number[]
        notification_group_ids?: number[]
        notification_subscriber_ids?: number[]
        channel_ids?: string[]
    }>({})
    // Fetch activities on mount
    useEffect(() => {
        fetchActivities()
        fetchAddressGroups();
        fetchGroups()
        handleParams()
    }, [])

    useEffect(() => {
        fetchActivities()
        fetchAddressGroups()
    }, [selectedGroupId])

    const fetchActivities = async () => {
        setIsLoadingActivities(true)
        await listAddressActivities({
            successTask: (response) => {
                console.log('Activities Response:', response)
                if (response.data && Array.isArray(response.data)) {
                    setActivities(response.data)
                }
                setIsLoadingActivities(false)
            },
            failureTask: () => {
                toast.error('Failed to load address activities', {
                    description: 'Could not fetch address activity watchers. Please try again.',
                })
                setIsLoadingActivities(false)
            },
            errorTask: () => {
                toast.error('An error occurred', {
                    description: 'Please check your connection and try again.',
                })
                setIsLoadingActivities(false)
            },
            forbiddenTask: () => {
                setAccessDenied(true)
                setIsLoadingActivities(false)
            },
            groupId: selectedGroupId,
        })
    }

    const handleParams = () => {
        const query = Object.fromEntries(searchParams.entries());
        let { openActivity } = query;
        let initialData = {
            name: query.name || '',
            address_group_ids: query.addressGroupIds ? query.addressGroupIds.split(',').map((id) => Number(id)) : [],
            notification_group_ids: query.groupIds ? query.groupIds.split(',').map((id) => Number(id)) : [],
            notification_subscriber_ids: query.subscriberIds ? query.subscriberIds.split(',').map((id) => Number(id)) : [],
            channel_ids: query.channelIds ? query.channelIds.split(',') : []
        };
        setInitialData(initialData)
        if (openActivity) {
            setDialogOpen(true)
            window.history.replaceState({}, '', '/web3/address-activity');
        }
    }

    const fetchGroups = async () => {
        setIsLoadingGroups(true)
        await listNotificationGroups({
            groupId: selectedGroupId,
            successTask: (response) => {
                if (response.data && response.data) {
                    setGroups(response.data)
                }
                setIsLoadingGroups(false)
            },
            failureTask: () => {
                toast.error('Failed to load groups')
                setIsLoadingGroups(false)
            },
            errorTask: () => {
                toast.error('Error loading groups')
                setIsLoadingGroups(false)
            },
            forbiddenTask: () => {
                setAccessDenied(true)
                setIsLoadingGroups(false)
            },
        })
    }

    const fetchAddressGroups = async () => {
        setIsLoadingAddressGroups(true)
        await listAddressGroups({
            successTask: (response) => {
                if (response.data && Array.isArray(response.data)) {
                    setAddressGroups(response.data)
                }
                setIsLoadingAddressGroups(false)
            },
            failureTask: () => {
                toast.error('Failed to load address groups')
                setIsLoadingAddressGroups(false)
            },
            errorTask: () => {
                toast.error('Error loading address groups')
                setIsLoadingAddressGroups(false)
            },
            forbiddenTask: () => {
                setAccessDenied(true)
                setIsLoadingAddressGroups(false)
            },
            groupId: selectedGroupId,
        })
    }

    const handleCreateClick = () => {
        // Load groups and subscribers when dialog opens
        // fetchGroups()
        // fetchSubscribers()
        setDialogOpen(true)
    }

    const handleFormSubmit = async (formData: CreateAddressActivityRequest) => {
        setIsSubmitting(true)

        const request = selectedGroupId
            ? { ...formData, group_id: selectedGroupId }
            : formData

        await createAddressActivity({
            request,
            successTask: (data) => {
                toast.success('Address activity watcher created!', {
                    description: `Now monitoring this address group ${formData.address_group_ids}`,
                })
                setDialogOpen(false)
                setIsSubmitting(false)
                fetchActivities() // Refresh the list
            },
            failureTask: () => {
                toast.error('Failed to create watcher', {
                    description: 'Please try again.',
                })
                setIsSubmitting(false)
            },
            errorTask: () => {
                toast.error('An error occurred', {
                    description: 'Please check your connection and try again.',
                })
                setIsSubmitting(false)
            },
            forbiddenTask: () => {
                toast.error("Access denied")
                setIsSubmitting(false)
            },
        })
    }

    const handleDialogOpenChange = useCallback((next: boolean) => {
        if (dialogOpen !== next) {
            setDialogOpen(next)
        }
    }, [dialogOpen])

    if (accessDenied) {
        return (
            <ProtectedRoute>
                <DashboardNavbar />
                <AccessDenied />
            </ProtectedRoute>
        )
    }

  return (
        <ProtectedRoute>
            <DashboardNavbar />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 px-2 py-2 md:gap-6 md:py-4 md:px-4">
                        <Card className="shadow-lg">
                          <CardHeader>
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <div className="p-2 bg-primary/10 rounded-lg">
                                          <Activity className="w-6 h-6 text-primary" />
                                      </div>
                                      <div className="flex items-center gap-3">
                                          <CardTitle className="text-sm sm:text-2xl">Address Activity Watchers</CardTitle>
                                          <AddressWatcherInfo />
                                      </div>
                                  </div>
                                  <Button onClick={handleCreateClick} size="lg" className="cursor-pointer">
                                      <Plus className="w-4 h-4 mr-2" />
                                      Create Watcher
                                  </Button>
                              </div>
                          </CardHeader>
                            <CardContent>
                                <AddressActivityTable
                                    activities={activities}
                                    addressGroups={addressGroups}
                                    groups={groups}
                                    isLoading={isLoadingActivities}
                                    loadingAddressGroups={isLoadingAddressGroups}
                                />

                            </CardContent>
                        </Card>

                        {/* Create Dialog */}
                        <AddressActivityFormDialog
                            open={dialogOpen}
                            onOpenChange={handleDialogOpenChange}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                            groups={groups}
                            initialData={initialData}
                            addressGroups={addressGroups}
                            loadingGroups={isLoadingGroups}
                            loadingAddressGroups={isLoadingAddressGroups}
                        />
        </div>
      </div>
    </div>
        </ProtectedRoute>
  )
}
