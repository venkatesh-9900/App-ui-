"use client"

import { ProtectedRoute } from "@/components/protected-route";
import { CopyButton } from "@/components/ui/copy-button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import AddressStatic from "@/components/web3/address/address-static";
import { BlockchainAddressSearch } from "@/components/web3/address/blockchain-address-search";
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar";
import { NeighboursView } from "@/components/web3/address/neighbours-view";
import { NeighbourResponse, NeighboursColumn } from "@/types/blockchain";
import { AddressNeighboursGraph } from "@/components/web3/address/address-neighbours-graph"
import { AddressNeighboursGraphCanvas } from "@/components/web3/address/address-neighbours-graph-canvas"
import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, CheckCircle2, Wallet, Network, TrendingUp, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

function AddressAnalyticsSimulation({ started }: { started: boolean }) {
  const [step, setStep] = useState(-1)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!started) {
      setStep(-1)
      setDone(false)
      return
    }

    let cancelled = false
    const steps = [0, 1, 2, 3, 4]
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
      {/* Step 1: Input Address */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 0 ? 1 : 0, y: step >= 0 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-blue-50/50 border-blue-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
          <Wallet className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 1</p>
          <p className="text-xs font-semibold text-foreground">Enter Wallet Address</p>
        </div>
        {step >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 2: Fetch Data */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-violet-50/50 border-violet-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center shrink-0">
          <Network className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 2</p>
          <p className="text-xs font-semibold text-foreground">Fetch Blockchain Data</p>
          {step >= 2 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ Fetching transactions and connections</p>}
        </div>
        {step >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 3: Map Neighbours */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-cyan-50/50 border-cyan-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-cyan-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 3</p>
          <p className="text-xs font-semibold text-foreground">Map Connected Addresses</p>
          {step >= 3 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ 1,247 connected addresses identified</p>}
        </div>
        {step >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 4: Visualize Network */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-emerald-50/50 border-emerald-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center shrink-0">
          <Share2 className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 4</p>
          <p className="text-xs font-semibold text-foreground">Analyze Network</p>
          {step >= 4 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ Interactive graph and analytics ready</p>}
        </div>
        {step >= 4 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Summary */}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border bg-slate-50 p-3 space-y-2 text-sm">
            <p className="font-semibold text-slate-900">Analysis Complete:</p>
            <div className="bg-white border rounded p-3 space-y-2 text-xs">
              <p><strong>Wallet:</strong> 0x742d35Cc6634C0532925a3b844Bc</p>
              <p><strong>Connected Addresses:</strong> 1,247</p>
              <p><strong>Transaction Count:</strong> 5,623</p>
              <div className="border-t pt-2 text-slate-500">
                Network graph and detailed metrics available
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AddressPage() {
    const [addressId, setAddressId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [addressData, setAddressData] = useState<NeighboursColumn[]>([])
    const [errorResponse, setErrorResponse] = useState(false)
    const [selectedChainId, setSelectedChainId] = useState(1)
    const [selectedDirection, setSelectedDirection] = useState(2)
    const [startTime, setStartTime] = useState<number>(0)
    const [endTime, setEndTime] = useState<number>(
        Math.trunc(new Date().getTime() / 1000) + 86399
    )
    const [txNumber, setTxNumber] = useState<number>(0)
    const [activePanel, setActivePanel] = useState<"how" | "analyze" | null>("how")
    const [simulationStarted, setSimulationStarted] = useState(true)

    const getNeighboursData = (data: NeighbourResponse[]) : NeighboursColumn[] => {
        return data.map((e: NeighbourResponse) => {
            return { address: e.address, depth: 1, txns_no: e.tx_count }
        })
    }

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );
    const sortableId = React.useId()

    return (
        <ProtectedRoute>
            <DashboardNavbar />
            <div className="flex flex-col px-6 py-6 gap-3 max-w-6xl mx-auto w-full">

              <Accordion
                title="How it works"
                meta="4 steps · analyze wallet networks"
                open={activePanel === "how"}
                onOpenChange={(o) => setActivePanel(o ? "how" : null)}
              >
                <AddressAnalyticsSimulation started={simulationStarted} />
              </Accordion>

              <Accordion
                title="Analyze addresses"
                open={activePanel === "analyze"}
                onOpenChange={(o) => setActivePanel(o ? "analyze" : null)}
              >
                <Tabs
                    defaultValue="outline"
                    className="w-full flex-col justify-start gap-6"
                >
                    <TabsContent
                        value="outline"
                        className="relative flex flex-col gap-4 overflow-auto"
                    >
                        <BlockchainAddressSearch
                            onError={function (error: string): void {
                                setIsLoading(false)
                                setErrorResponse(true)
                                toast.error(error);
                            }}
                            onSearchResults={(data, chainId, address, startTime, endTime, direction) => {
                                setSelectedChainId(chainId)
                                setStartTime(startTime)
                                setEndTime(endTime)
                                setSelectedDirection(direction)
                                setAddressId(address)
                                setIsLoading(false)
                                setAddressData(getNeighboursData(data.neighbours))
                                setTxNumber(data.tx_count)
                                setErrorResponse(false)
                            }}
                            setLoading={() => {
                                setIsLoading(true)
                                setErrorResponse(false)
                            }}
                        />
                        {isLoading ? <AddressStatic type="loading" message="Loading..." /> :
                        errorResponse ? <AddressStatic type="error" message="Unable to show results due to error" /> :
                        addressId == "" ? <AddressStatic type="search" message="Search for an address" /> :
                        <div className="overflow-hidden rounded-lg relative">
                            <div className="flex flex-row items-end pb-5">
                                <span className="text-md text-muted-foreground mr-1">
                                    Address
                                </span>
                                <span className={`text-xl font-medium mr-1`}>{addressId}</span>
                                <CopyButton className={"mb-0.5"} content={addressId} variant="ghost" size="sm" />
                            </div>
                            <DndContext
                                collisionDetection={closestCenter}
                                modifiers={[restrictToVerticalAxis]}
                                sensors={sensors}
                                id={sortableId}
                            >
                                <div className="flex flex-row justify-end items-center gap-2">  
                                                    </div>
                                                    {/* <NeighboursView 
                                            chain_id={selectedChainId} 
                                            start_date={new Date(startTime * 1000)} 
                                            end_date={new Date(endTime * 1000)} 
                                            direction={selectedDirection} 
                                            current_address={addressId} 
                                            depth={1} 
                                            data={addressData} 
                                            tx_count={txNumber}
                                        /> */}
                                                    {/* <AddressNeighboursGraph
                                                        chainId={selectedChainId}
                                                        rootAddress={addressId}
                                                        rootTxCount={txNumber}   // ✅ ADD THIS
                                                        startDate={new Date(startTime * 1000)}
                                                        endDate={new Date(endTime * 1000)}
                                                        direction={selectedDirection}
                                                        initialNeighbours={addressData.map(n => ({
                                                            address: n.address,
                                                            tx_count: n.txns_no,
                                                        }))}
                                                    /> */}

                                                    <AddressNeighboursGraphCanvas
                                                        chainId={selectedChainId}
                                                        rootAddress={addressId}
                                                        rootTxCount={txNumber}
                                                        startDate={new Date(startTime * 1000)}
                                                        endDate={new Date(endTime * 1000)}
                                                        direction={selectedDirection}
                                                        initialNeighbours={addressData.map(n => ({
                                                        address: n.address,
                                                        tx_count: n.txns_no,
                                                    }))}
                                                    />
                                    </DndContext>
                                </div>
                            }
                    </TabsContent>
                </Tabs>
              </Accordion>

            </div>
        </ProtectedRoute>
    )
}