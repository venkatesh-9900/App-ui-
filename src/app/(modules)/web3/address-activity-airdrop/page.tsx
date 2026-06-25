"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Activity, ChevronDown, CheckCircle2, Gift, Users, Send } from 'lucide-react'
import {
  createAddressActivityAirdrop,
  listAddressAirdropActivities,
  deleteAddressActivityAirdrop,
  toggleAddressActivityAirdrop
} from '@/hooks/web3/address-activity-airdrop-service'
import { listNotificationGroups } from '@/hooks/notification-group-service'
import { AddressActivityAirdrop, CreateAddressActivityAirdropRequest } from '@/types/address-activity-airdrop'
import { NotificationGroup } from '@/types/notification-group'
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
import { motion, AnimatePresence } from 'motion/react'
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

function AirdropSimulation({ started }: { started: boolean }) {
  const [step, setStep] = useState(-1)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!started) {
      setStep(-1)
      setDone(false)
      return
    }

    let cancelled = false
    const steps = [0, 1, 2, 3, 4, 5]
    let currentStep = 0

    const interval = setInterval(() => {
      if (cancelled) return
      if (currentStep <= steps.length) {
        setStep(currentStep)
        if (currentStep === steps.length) {
          setDone(true)
          clearInterval(interval)
        }
        currentStep++
      }
    }, 700)

    return () => { cancelled = true; clearInterval(interval) }
  }, [started])

  return (
    <div className="space-y-4">
      {/* Step 1: Airdrop Detection */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 0 ? 1 : 0, y: step >= 0 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-blue-50/50 border-blue-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
          <Gift className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 1</p>
          <p className="text-xs font-semibold text-foreground">Airdrop Detected</p>
        </div>
        {step >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 2: Address Matching */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-violet-50/50 border-violet-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center shrink-0">
          <Activity className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 2</p>
          <p className="text-xs font-semibold text-foreground">Matching Address Groups</p>
          {step >= 2 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ 3 addresses matched in Airdrop Eligible</p>}
        </div>
        {step >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 3: Eligibility Check */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-cyan-50/50 border-cyan-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-cyan-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 3</p>
          <p className="text-xs font-semibold text-foreground">Eligibility Verified</p>
          {step >= 3 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ All conditions met • Amount: 500 tokens</p>}
        </div>
        {step >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 4: Notification Group */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-amber-50/50 border-amber-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center shrink-0">
          <Users className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 4</p>
          <p className="text-xs font-semibold text-foreground">Notifying Recipients</p>
          {step >= 4 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ Finance Team (2 members)</p>}
        </div>
        {step >= 4 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 5: Alert Sent */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-emerald-50/50 border-emerald-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center shrink-0">
          <Send className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 5</p>
          <p className="text-xs font-semibold text-foreground">Alert Delivered</p>
          {step >= 5 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ Email sent to all recipients</p>}
        </div>
        {step >= 5 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Sample Alert Preview */}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-muted p-3 space-y-2 text-sm">
            <p className="font-semibold text-foreground">Sample Alert Email:</p>
            <div className="bg-card border border-border rounded p-3 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-amber-500" />
                <span className="font-semibold">Airdrop Opportunity Detected</span>
              </div>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>Token:</strong> USDC Airdrop</p>
                <p><strong>Amount:</strong> 500 USDC per address</p>
                <p><strong>Eligible Addresses:</strong> 3 addresses in your Airdrop Eligible group</p>
                <p><strong>Claim Deadline:</strong> 2024-02-15</p>
              </div>
              <div className="border-t border-border pt-2 text-muted-foreground text-[10px]">
                Sent: 2024-01-15 14:32 UTC
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AddressActivityAirdropPage() {
    const [activities, setActivities] = useState<AddressActivityAirdrop[]>([])
    const [groups, setGroups] = useState<NotificationGroup[]>([])
    const [addressGroups, setAddressGroups] = useState<AddressGroup[]>([])
    const [isLoadingActivities, setIsLoadingActivities] = useState(true)
    const [isLoadingGroups, setIsLoadingGroups] = useState(false)
    const [isLoadingAddressGroups, setIsLoadingAddressGroups] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [accessDenied, setAccessDenied] = useState(false)
    const [activePanel, setActivePanel] = useState<"how" | "monitor" | null>("how")
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
        await listNotificationGroups({
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
            <div className="flex flex-col px-6 py-6 gap-3 max-w-6xl mx-auto w-full">

              <Accordion
                title="How it works"
                meta="5 steps · real-time airdrop detection"
                open={activePanel === "how"}
                onOpenChange={(o) => setActivePanel(o ? "how" : null)}
              >
                <AirdropSimulation started={simulationStarted} />
              </Accordion>

              <Accordion
                title="Monitor airdrops"
                open={activePanel === "monitor"}
                onOpenChange={(o) => setActivePanel(o ? "monitor" : null)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-sm">Address Airdrop Activity</p>
                        <AddressAirdropWatcherInfo />
                      </div>
                    </div>
                    <Button onClick={handleCreateClick} size="sm" className="cursor-pointer">
                      <Plus className="w-4 h-4 mr-2" />
                      Configure Wallets
                    </Button>
                  </div>
                  <AddressActivityAirdropTable
                    activities={activities}
                    addressGroups={addressGroups}
                    groups={groups}
                    isLoading={isLoadingActivities}
                    loadingAddressGroups={isLoadingAddressGroups}
                  />
                </div>
              </Accordion>

              {/* Create Dialog */}
              <AddressActivityAirdropFormDialog
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
