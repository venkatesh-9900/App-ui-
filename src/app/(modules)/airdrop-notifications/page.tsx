"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  ChevronDown, RotateCcw, CheckCircle2, Bell, Zap, Filter,
  AlertTriangle, ShieldAlert, Copy, ExternalLink, Ban, Eye, FileText, Plus, Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  createAddressActivityAirdrop,
  listAddressAirdropActivities,
  deleteAddressActivityAirdrop,
  toggleAddressActivityAirdrop,
} from "@/hooks/web3/address-activity-airdrop-service"
import { listNotificationGroups } from "@/hooks/notification-group-service"
import { AddressActivityAirdrop, CreateAddressActivityAirdropRequest } from "@/types/address-activity-airdrop"
import { NotificationGroup } from "@/types/notification-group"
import { AddressActivityAirdropFormDialog } from "@/components/web3/address-airdrop-activity/address-activity-airdrop-form-dialog"
import { AddressActivityAirdropTable } from "@/components/web3/address-airdrop-activity/address-activity-airdrop-table"
import { AddressAirdropWatcherInfo } from "@/components/web3/address-airdrop-activity/address-activity-airdrop-info"
import { AddressGroup } from "@/types/address-group"
import { listAddressGroups } from "@/hooks/web3/address-group-service"
import { useSearchParams } from "next/navigation"
import { useSpace } from "@/contexts/space-context"


// ─── Agent definitions ────────────────────────────────────────────────────────

const AGENTS = [
  {
    color: "bg-primary",
    border: "border-border bg-muted/60",
    dot: "bg-muted-foreground",
    label: "Agent 1",
    title: "Airdrop Detector",
    logs: ["Scanning 128 monitored wallets…", "ERC-20 transfer event matched", "✓ Airdrop detected · 0xde...8as"],
  },
  {
    color: "bg-primary",
    border: "border-border bg-muted/60",
    dot: "bg-muted-foreground",
    label: "Agent 2",
    title: "Risk Classifier",
    logs: ["Pulling token contract metadata…", "Honeypot + scam signal check", "✓ SCAM — phishing campaign match"],
  },
  {
    color: "bg-primary",
    border: "border-border bg-muted/60",
    dot: "bg-muted-foreground",
    label: "Agent 3",
    title: "Alert Dispatcher",
    logs: ["Composing alert payload…", "Routing → Email · Slack · webhook", "✓ Alert dispatched · 3 channels"],
  },
]

// Total ticks:
//  0        = monitor bar
//  1..3     = agent 1 logs
//  4..6     = agent 2 logs
//  7..9     = agent 3 logs
//  10       = output banner
//  11       = airdrop detection card
//  12       = token metadata
//  13       = signal flags
//  14       = suggested actions
const TOTAL_TICKS = 14
const TICK_MS = 430

function useSteps(total: number, delayMs: number) {
  const [step, setStep] = useState(-1)
  const [done, setDone] = useState(false)
  const [runKey, setRunKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStep(-1)
    setDone(false)
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
    async function run() {
      for (let i = 0; i <= total && !cancelled; i++) {
        if (i > 0) await wait(delayMs)
        if (!cancelled) setStep(i)
      }
      if (!cancelled) setDone(true)
    }
    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey])

  return { step, done, restart: () => setRunKey((k) => k + 1) }
}

function agentLogCount(agentIdx: number, step: number) {
  const base = 1 + agentIdx * 3
  const rel = step - base
  if (rel < 0) return -1
  return Math.min(rel, 2)
}
function agentDone(agentIdx: number, step: number) {
  return step >= 1 + agentIdx * 3 + 3
}

function AgentCard({ agent, logCount, done }: { agent: typeof AGENTS[0]; logCount: number; done: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: logCount >= 0 ? 1 : 0, y: logCount >= 0 ? 0 : 10 }}
      transition={{ duration: 0.3 }}
      className={cn("flex-1 min-w-0 rounded-xl border px-3 py-2.5 flex flex-col gap-2", agent.border)}
    >
      <div className="flex items-center gap-1.5">
        <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0", agent.color)}>
          <Zap className="w-2.5 h-2.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{agent.label}</p>
          <p className="text-[11px] font-semibold text-foreground truncate">{agent.title}</p>
        </div>
        {!done && logCount >= 0 && (
          <motion.div className={cn("ml-auto w-1.5 h-1.5 rounded-full shrink-0", agent.dot)}
            animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
        )}
        {done && <CheckCircle2 className="ml-auto w-3 h-3 text-emerald-500 shrink-0" />}
      </div>
      <div className="space-y-0.5 font-mono">
        {agent.logs.map((log, i) => (
          <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: i <= logCount ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className={cn("text-[9px] leading-relaxed",
              log.startsWith("✓") ? "text-emerald-600 font-semibold" : "text-muted-foreground")}>
            {log}
          </motion.p>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Signal flags ──────────────────────────────────────────────────────────────

const SIGNALS = [
  { label: "Honeypot contract", verdict: "CONFIRMED", color: "text-foreground bg-muted border-border" },
  { label: "Unverified token source", verdict: "CONFIRMED", color: "text-foreground bg-muted border-border" },
  { label: "Phishing campaign match", verdict: "CONFIRMED", color: "text-foreground bg-muted border-border" },
  { label: "Transfer to self from unknown", verdict: "FLAGGED", color: "text-muted-foreground bg-card border-border" },
  { label: "Token approved on 14 other wallets", verdict: "INFO", color: "text-muted-foreground bg-card border-border" },
]

const ACTIONS = [
  { icon: Ban, label: "Block token approval", desc: "Revoke any pending approvals for this contract", color: "bg-primary", border: "border-border bg-muted/60" },
  { icon: Eye, label: "Add to watchlist", desc: "Monitor sender for further airdrop campaigns", color: "bg-primary", border: "border-border bg-muted/60" },
  { icon: FileText, label: "Generate incident report", desc: "Create a compliance report for this event", color: "bg-primary", border: "border-border bg-muted/60" },
  { icon: Bell, label: "Notify security team", desc: "Dispatch alert to security channel with context", color: "bg-primary", border: "border-border bg-muted/60" },
]

function WorkflowDiagram() {
  const { step, done, restart } = useSteps(TOTAL_TICKS, TICK_MS)

  return (
    <div className="w-full flex flex-col gap-4">

      {/* ── Monitor bar ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: step >= 0 ? 1 : 0, y: step >= 0 ? 0 : 6 }}
        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
          <Bell className="w-3 h-3 text-primary-foreground" />
        </div>
        <code className="text-[11px] font-mono text-muted-foreground flex-1 truncate">
          Monitoring 128 wallets · real-time airdrop detection
        </code>
        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted border border-border rounded-full px-2 py-0.5">
          <motion.span className="w-1.5 h-1.5 rounded-full bg-muted-foreground block"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          Live
        </span>
      </motion.div>

      {/* ── Agent pipeline ── */}
      <div className="flex gap-2">
        {AGENTS.map((agent, i) => (
          <AgentCard key={agent.title} agent={agent}
            logCount={agentLogCount(i, step)} done={agentDone(i, step)} />
        ))}
      </div>

      {/* ── Output banner ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: step >= 10 ? 1 : 0 }}
        className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/60 px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
            animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
          Scam airdrop detected
        </div>
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-muted-foreground">3 agents · classified · action required</span>
      </motion.div>

      {/* ── Airdrop detection card ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: step >= 11 ? 1 : 0, y: step >= 11 ? 0 : 8 }}
        className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
              <ShieldAlert className="w-3 h-3 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Airdrop Event — High Risk</p>
              <p className="text-[10px] text-muted-foreground">Detected · Sun 21 Jun 2026 · 14:32 UTC</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-3 py-1 tracking-wide">SCAM</span>
        </div>

        <div className="grid grid-cols-2 gap-0 divide-x divide-border">
          {/* Recipient wallet */}
          <div className="px-4 py-3 space-y-1">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Recipient Wallet</p>
            <div className="flex items-center gap-1.5">
              <code className="text-[11px] font-mono text-foreground">0xde.....8as</code>
              <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
            </div>
            <p className="text-[9px] text-muted-foreground">Monitored · Ethereum Mainnet</p>
          </div>
          {/* Sender */}
          <div className="px-4 py-3 space-y-1">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Sender Contract</p>
            <div className="flex items-center gap-1.5">
              <code className="text-[11px] font-mono text-foreground">0xBad1...c4F2</code>
              <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
            </div>
            <p className="text-[9px] text-muted-foreground">Unverified · not on any known registry</p>
          </div>
        </div>

        {/* Token metadata */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: step >= 12 ? 1 : 0 }}
          className="grid grid-cols-4 gap-0 divide-x divide-border border-t border-border">
          {[
            { label: "TOKEN", value: "PHISH" },
            { label: "AMOUNT", value: "10,000,000" },
            { label: "EST. VALUE", value: "$0.00" },
            { label: "BLOCK", value: "#22,481,904" },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-2.5 bg-card">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="text-[11px] font-bold text-foreground mt-0.5">{value}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Signal flags ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: step >= 13 ? 1 : 0, y: step >= 13 ? 0 : 8 }}
        className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs font-semibold text-foreground">Risk Signals</p>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {SIGNALS.map(({ label, verdict, color }) => (
            <span key={label}
              className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium", color)}>
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
              {label}
              <span className="font-bold opacity-70">· {verdict}</span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Suggested actions ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: step >= 14 ? 1 : 0, y: step >= 14 ? 0 : 8 }}
        className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50">
          <Bell className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs font-semibold text-foreground">Suggested Actions</p>
          <span className="ml-auto text-[10px] text-muted-foreground">Agent recommended</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {ACTIONS.map(({ icon: Icon, label, desc, color, border }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: step >= 14 ? 1 : 0, y: step >= 14 ? 0 : 6 }}
              transition={{ delay: i * 0.08 }}
              className={cn("rounded-xl border px-3 py-3 flex flex-col gap-2 cursor-pointer hover:-translate-y-0.5 transition-transform", border)}>
              <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", color)}>
                <Icon className="w-3 h-3 text-primary-foreground" />
              </div>
              <p className="text-[11px] font-semibold text-foreground leading-tight">{label}</p>
              <p className="text-[9px] text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {done && (
          <motion.div key="rerun" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/60 px-4 py-2.5 w-full">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs text-muted-foreground">
                Detection complete · 3 agents · scam classified · 4 actions suggested
              </span>
            </div>
            <button onClick={restart}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary border border-border rounded-md px-3 py-1.5 bg-card hover:bg-accent/50 hover:border-primary transition-colors shrink-0">
              <RotateCcw className="w-3 h-3" />
              Re-run
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Accordion({ title, meta, children, open, onOpenChange }: {
  title: string
  meta?: string
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
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

function ConfigureAirdropNotifications() {
  const [activities, setActivities] = useState<AddressActivityAirdrop[]>([])
  const [groups, setGroups] = useState<NotificationGroup[]>([])
  const [addressGroups, setAddressGroups] = useState<AddressGroup[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [isLoadingAddressGroups, setIsLoadingAddressGroups] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [initialData, setInitialData] = useState<{
    name?: string
    address_group_ids?: number[]
    notification_group_ids?: number[]
    notification_subscriber_ids?: number[]
    channel_ids?: string[]
  }>({})
  const searchParams = useSearchParams()
  const { selectedGroupId } = useSpace()

  useEffect(() => {
    fetchActivities()
    fetchAddressGroups()
    fetchGroups()
    handleParams()
  }, [])

  useEffect(() => {
    fetchActivities()
    fetchAddressGroups()
  }, [selectedGroupId])

  const fetchActivities = async () => {
    setIsLoadingActivities(true)
    await listAddressAirdropActivities({
      successTask: (response) => {
        if (response.data && Array.isArray(response.data)) setActivities(response.data)
        setIsLoadingActivities(false)
      },
      failureTask: () => { toast.error("Failed to load address activities"); setIsLoadingActivities(false) },
      errorTask: () => { toast.error("An error occurred"); setIsLoadingActivities(false) },
      forbiddenTask: () => setIsLoadingActivities(false),
      groupId: selectedGroupId,
    })
  }

  const fetchGroups = async () => {
    setIsLoadingGroups(true)
    await listNotificationGroups({
      groupId: selectedGroupId,
      successTask: (response) => {
        if (response.data && Array.isArray(response.data)) setGroups(response.data)
        setIsLoadingGroups(false)
      },
      failureTask: () => { toast.error("Failed to load groups"); setIsLoadingGroups(false) },
      errorTask: () => { toast.error("Error loading groups"); setIsLoadingGroups(false) },
      forbiddenTask: () => setIsLoadingGroups(false),
    })
  }

  const fetchAddressGroups = async () => {
    setIsLoadingAddressGroups(true)
    await listAddressGroups({
      successTask: (response) => {
        if (response.data && Array.isArray(response.data)) setAddressGroups(response.data)
        setIsLoadingAddressGroups(false)
      },
      failureTask: () => { toast.error("Failed to load address groups"); setIsLoadingAddressGroups(false) },
      errorTask: () => { toast.error("Error loading address groups"); setIsLoadingAddressGroups(false) },
      forbiddenTask: () => setIsLoadingAddressGroups(false),
      groupId: selectedGroupId,
    })
  }

  const handleFormSubmit = async (formData: CreateAddressActivityAirdropRequest) => {
    setIsSubmitting(true)
    const request = selectedGroupId ? { ...formData, iam_group_id: selectedGroupId } : formData
    await createAddressActivityAirdrop({
      request,
      successTask: () => {
        toast.success("Airdrop watcher created!")
        setDialogOpen(false)
        setIsSubmitting(false)
        fetchActivities()
      },
      failureTask: () => { toast.error("Failed to create watcher"); setIsSubmitting(false) },
      errorTask: () => { toast.error("An error occurred"); setIsSubmitting(false) },
      forbiddenTask: () => { toast.error("Access denied"); setIsSubmitting(false) },
    })
  }

  const handleDialogOpenChange = useCallback((next: boolean) => {
    if (dialogOpen !== next) setDialogOpen(next)
  }, [dialogOpen])

  const handleParams = () => {
    const query = Object.fromEntries(searchParams.entries())
    setInitialData({
      name: query.name || "",
      address_group_ids: query.addressGroupIds ? query.addressGroupIds.split(",").map(Number) : [],
      notification_group_ids: query.groupIds ? query.groupIds.split(",").map(Number) : [],
      notification_subscriber_ids: query.subscriberIds ? query.subscriberIds.split(",").map(Number) : [],
      channel_ids: query.channelIds ? query.channelIds.split(",") : [],
    })
    if (query.openActivity) {
      setDialogOpen(true)
      window.history.replaceState({}, "", "/airdrop-notifications")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Manage watchers that monitor address groups for airdrop activity.</p>
          <AddressAirdropWatcherInfo />
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="cursor-pointer">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Create Watcher
        </Button>
      </div>

      <AddressActivityAirdropTable
        activities={activities}
        addressGroups={addressGroups}
        groups={groups}
        isLoading={isLoadingActivities}
        loadingAddressGroups={isLoadingAddressGroups}
      />

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
  )
}

export default function AirdropNotificationsPage() {
  const [activePanel, setActivePanel] = useState<"how" | "configure" | null>(null)
  const [howStarted, setHowStarted] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>

      <div className="flex flex-col px-6 py-6 gap-3 max-w-5xl mx-auto w-full">
        <div className="space-y-1 pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Airdrop Notifications</p>
          <h1 className="text-2xl font-bold text-foreground">Airdrop Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Detect and classify incoming airdrops across all monitored wallets in real time.
            Automatically flag scam tokens, honeypot contracts, and phishing attempts before they cause harm.
            Configure per-group watchers and receive actionable alerts with suggested next steps.
          </p>
        </div>

        <Accordion
          title="How it works"
          meta="3 agents · real-time alerts"
          open={activePanel === "how"}
          onOpenChange={(o) => { setActivePanel(o ? "how" : null); if (o) setHowStarted(true) }}
        >
          {howStarted && <WorkflowDiagram />}
        </Accordion>

        <Accordion
          title="Configure Airdrop Notifications"
          open={activePanel === "configure"}
          onOpenChange={(o) => setActivePanel(o ? "configure" : null)}
        >
          <ConfigureAirdropNotifications />
        </Accordion>
      </div>
    </ProtectedRoute>
  )
}
