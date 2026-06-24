"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AccessDenied } from "@/components/access-denied"
import { TopAccountsTable } from "@/components/web3/top-accounts/top-account-table"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown, CheckCircle2, TrendingUp, Users, Activity, Award } from "lucide-react"
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

function TopAccountsSimulation({ started }: { started: boolean }) {
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
      {/* Step 1: Aggregate */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 0 ? 1 : 0, y: step >= 0 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-blue-50/50 border-blue-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 1</p>
          <p className="text-xs font-semibold text-foreground">Aggregate Account Activity</p>
        </div>
        {step >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 2: Rank */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-violet-50/50 border-violet-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center shrink-0">
          <Award className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 2</p>
          <p className="text-xs font-semibold text-foreground">Rank by Volume</p>
          {step >= 2 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ Ranked by transaction volume and count</p>}
        </div>
        {step >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 3: Analyze Patterns */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-cyan-50/50 border-cyan-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-cyan-600 flex items-center justify-center shrink-0">
          <Activity className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 3</p>
          <p className="text-xs font-semibold text-foreground">Identify Patterns</p>
          {step >= 3 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ Trading behavior and activity patterns</p>}
        </div>
        {step >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Step 4: Monitor */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 10 }}
        className="flex items-center gap-3 rounded-xl border bg-emerald-50/50 border-emerald-100 px-4 py-3">
        <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center shrink-0">
          <Users className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 4</p>
          <p className="text-xs font-semibold text-foreground">Add to Monitoring</p>
          {step >= 4 && <p className="text-[10px] text-emerald-600 mt-0.5">✓ Track top accounts and set alerts</p>}
        </div>
        {step >= 4 && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </motion.div>

      {/* Summary */}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border bg-slate-50 p-3 space-y-2 text-sm">
            <p className="font-semibold text-slate-900">Top Accounts Summary:</p>
            <div className="bg-white border rounded p-3 space-y-2 text-xs">
              <p><strong>Total Accounts:</strong> 5,234 active accounts</p>
              <p><strong>Top Account:</strong> 0x742d35Cc... - $15.2M volume</p>
              <p><strong>Average Volume:</strong> $2.8M per account</p>
              <div className="border-t pt-2 text-slate-500">
                Insights updated: Every 24 hours
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Page() {
  const [accessDenied, setAccessDenied] = useState(false)
  const [activePanel, setActivePanel] = useState<"how" | "view" | null>("how")
  const [simulationStarted, setSimulationStarted] = useState(true)

  if (accessDenied) {
    return (
      <ProtectedRoute>
        <AccessDenied />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col px-6 py-6 gap-3 max-w-6xl mx-auto w-full">

        <Accordion
          title="How it works"
          meta="4 steps · understand top accounts"
          open={activePanel === "how"}
          onOpenChange={(o) => setActivePanel(o ? "how" : null)}
        >
          <TopAccountsSimulation started={simulationStarted} />
        </Accordion>

        <Accordion
          title="View accounts"
          open={activePanel === "view"}
          onOpenChange={(o) => setActivePanel(o ? "view" : null)}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">Top Accounts</h2>
              <p className="text-sm text-muted-foreground">
                Provides insight into account details across all addresses currently under active monitoring.
              </p>
            </div>
            <Separator className="bg-muted-foreground/40 h-px" />
            <TopAccountsTable onForbidden={() => setAccessDenied(true)} />
          </div>
        </Accordion>

      </div>
    </ProtectedRoute>
  )
}
