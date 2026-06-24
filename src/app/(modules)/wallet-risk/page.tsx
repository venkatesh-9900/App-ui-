"use client"

import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown, RotateCcw, CheckCircle2, Activity, Copy, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const SAMPLE_INPUTS = [
  "Enter wallet address (e.g., 0x742d35Cc...)",
  "Enter transaction hash (e.g., 0xab12cd...)",
  "Compare risk profiles of two wallets",
  "Show wallets with increased risk",
  "Check for sanctioned addresses",
]

const prompts = [
  { title: "What is the risk score for wallet '0xde.....8as' and what are the contributing factors?" },
  { title: 'Is wallet "0xjr....w90" associated with any sanctioned entities or mixers?' },
  { title: 'Show me the full transaction history and risk breakdown for "0xbtg.....aj5".' },
  { title: 'Compare the risk profiles of these two wallets and identify the higher-risk one.' },
  { title: "Which wallets in my watchlist have had their risk score increase in the last 7 days?" },
  { title: 'Flag "0xpr5.....yw1" if it interacts with any high-risk counterparties.' },
  { title: "Generate a risk summary report for all wallets monitored in my organisation." },
]

// ─── Heatmap data (Mon–Sun × 53 weeks, intensity 0–4) ────────────────────────
const DAYS = ["Mon", "", "Wed", "", "Fri", "", "Sun"]
const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]

function buildHeatmap() {
  const weeks: number[][] = []
  for (let w = 0; w < 53; w++) {
    const days: number[] = []
    for (let d = 0; d < 7; d++) {
      const base = w < 48 ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 3)
      days.push(base)
    }
    weeks.push(days)
  }
  return weeks
}

const heatmapData = buildHeatmap()

const intensityClass = ["bg-slate-100", "bg-emerald-200", "bg-emerald-300", "bg-emerald-500", "bg-emerald-700"]

const dappRows = [
  { rank: "🥇", name: "Lido: Execution Layer Rewards Vault", txn: "46,937", value: "$986,418.45" },
  { rank: "🥈", name: "0x149B41b1...fD2f014e5", txn: "80", value: "$565,638.49" },
  { rank: "🥉", name: "Fee Recipient: 0x73f7...d58", txn: "5,185", value: "$109,010.11" },
  { rank: "4", name: "stakefish: Fee Recipient", txn: "2,114", value: "$45,090.16" },
  { rank: "5", name: "Rocket Pool: Smoothing Pool", txn: "1,614", value: "$38,764.19" },
]

const neighborRows = [
  { addr: "Lido: Execution Layer ...", inflow: "$0.00", outflow: "$942,898.55", net: "-$942,898.55", neg: true },
  { addr: "0x149B41b1...fD2f014...", inflow: "$0.00", outflow: "$565,638.49", net: "-$565,638.49", neg: true },
  { addr: "0xBd19462a...83d7F8...", inflow: "$16,964.60", outflow: "$468,222.96", net: "-$451,258.36", neg: true },
  { addr: "Fee Recipient: 0xe68....", inflow: "$0.00", outflow: "$394,922.64", net: "-$394,922.64", neg: true },
  { addr: "0xF00003BF...97cdFc...", inflow: "$231,872.14", outflow: "$0.00", net: "$231,872.14", neg: false },
]

function useSteps(total: number, delayMs = 600) {
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

const AGENTS = [
  {
    step: 1,
    color: "bg-blue-600",
    border: "border-blue-100 bg-blue-50/50",
    dot: "bg-blue-500",
    label: "Agent 1",
    title: "Chain Data Fetcher",
    logs: ["Fetching 1,349,606 txns…", "Resolving labels + clusters", "✓ History indexed"],
  },
  {
    step: 2,
    color: "bg-violet-700",
    border: "border-violet-100 bg-violet-50/40",
    dot: "bg-violet-500",
    label: "Agent 2",
    title: "Sanctions Screener",
    logs: ["Checking OFAC SDN list…", "Checking EU + UN watchlists", "✓ No direct match"],
  },
  {
    step: 3,
    color: "bg-cyan-600",
    border: "border-cyan-100 bg-cyan-50/40",
    dot: "bg-cyan-500",
    label: "Agent 3",
    title: "Behavioural Analyst",
    logs: ["Mapping dApp interactions…", "Analysing counterparty flows", "✓ Lido dominance flagged"],
  },
  {
    step: 4,
    color: "bg-amber-500",
    border: "border-amber-200 bg-amber-50",
    dot: "bg-amber-400",
    label: "Agent 4",
    title: "Risk Aggregator",
    logs: ["Combining agent signals…", "Velocity threshold exceeded", "✓ Score: 73 / 100"],
  },
]

// Each agent card receives the exact log lines it should currently show (driven by parent)
function AgentCard({ agent, logCount, done: agentDone }: { agent: typeof AGENTS[0]; logCount: number; done: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: logCount >= 0 ? 1 : 0, y: logCount >= 0 ? 0 : 10 }}
      transition={{ duration: 0.3 }}
      className={cn("flex-1 min-w-0 rounded-xl border px-3 py-2.5 flex flex-col gap-2", agent.border)}
    >
      <div className="flex items-center gap-1.5">
        <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0", agent.color)}>
          <Activity className="w-2.5 h-2.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{agent.label}</p>
          <p className="text-[11px] font-semibold text-foreground truncate">{agent.title}</p>
        </div>
        {!agentDone && logCount >= 0 && (
          <motion.div className={cn("ml-auto w-1.5 h-1.5 rounded-full shrink-0", agent.dot)}
            animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
        )}
        {agentDone && <CheckCircle2 className="ml-auto w-3 h-3 text-emerald-500 shrink-0" />}
      </div>
      <div className="space-y-0.5 font-mono">
        {agent.logs.map((log, i) => (
          <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: i <= logCount ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className={cn("text-[9px] leading-relaxed", log.startsWith("✓") ? "text-emerald-600 font-semibold" : "text-slate-400")}>
            {log}
          </motion.p>
        ))}
      </div>
    </motion.div>
  )
}

// Total ticks: 1 (address) + 4 agents × 3 logs each (12) + 1 (banner) + 4 (output sections) = 18
// Tick map:
//  0 = address bar
//  1..3  = agent 1 logs
//  4..6  = agent 2 logs
//  7..9  = agent 3 logs
//  10..12 = agent 4 logs
//  13 = output banner
//  14 = stats
//  15 = heatmap
//  16 = tables
//  17 = verdict
const TOTAL_TICKS = 17
const TICK_MS = 420

function WorkflowDiagram() {
  const { step, done, restart } = useSteps(TOTAL_TICKS, TICK_MS)

  // Derive per-agent log visibility from tick
  // Agent n occupies ticks (n*3 - 2) .. (n*3) for n = 1..4
  function agentLogCount(agentIdx: number) {
    // agentIdx 0-based
    const base = 1 + agentIdx * 3   // tick at which first log appears
    const relative = step - base
    if (relative < 0) return -1      // card not yet visible
    return Math.min(relative, 2)     // max 3 logs (indices 0,1,2)
  }
  function agentDone(agentIdx: number) {
    return step >= 1 + agentIdx * 3 + 3
  }

  return (
    <div className="w-full flex flex-col gap-4">

      {/* ── Address input strip ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: step >= 0 ? 1 : 0, y: step >= 0 ? 0 : 6 }}
        className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5">
        <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center shrink-0">
          <Activity className="w-3 h-3 text-white" />
        </div>
        <code className="text-[11px] font-mono text-muted-foreground flex-1 truncate">0x7f3a4d2e9c1b8f06a5d39e7c2b4f1a8d6e9c3b5a</code>
        <Copy className="w-3 h-3 text-slate-400 shrink-0 cursor-pointer" />
        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-2 py-0.5">
          <motion.span className="w-1.5 h-1.5 rounded-full bg-cyan-500 block" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          Live
        </span>
      </motion.div>

      {/* ── Agent coordination pipeline ── */}
      <div className="flex gap-2">
        {AGENTS.map((agent, i) => (
          <AgentCard key={agent.title} agent={agent} logCount={agentLogCount(i)} done={agentDone(i)} />
        ))}
      </div>

      {/* ── Output transition banner ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: step >= 13 ? 1 : 0 }}
        className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
          Agent output
        </div>
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[10px] text-slate-400">4 agents · coordinated · report generated</span>
      </motion.div>

      {/* ── Stats cards ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: step >= 14 ? 1 : 0, y: step >= 14 ? 0 : 8 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "TRANSACTION COUNT", value: "1,349,606", sub: "Since Mon 08, Jul 2024" },
          { label: "ACTIVE AGE", value: "1Y 348D", sub: "Since Mon 08, Jul 2024" },
          { label: "UNIQUE DAYS ACTIVE", value: "1Y 92D", sub: "Since Mon 08, Jul 2024" },
          { label: "LONGEST STREAK", value: "1Y 80D", sub: "Since Thu 03, Apr 2025" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">{label}</p>
            <p className="mt-1 text-base font-bold text-slate-900 leading-tight">{value}</p>
            <p className="mt-0.5 text-[9px] text-slate-400">{sub}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Transaction Heatmap ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: step >= 15 ? 1 : 0, y: step >= 15 ? 0 : 8 }}
        className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-800">Transaction Heatmap</p>
          <p className="text-[10px] text-slate-400">Tue 1, Jul 2025 – Sun 21, Jun 2026</p>
        </div>
        <div className="flex gap-2">
          {/* Day labels */}
          <div className="flex flex-col justify-between pr-1" style={{ paddingTop: 14, paddingBottom: 2 }}>
            {DAYS.map((d, i) => (
              <div key={i} className="text-[8px] text-slate-400 leading-none" style={{ height: 8 }}>{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div className="flex-1 overflow-hidden">
            {/* Month labels */}
            <div className="flex mb-1" style={{ gap: 2 }}>
              {MONTHS.map((m) => (
                <div key={m} className="text-[8px] text-slate-400 flex-1 text-center">{m}</div>
              ))}
            </div>
            <div className="flex" style={{ gap: 2 }}>
              {heatmapData.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: 2 }}>
                  {week.map((intensity, di) => (
                    <div key={di} className={cn("rounded-[2px]", intensityClass[intensity])}
                      style={{ width: "100%", aspectRatio: "1", minWidth: 7 }} />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-1 mt-1.5">
              <span className="text-[8px] text-slate-400">Less</span>
              {intensityClass.map((c, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-[2px]", c)} />
              ))}
              <span className="text-[8px] text-slate-400">More</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── dApp Activity + Neighbors ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: step >= 16 ? 1 : 0, y: step >= 16 ? 0 : 8 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* dApp Activity */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-800">dApp Activity</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">180 Days</span>
              <span className="text-[10px] font-medium text-slate-500 border border-slate-200 rounded px-1.5 py-0.5">Volume</span>
              <span className="text-[10px] font-semibold bg-slate-900 text-white rounded px-1.5 py-0.5">Gas Spent</span>
            </div>
          </div>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-3 py-1.5 text-slate-400 font-medium">Rank</th>
                <th className="text-left px-2 py-1.5 text-slate-400 font-medium">Project</th>
                <th className="text-right px-2 py-1.5 text-slate-400 font-medium">Txn Count</th>
                <th className="text-right px-3 py-1.5 text-slate-400 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {dappRows.map((r, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: step >= 16 ? 1 : 0 }}
                  transition={{ delay: i * 0.08 }} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-3 py-1.5">{r.rank}</td>
                  <td className="px-2 py-1.5 text-blue-600 truncate max-w-[140px]">{r.name}</td>
                  <td className="px-2 py-1.5 text-right text-slate-600">{r.txn}</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-800">{r.value}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Neighbors */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-800">Neighbors</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">180 Days</span>
              <span className="text-[10px] font-medium text-slate-500 border border-slate-200 rounded px-1.5 py-0.5">Volume</span>
              <span className="text-[10px] font-semibold bg-slate-900 text-white rounded px-1.5 py-0.5">Txn Count</span>
            </div>
          </div>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-3 py-1.5 text-slate-400 font-medium">#</th>
                <th className="text-left px-2 py-1.5 text-slate-400 font-medium">Address</th>
                <th className="text-right px-2 py-1.5 text-slate-400 font-medium">Inflow</th>
                <th className="text-right px-2 py-1.5 text-slate-400 font-medium">Outflow</th>
                <th className="text-right px-3 py-1.5 text-blue-500 font-medium">Net Flow</th>
              </tr>
            </thead>
            <tbody>
              {neighborRows.map((r, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: step >= 16 ? 1 : 0 }}
                  transition={{ delay: i * 0.08 }} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-3 py-1.5 text-slate-400">{i + 1}</td>
                  <td className="px-2 py-1.5 text-blue-600 truncate max-w-[110px]">{r.addr}</td>
                  <td className="px-2 py-1.5 text-right text-slate-600">{r.inflow}</td>
                  <td className="px-2 py-1.5 text-right text-slate-600">{r.outflow}</td>
                  <td className={cn("px-3 py-1.5 text-right font-semibold", r.neg ? "text-red-500" : "text-emerald-600")}>{r.net}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Risk verdict ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: step >= 17 ? 1 : 0, y: step >= 17 ? 0 : 6 }}
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
        <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
          <Activity className="w-2.5 h-2.5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-amber-900">Risk Verdict — Elevated (Score 73 / 100)</p>
          <p className="text-[10px] text-amber-700 mt-0.5">High outflow concentration to Lido validators · velocity threshold exceeded · counterparty review recommended.</p>
        </div>
        <div className="rounded-full bg-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-800 shrink-0">73 / 100</div>
      </motion.div>

      <AnimatePresence>
        {done && (
          <motion.div key="rerun" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-2.5 w-full">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs text-muted-foreground">Analysis complete · heatmap · dApps · neighbours · risk verdict</span>
            </div>
            <button onClick={restart}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-blue-600 border border-slate-200 rounded-md px-3 py-1.5 bg-white hover:bg-blue-50/50 hover:border-blue-200 transition-colors shrink-0">
              <RotateCcw className="w-3 h-3" />
              Re-run
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChatInterface() {
  const router = useRouter()
  const [inputValue, setInputValue] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SAMPLE_INPUTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent, text: string) => {
    e.preventDefault()
    if (!text.trim()) return
    const encoded = encodeURIComponent(text)
    router.push(`/chat?prompt=${encoded}`)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => handleSubmit(e, inputValue)} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused ? "" : SAMPLE_INPUTS[placeholderIndex]}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-400">Quick examples:</p>
        <div className="grid gap-2">
          {SAMPLE_INPUTS.slice(0, 3).map((example, i) => (
            <button
              key={i}
              onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent, example)}
              className="text-left px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-xs text-slate-700 font-medium transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

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

export default function WalletRiskPage() {
  const [activePanel, setActivePanel] = useState<"how" | "analyze" | null>("how")
  const [howStarted, setHowStarted] = useState(true)

  return (
    <ProtectedRoute>
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>

      <div className="flex flex-col px-6 py-6 gap-3 max-w-5xl mx-auto w-full">
        <div className="space-y-1 pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Wallet Risk Scoring</p>
          <h1 className="text-2xl font-bold text-foreground">Wallet Risk Scoring</h1>
          <p className="text-sm text-muted-foreground">
            Score any wallet address against sanctions lists, behavioural patterns, and counterparty exposure in seconds.
            Understand transaction history, dApp interactions, and high-risk neighbour clusters at a glance.
            Generate risk verdicts and exportable reports for due diligence or regulatory filings.
          </p>
        </div>

        <Accordion
          title="How it works"
          meta="4 agents · risk verdict"
          open={activePanel === "how"}
          onOpenChange={(o) => { setActivePanel(o ? "how" : null); if (o) setHowStarted(true) }}
        >
          {howStarted && <WorkflowDiagram />}
        </Accordion>

        <Accordion
          title="Analyze yourself"
          open={activePanel === "analyze"}
          onOpenChange={(o) => setActivePanel(o ? "analyze" : null)}
        >
          <ChatInterface />
        </Accordion>
      </div>
    </ProtectedRoute>
  )
}
