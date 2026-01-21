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
import { DashboardNavbar } from '@/components/web3/explorer/dashboard-navbar'
import { AddressGroup } from '@/types/address-group'
import { listAddressGroups } from '@/hooks/web3/address-group-service'
import { AddressAirdropWatcherInfo } from '@/components/web3/address-airdrop-activity/address-activity-airdrop-info'

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

    // Fetch activities on mount
    useEffect(() => {
        fetchActivities()
        fetchAddressGroups();
        fetchGroups()
        fetchSubscribers()
    }, [])

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
        })
    }

    const fetchGroups = async () => {
        setIsLoadingGroups(true)
        await listTopics({
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

        await createAddressActivityAirdrop({
            request: formData,
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
        })
    }

    const handleDeleteActivity = async (id: number) => {
        await deleteAddressActivityAirdrop({
            id,
            successTask: () => {
                toast.success('Watcher deleted successfully!', {
                    description: 'The address activity airdrop watcher has been removed.',
                })
                fetchActivities() // Refresh the list
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

    const handleToggleActivity = async (id: number, active: boolean) => {
        await toggleAddressActivityAirdrop({
            id,
            active,
            successTask: () => {
                toast.success(`Watcher ${active ? 'activated' : 'paused'} successfully!`, {
                    description: `The watcher is now ${active ? 'active' : 'paused'}.`,
                })
                fetchActivities() // Refresh the list
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

    const handleDialogOpenChange = useCallback((next: boolean) => {
        if (dialogOpen !== next) {
            setDialogOpen(next)
        }
    }, [dialogOpen])

    const activeWatcherCount = useMemo(
        () => activities.filter(a => a.active).length,
        [activities]
    )


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
                                    onDelete={handleDeleteActivity}
                                    onToggle={handleToggleActivity}
                                />

                                {!isLoadingActivities && activeWatcherCount > 0 && (
                                    <div className="mt-4 text-sm text-muted-foreground text-center">
                                        {activeWatcherCount} {activeWatcherCount === 1 ? 'watcher' : 'watchers'} active
          </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Create Dialog */}
                        <AddressActivityAirdropFormDialog
                            open={dialogOpen}
                            onOpenChange={handleDialogOpenChange}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                            groups={groups}
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
