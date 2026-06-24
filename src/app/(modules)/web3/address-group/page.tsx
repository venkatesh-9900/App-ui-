"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Group, ChevronDown, CheckCircle2, Network, Upload, CheckSquare2 } from 'lucide-react'
import {
    createAddressGroup,
    listAddressGroups,
    deleteAddressGroup
} from '@/hooks/web3/address-group-service'
import { AddressGroup, CreateAddressGroupRequest } from '@/types/address-group'
import { AddressGroupFormDialog } from '@/components/web3/address-group/address-group-form-dialog'
import { AddressGroupTable } from '@/components/web3/address-group/address-group-table'
import { ProtectedRoute } from "@/components/protected-route"
import { AccessDenied } from "@/components/access-denied"
import { DashboardNavbar } from '@/components/web3/explorer/dashboard-navbar'
import { getChainlist } from '@/hooks/web3/metadata.service'
import { Chain, ChainListResponse } from '@/types/matadata'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSpace } from '@/contexts/space-context'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from "@/lib/utils"

function Accordion({ title, meta, children, open, onOpenChange }: { title: string; meta?: string; children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => onOpenChange(!open)}
        className={cn("flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50", open && "bg-slate-50 border-b-2 border-slate-200")}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className={cn("h-2 w-2 rounded-full shrink-0", open ? "bg-slate-900" : "bg-slate-300")} />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-800">{title}</p>
            {meta && <p className="mt-0.5 text-xs text-slate-400">{meta}</p>}
          </div>
        </div>
        <div className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors shrink-0", open ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-500")}>
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

function AddressGroupSimulation({ started }: { started: boolean }) {
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
      {/* Step 1: Name & Description */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 0 ? 1 : 0, y: step >= 0 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-blue-50/50 border-blue-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
          <Group className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 1</p>
          <p className="text-xs font-semibold text-foreground">Name & Description</p>
        </div>
        {step >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 2: Select Network */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-violet-50/50 border-violet-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center shrink-0">
          <Network className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 2</p>
          <p className="text-xs font-semibold text-foreground">Select Blockchain Network</p>
          {step >= 2 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ Ethereum selected</p>}
        </div>
        {step >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 3: Add Addresses */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-cyan-50/50 border-cyan-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-cyan-600 flex items-center justify-center shrink-0">
          <Upload className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 3</p>
          <p className="text-xs font-semibold text-foreground">Add Wallet Addresses</p>
          {step >= 3 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ 15 addresses added (CSV or manual)</p>}
        </div>
        {step >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 4: Validate Addresses */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-amber-50/50 border-amber-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 4</p>
          <p className="text-xs font-semibold text-foreground">Validate Address Format</p>
          {step >= 4 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ All addresses are valid • 0x format verified</p>}
        </div>
        {step >= 4 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 5: Review & Save */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-emerald-50/50 border-emerald-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center shrink-0">
          <CheckSquare2 className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 5</p>
          <p className="text-xs font-semibold text-foreground">Create Group</p>
          {step >= 5 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ Group saved and ready to use</p>}
        </div>
        {step >= 5 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Summary */}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border bg-slate-50 p-3 space-y-2 text-sm">
            <p className="font-semibold text-slate-900">Group Created Successfully:</p>
            <div className="bg-white border rounded p-3 space-y-2 text-xs">
              <div className="space-y-1">
                <p><strong>Group Name:</strong> Suspicious Wallets</p>
                <p><strong>Description:</strong> Wallets flagged for review</p>
                <p><strong>Network:</strong> Ethereum</p>
                <p><strong>Addresses:</strong> 15 wallet addresses</p>
              </div>
              <div className="border-t pt-2 text-slate-500 text-[10px]">
                Group is now available for monitoring and alerts
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AddressGroupPage() {
    const [groups, setGroups] = useState<AddressGroup[]>([])
    const [isLoadingGroups, setIsLoadingGroups] = useState(false)
    const [isLoadingWeb3Networks, setIsLoadingWewb3Network] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [accessDenied, setAccessDenied] = useState(false)
    const [web3Networks, setWeb3Networks] = useState<Chain[]>([])
    const [activePanel, setActivePanel] = useState<"how" | "manage" | null>("how")
    const [simulationStarted, setSimulationStarted] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { selectedGroupId } = useSpace()

    // Fetch activities on mount
    useEffect(() => {
        fetchGroups()
        fetchChainList()
        handleParams();
    }, [])

    useEffect(() => {
        fetchGroups()
    }, [selectedGroupId])

    const handleParams = () => {
        const query = Object.fromEntries(searchParams.entries());
        let { openGroup } = query;
        if (openGroup) {
            setDialogOpen(true)
        }
    }

    const fetchGroups = async () => {
        setIsLoadingGroups(true)
        await listAddressGroups({
            successTask: (response) => {
                console.log('Groups Response:', response)
                if (response.data && Array.isArray(response.data)) {
                    setGroups(response.data)
                }
                setIsLoadingGroups(false)
            },
            failureTask: () => {
                toast.error('Failed to load address groups', {
                    description: 'Could not fetch address group watchers. Please try again.',
                })
                setIsLoadingGroups(false)
            },
            errorTask: () => {
                toast.error('An error occurred', {
                    description: 'Please check your connection and try again.',
                })
                setIsLoadingGroups(false)
            },
            forbiddenTask: () => {
                setAccessDenied(true)
                setIsLoadingGroups(false)
            },
            groupId: selectedGroupId,
        })
    }

    const fetchChainList = async () => {
        setIsLoadingWewb3Network(true);
              try {
                await getChainlist({
                  successTask: (response: ChainListResponse) => {
                    const apiResponse = response;
                    setIsLoadingWewb3Network(false);
                    if (apiResponse?.errors && apiResponse.errors.length > 0) {
                      setWeb3Networks([]);
                      toast.error(apiResponse.errors[0]);
                    }
        
                    const fetchedChains: Chain[] = apiResponse?.data?.chains || [];
                    setWeb3Networks(fetchedChains);
                  },
                  failureTask: () => {
                    setIsLoadingWewb3Network(false);
                    toast.error("Failed to fetch chain list");
                  },
                  errorTask: () => {
                    setIsLoadingWewb3Network(false);
                    toast.error("An error occurred while fetching chain list");
                  },
                  forbiddenTask: () => {
                    setAccessDenied(true);
                    setIsLoadingWewb3Network(false);
                  },
                });
              } catch (err) {
                console.error("fetchChainList: unexpected error", err);
                toast.error("Unexpected error while fetching chain list");
              }
    }

    const handleCreateClick = () => {
        setDialogOpen(true)
    }

    const handleFormSubmit = async (formData: CreateAddressGroupRequest) => {
        setIsSubmitting(true)

        const request = selectedGroupId
            ? { ...formData, iam_group_id: selectedGroupId }
            : formData
        await createAddressGroup({
            request,
            successTask: (data) => {
                toast.success('Address group is created!')
                setDialogOpen(false)
                setIsSubmitting(false)
                fetchGroups() // Refresh the list
                const query = Object.fromEntries(searchParams.entries());
                if (query.returnUrl) {
                    router.push(query.returnUrl)
                }
            },
            failureTask: (duplicateName) => {
                if (duplicateName) {
                    toast.error('Group name already exists', {
                        description: 'Please choose a different name for the address group.',
                    })
                } else {
                    toast.error('Failed to create group', {
                        description: 'Please try again.',
                    })
                }
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

    const handleDeleteGroup = async (id: number) => {
        await deleteAddressGroup({
            id,
            successTask: () => {
                toast.success('Group deleted successfully!', {
                    description: 'The address group has been removed.',
                })
                fetchGroups() // Refresh the list
            },
            failureTask: () => {
                toast.error('Failed to delete group', {
                    description: 'Please try again.',
                })
            },
            errorTask: () => {
                toast.error('An error occurred', {
                    description: 'Please check your connection and try again.',
                })
            },
            forbiddenTask: () => {
                toast.error("Access denied")
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
                meta="5 steps · create and manage address groups"
                open={activePanel === "how"}
                onOpenChange={(o) => setActivePanel(o ? "how" : null)}
              >
                <AddressGroupSimulation started={simulationStarted} />
              </Accordion>

              <Accordion
                title="Manage groups"
                open={activePanel === "manage"}
                onOpenChange={(o) => setActivePanel(o ? "manage" : null)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Group className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Address Groups</p>
                        <p className="text-xs text-muted-foreground">Create and manage groups of wallet addresses for monitoring</p>
                      </div>
                    </div>
                    <Button onClick={handleCreateClick} size="sm" className="cursor-pointer">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Group
                    </Button>
                  </div>
                  <AddressGroupTable
                    groups={groups}
                    web3Networks={web3Networks}
                    isLoading={isLoadingGroups || isLoadingWeb3Networks}
                    onDelete={handleDeleteGroup}
                  />
                </div>
              </Accordion>

              {/* Create Dialog */}
              <AddressGroupFormDialog
                open={dialogOpen}
                onOpenChange={handleDialogOpenChange}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                initialData={{
                    name: "",
                    description: "",
                    addresses: [],
                    web3Networks: web3Networks,
                }}
              />
            </div>
        </ProtectedRoute>
    )
}
