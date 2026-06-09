"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Activity } from 'lucide-react'
import { 
  createAddressActivityAirdrop, 
  listAddressAirdropActivities, 
  deleteAddressActivityAirdrop,
  toggleAddressActivityAirdrop 
} from '@/hooks/web3/address-activity-airdrop-service'
import { listTopics } from '@/hooks/topic-service'
import { getActiveHumanSubscribers } from '@/hooks/subscriber-service'
import { AddressActivityAirdrop, CreateAddressActivityAirdropRequest } from '@/types/address-activity-airdrop'
import { NotificationGroup } from '@/types/topic'
import { NotificationSubscriber } from '@/types/subscriber'
import { AddressActivityAirdropFormDialog } from '@/components/web3/address-airdrop-activity/address-activity-airdrop-form-dialog'
import { AddressActivityAirdropTable } from '@/components/web3/address-airdrop-activity/address-activity-airdrop-table'
import { ProtectedRoute } from "@/components/protected-route"
import { AccessDenied } from "@/components/access-denied"
import { DashboardNavbar } from '@/components/web3/explorer/dashboard-navbar'
import { AddressGroup } from '@/types/address-group'
import { listAddressGroups } from '@/hooks/web3/address-group-service'
import { AddressAirdropWatcherInfo } from '@/components/web3/address-airdrop-activity/address-activity-airdrop-info'
import { useSearchParams } from 'next/navigation'
import { useSpace } from '@/contexts/space-context'

export default function AddressActivityAirdropPage() {
    const [activities, setActivities] = useState<AddressActivityAirdrop[]>([])
    const [groups, setGroups] = useState<NotificationGroup[]>([])
    const [subscribers, setSubscribers] = useState<NotificationSubscriber[]>([])
    const [addressGroups, setAddressGroups] = useState<AddressGroup[]>([]); // Adjust type as needed
    const [isLoadingActivities, setIsLoadingActivities] = useState(true)
    const [isLoadingGroups, setIsLoadingGroups] = useState(false)
    const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false)
    const [isLoadingAddressGroups, setIsLoadingAddressGroups] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [accessDenied, setAccessDenied] = useState(false)
    const searchParams = useSearchParams();
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
        fetchSubscribers()
        handleParams();
    }, [])

    useEffect(() => {
        fetchActivities()
        fetchAddressGroups()
    }, [selectedGroupId])

    const fetchActivities = async () => {
        setIsLoadingActivities(true)
        await listAddressAirdropActivities({
            successTask: (response) => {
                if (response.data && Array.isArray(response.data)) {
                    setActivities(response.data)
                }
                setIsLoadingActivities(false)
            },
            failureTask: () => {
                toast.error('Failed to load address activities', {
                    description: 'Could not fetch address activity airdrop watchers. Please try again.',
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

    const fetchGroups = async () => {
        setIsLoadingGroups(true)
        await listTopics({
            groupId: selectedGroupId,
            successTask: (response) => {
                if (response.data && Array.isArray(response.data)) {
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

    const fetchSubscribers = async () => {
        setIsLoadingSubscribers(true)
        await getActiveHumanSubscribers({
            successTask: (response) => {
                if (response.data && Array.isArray(response.data)) {
                    setSubscribers(response.data)
                }
                setIsLoadingSubscribers(false)
            },
            failureTask: () => {
                toast.error('Failed to load subscribers')
                setIsLoadingSubscribers(false)
            },
            errorTask: () => {
                toast.error('Error loading subscribers')
                setIsLoadingSubscribers(false)
            },
            forbiddenTask: () => {
                setAccessDenied(true)
                setIsLoadingSubscribers(false)
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

    const handleFormSubmit = async (formData: CreateAddressActivityAirdropRequest) => {
        setIsSubmitting(true)

        const request = selectedGroupId
            ? { ...formData, iam_group_id: selectedGroupId }
            : formData

        await createAddressActivityAirdrop({
            request,
            successTask: (data) => {
                toast.success('Address activity airdrop watcher created!', {
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
            window.history.replaceState({}, '', '/web3/address-activity-airdrop');
        }
    }

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
                                          <CardTitle className="text-sm sm:text-2xl">Address Airdrop Activity Watchers</CardTitle>
                                          <AddressAirdropWatcherInfo />
                                      </div>
                                  </div>
                                  <Button onClick={handleCreateClick} size="lg" className="cursor-pointer">
                                      <Plus className="w-4 h-4 mr-2" />
                                      Create Watcher
                                  </Button>
                              </div>
                          </CardHeader>
                            <CardContent>
                                <AddressActivityAirdropTable
                                    activities={activities}
                                    addressGroups={addressGroups}
                                    groups={groups}
                                    subscribers={subscribers}
                                    isLoading={isLoadingActivities}
                                    loadingAddressGroups={isLoadingAddressGroups}
                                />

                            </CardContent>
                        </Card>

                        {/* Create Dialog */}
                        <AddressActivityAirdropFormDialog
                            open={dialogOpen}
                            onOpenChange={handleDialogOpenChange}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                            groups={groups}
                          initialData={initialData}
                            addressGroups={addressGroups}
                            subscribers={subscribers}
                            loadingGroups={isLoadingGroups}
                            loadingAddressGroups={isLoadingAddressGroups}
                            loadingSubscribers={isLoadingSubscribers}
                        />
        </div>
      </div>
    </div>
        </ProtectedRoute>
  )
}
