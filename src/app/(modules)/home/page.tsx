"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProtectedRoute } from "@/components/protected-route";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Bot,
  Hash,
  ShieldCheck,
  FileText,
  Bell,
  Users,
  CheckCircle2,
  AlertTriangle,
  User,
  Activity,
  XCircle,
  ChevronDown,
  RotateCcw,
  ArrowRight,
  Send,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const SAMPLE_INPUTS = [
  "Enter transaction hash (e.g., 0xab12cd...)",
  "Enter wallet address (e.g., 0x742d35Cc...)",
  "Analyze transaction risks and compliance",
  "Check for sanctions exposure",
  "Review policy breaches and violations",
]

const prompts = [
  { title: "Find out latest news and information about '0xde.....8as' account address." },
  { title: 'Is this address "0xjr....w90" suspicious for making payments?' },
  {
    title:
      'Find me everything about this transaction "0xbtg.....aj5" as I want to understand the risks associated with parties and activities involved.',
  },
  {
    title:
      'Add "0xpr5.....yw1" into monitoring watchlist and flag any activity involved with any sanctioned wallets.',
  },
  { title: "What are recent activities from all the accounts and address I am monitoring?" },
  {
    title:
      "Create a detailed investigative report on USDC stablecoin and who are holding majority of its reserve?",
  },
  {
    title:
      'Notify me over email if any activity happens on "0x45d....yt3" in ethereum main net.',
  },
];

// ─── Animation hook ───────────────────────────────────────────────────────────

function useAnimation() {
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStep(-1);
    setDone(false);
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    async function run() {
      await wait(500);
      const gaps = [0, 1200, 1100, 1100, 1200, 1000, 1050];
      for (let i = 0; i < gaps.length && !cancelled; i++) {
        if (i > 0) await wait(gaps[i]);
        if (!cancelled) setStep(i);
      }
      if (!cancelled) setDone(true);
    }

    run();
    return () => { cancelled = true; };
  }, [runKey]);

  return { step, done, runKey, restart: () => setRunKey((k) => k + 1) };
}

// ─── Compact workflow primitives ──────────────────────────────────────────────

function HumanBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-semibold tracking-wide uppercase text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
      <User className="w-2 h-2" />
      Human in the loop
    </span>
  );
}

function AgentBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-medium text-blue-600/80 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5">
      <Bot className="w-2 h-2" />
      Agent
    </span>
  );
}

function PipelineArrow({ show }: { show: boolean }) {
  return (
    <div className="shrink-0 flex items-center justify-center" style={{ width: 20 }}>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <ArrowRight className="w-3.5 h-3.5 text-border" />
        </motion.div>
      )}
    </div>
  );
}

// ─── Compact pipeline step cards ─────────────────────────────────────────────

function InputStrip({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5"
    >
      <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center shrink-0">
        <Hash className="w-3 h-3 text-white" />
      </div>
      <code className="text-[11px] font-mono text-muted-foreground flex-1 truncate">
        0x7f3a4d2e9c1b8f06a5d39e7c2b4f1a8d6e9c3b5a
      </code>
      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        Live
      </span>
    </motion.div>
  );
}

function MiniConnector({ show }: { show: boolean }) {
  return (
    <div className="relative flex justify-center" style={{ height: 20 }}>
      <motion.div
        className="absolute top-0 w-px bg-border"
        initial={{ height: 0 }}
        animate={{ height: show ? 20 : 0 }}
        transition={{ duration: 0.2 }}
      />
      {show && (
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full bg-blue-400"
          style={{ left: "calc(50% - 3px)", top: 0 }}
          initial={{ top: 0, opacity: 1 }}
          animate={{ top: 14, opacity: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        />
      )}
    </div>
  );
}

interface StepCardProps {
  show: boolean;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  variant?: "default" | "violet" | "amber" | "red";
  extra?: React.ReactNode;
}

function StepCard({ show, icon: Icon, title, subtitle, badge, variant = "default", extra }: StepCardProps) {
  if (!show) return <div className="flex-1" />;

  const variantStyles = {
    default: "border-blue-100 bg-blue-50/40",
    violet: "border-violet-100 bg-violet-50/30",
    amber: "border-amber-200 bg-amber-50",
    red: "border-red-200 bg-red-50/60",
  };

  const iconStyles = {
    default: "bg-blue-600",
    violet: "bg-violet-700",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex-1 rounded-xl border px-3 py-2.5 flex flex-col gap-1.5 min-w-0", variantStyles[variant])}
    >
      <div className="flex items-center gap-1.5">
        <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0", iconStyles[variant])}>
          <Icon className="w-2.5 h-2.5 text-white" />
        </div>
        <p className="text-[11px] font-semibold text-foreground truncate">{title}</p>
        {badge && <span className="ml-auto shrink-0">{badge}</span>}
      </div>
      <p className="text-[10px] text-muted-foreground leading-tight">{subtitle}</p>
      {extra}
    </motion.div>
  );
}

// ─── Compact checks grid (Agent 3) ───────────────────────────────────────────

function ComplianceChecks() {
  const checks = [
    { label: "AML Policy", pass: true },
    { label: "Sanctions", pass: true },
    { label: "Velocity", pass: false },
    { label: "Counterparty", pass: false },
  ];
  return (
    <div className="grid grid-cols-2 gap-1">
      {checks.map(({ label, pass }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.12 + 0.2 }}
          className={cn(
            "flex items-center gap-1 rounded px-1.5 py-0.5 border",
            pass ? "bg-white border-slate-100" : "bg-red-50/80 border-red-200"
          )}
        >
          {pass
            ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
            : <XCircle className="w-2.5 h-2.5 text-red-400 shrink-0" />}
          <span className={cn("text-[9px] font-medium truncate", pass ? "text-foreground" : "text-red-600")}>
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Risk bar (Agent 1) ───────────────────────────────────────────────────────

function RiskBar() {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between">
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Risk</span>
        <span className="text-[9px] font-bold text-amber-600">73/100</span>
      </div>
      <div className="h-1 rounded-full bg-amber-100 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "73%" }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── Outcome + human-in-loop row ─────────────────────────────────────────────

function OutcomeRow({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 w-full"
    >
      {/* Cleared */}
      <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[11px] font-semibold text-emerald-800">Transaction Cleared</p>
          <p className="text-[9px] text-emerald-600">No policy violations</p>
        </div>
      </div>
      {/* Breach */}
      <div className="flex-1 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
        <div>
          <p className="text-[11px] font-semibold text-red-800">Compliance Violation</p>
          <p className="text-[9px] text-red-600">2 policy breaches · Escalating</p>
        </div>
      </div>
    </motion.div>
  );
}

function HumanLoopRow({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 w-full"
    >
      {/* spacer for cleared side */}
      <div className="flex-1" />
      {/* ticket + alert under breach side */}
      <div className="flex-1 flex gap-2">
        {/* Ticket */}
        <div className="flex-1 rounded-xl border-2 border-dashed border-slate-300 bg-white px-2.5 py-2 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center shrink-0">
              <FileText className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-foreground truncate">Ops Ticket</p>
              <p className="text-[9px] text-muted-foreground">TKT-2026-8841</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded bg-slate-50 border border-slate-100 px-1.5 py-1">
            <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            <span className="text-[9px] text-slate-500 truncate">Operations Team</span>
          </div>
          <HumanBadge />
        </div>
        {/* Alert */}
        <div className="flex-1 rounded-xl border-2 border-dashed border-slate-300 bg-white px-2.5 py-2 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center shrink-0">
              <Bell className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-foreground truncate">Alert Sent</p>
              <p className="text-[9px] text-muted-foreground">Email · Slack · SMS</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded bg-slate-50 border border-slate-100 px-1.5 py-1">
            <Users className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            <span className="text-[9px] text-slate-500 truncate">Security Team (+4)</span>
          </div>
          <HumanBadge />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Branch connector (between pipeline and outcomes) ─────────────────────────

function BranchConnector({ show }: { show: boolean }) {
  return (
    <div className="relative w-full" style={{ height: 24 }}>
      {show && (
        <svg width="100%" height="24" viewBox="0 0 480 24" preserveAspectRatio="none" className="absolute inset-0">
          <motion.line
            x1="120" y1="0" x2="120" y2="24"
            stroke="#e2e8f0" strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
          />
          <motion.line
            x1="360" y1="0" x2="360" y2="24"
            stroke="#fca5a5" strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.06 }}
          />
          <motion.text x="120" y="16" fontSize="8" fill="#94a3b8" textAnchor="middle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            NO BREACH
          </motion.text>
          <motion.text x="360" y="16" fontSize="8" fill="#f87171" textAnchor="middle" fontWeight="600"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            BREACH
          </motion.text>
        </svg>
      )}
    </div>
  );
}

// ─── Compact workflow diagram ─────────────────────────────────────────────────

function WorkflowDiagram() {
  const { step, done, runKey, restart } = useAnimation();

  return (
    <div key={runKey} className="w-full flex flex-col gap-2">
      {/* 1 · Input */}
      <InputStrip show={step >= 0} />

      <MiniConnector show={step >= 1} />

      {/* 2 · Pipeline row */}
      <div className="flex items-stretch gap-0">
        <StepCard
          show={step >= 1}
          icon={Bot}
          title="Preliminary Analysis"
          subtitle="Extracting attributes"
          badge={<AgentBadge />}
          extra={step >= 1 ? <RiskBar /> : undefined}
        />
        <PipelineArrow show={step >= 2} />
        <StepCard
          show={step >= 2}
          icon={Activity}
          title="Analysis Router"
          subtitle="Score 73/100 — routing to compliance"
          badge={<AgentBadge />}
        />
        <PipelineArrow show={step >= 3} />
        <StepCard
          show={step >= 3}
          icon={ShieldCheck}
          title="Compliance Agent"
          subtitle="Checking enterprise policies"
          badge={<AgentBadge />}
          variant="violet"
          extra={step >= 3 ? <ComplianceChecks /> : undefined}
        />
        <PipelineArrow show={step >= 4} />
        <StepCard
          show={step >= 4}
          icon={AlertTriangle}
          title="Policy Breach"
          subtitle="Velocity + counterparty failed"
          variant="amber"
          extra={
            step >= 4 ? (
              <div className="flex items-center gap-1">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-red-500"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-[9px] text-red-600 font-medium">Active</span>
              </div>
            ) : undefined
          }
        />
      </div>

      {/* 3 · Branch + outcomes */}
      <BranchConnector show={step >= 5} />
      <OutcomeRow show={step >= 5} />

      {/* 4 · Human-in-loop */}
      {step >= 6 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end w-full"
        >
          <div className="w-px h-3 bg-red-300 mx-auto" style={{ marginLeft: "75%" }} />
        </motion.div>
      )}
      <HumanLoopRow show={step >= 6} />

      {/* 5 · Done / Re-run */}
      <AnimatePresence>
        {done && (
          <motion.div
            key="rerun"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-2.5 w-full mt-1"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs text-muted-foreground">
                Workflow complete · 3 agents · 2 human handoffs
              </span>
            </div>
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-blue-600 border border-slate-200 rounded-md px-3 py-1.5 bg-white hover:bg-blue-50/50 hover:border-blue-200 transition-colors shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              Re-run
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Accordion section ────────────────────────────────────────────────────────

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

function Accordion({
  title,
  meta,
  children,
  open,
  onOpenChange,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => onOpenChange(!open)}
        className={cn(
          "flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50",
          open && "bg-slate-50 border-b-2 border-slate-200"
        )}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className={cn("h-2 w-2 rounded-full shrink-0", open ? "bg-slate-900" : "bg-slate-300")} />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-800">{title}</p>
            {meta && <p className="mt-0.5 text-xs text-slate-400">{meta}</p>}
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors shrink-0",
          open ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-500"
        )}>
          {open ? "Collapse" : "Expand"}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 pt-4">{children}</div>
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TransactionRiskAnalysisPage() {
  const [activePanel, setActivePanel] = useState<"how" | "analyze" | null>("how");
  const [howStarted, setHowStarted] = useState(true);

  return (
    <ProtectedRoute>
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>

      <div className="flex flex-col px-6 py-6 gap-3 max-w-5xl mx-auto w-full">
        <div className="space-y-1 pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Transaction Risk Analysis
          </p>
          <h1 className="text-2xl font-bold text-foreground">
            Transaction Risk Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            Investigate on-chain transactions end-to-end — from raw hash to risk verdict.
            Surface policy breaches, sanctions exposure, and counterparty red flags across any chain.
            Route findings directly to compliance workflows or export structured reports for audit.
          </p>
        </div>

        <Accordion
          title="How it works"
          meta="3 agents · human in the loop"
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
  );
}
