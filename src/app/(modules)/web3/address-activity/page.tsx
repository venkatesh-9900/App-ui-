"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Activity, ChevronDown } from 'lucide-react'
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
import { motion } from 'motion/react'
import { cn } from "@/lib/utils"

function Accordion({ title, meta, children, open, onOpenChange }: { title: string; meta?: string; children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border-2 border-border bg-card shadow-sm">
      <button
        onClick={() => onOpenChange(!open)}
        className={cn("flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted", open && "bg-muted border-b-2 border-border")}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className={cn("h-2 w-2 rounded-full shrink-0", open ? "bg-primary" : "bg-muted-foreground")} />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">{title}</p>
            {meta && <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>}
          </div>
        </div>
        <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors shrink-0", open ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground")}>
          {open ? "Collapse" : "Expand"}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
        <div className="px-5 pb-5 pt-4">{children}</div>
      </motion.div>
    </div>
  )
}

export default function AddressActivityPage() {
    const [activities, setActivities] = useState<AddressActivity[]>([])
    const [groups, setGroups] = useState<NotificationGroup[]>([])
    const [addressGroups, setAddressGroups] = useState<AddressGroup[]>([])
    const [isLoadingActivities, setIsLoadingActivities] = useState(true)
    const [isLoadingGroups, setIsLoadingGroups] = useState(false)
    const [isLoadingAddressGroups, setIsLoadingAddressGroups] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [accessDenied, setAccessDenied] = useState(false)
    const [activePanel, setActivePanel] = useState<"how" | "configure" | null>("how")
    const [simulationStarted, setSimulationStarted] = useState(true)
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
            ? { ...formData, iam_group_id: selectedGroupId }
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
            <div className="flex flex-col px-6 py-6 gap-3 max-w-6xl mx-auto w-full">

              <Accordion
                title="How it works"
                meta="3 steps · set up in minutes"
                open={activePanel === "how"}
                onOpenChange={(o) => setActivePanel(o ? "how" : null)}
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">1</div>
                      <div>
                        <p className="font-semibold text-sm">Select Wallets to Monitor</p>
                        <p className="text-xs text-muted-foreground">Choose one or more wallet groups you want to monitor for activity.</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted p-3 ml-11">
                      <p className="text-xs font-medium text-foreground">Example: Suspicious Accounts Group</p>
                      <p className="text-xs text-muted-foreground mt-1">Contains 3 wallet addresses: 0x742d35Cc..., 0x8a0e1d7a..., 0x5f3e2b1c...</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">2</div>
                      <div>
                        <p className="font-semibold text-sm">Set Notification Recipients</p>
                        <p className="text-xs text-muted-foreground">Choose who receives alerts when wallet activity is detected.</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted p-3 ml-11">
                      <p className="text-xs font-medium text-foreground">Example: Compliance Team</p>
                      <p className="text-xs text-muted-foreground mt-1">Members: alice@company.com, bob@company.com</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">3</div>
                      <div>
                        <p className="font-semibold text-sm">Review & Activate</p>
                        <p className="text-xs text-muted-foreground">Confirm your settings and start receiving real-time alerts.</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted p-3 ml-11 space-y-2">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-foreground">Sample Alert Email:</p>
                        <div className="border border-border rounded p-2 bg-card text-xs space-y-1">
                          <p className="font-medium text-foreground">📬 Wallet Activity Detected</p>
                          <p className="text-muted-foreground">50 ETH transferred from 0x742d35Cc... to exchange</p>
                          <p className="text-muted-foreground">2024-01-15 14:32 UTC • Risk: Medium</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Accordion>

              <Accordion
                title="Configure wallets"
                open={activePanel === "configure"}
                onOpenChange={(o) => setActivePanel(o ? "configure" : null)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-sm">Wallet Monitoring</p>
                        <AddressWatcherInfo />
                      </div>
                    </div>
                    <Button onClick={handleCreateClick} size="sm" className="cursor-pointer">
                      <Plus className="w-4 h-4 mr-2" />
                      Configure Wallets
                    </Button>
                  </div>
                  <AddressActivityTable
                    activities={activities}
                    addressGroups={addressGroups}
                    groups={groups}
                    isLoading={isLoadingActivities}
                    loadingAddressGroups={isLoadingAddressGroups}
                  />
                </div>
              </Accordion>

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
        </ProtectedRoute>
  )
}
