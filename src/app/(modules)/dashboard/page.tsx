"use client"

import { useState, type ElementType, type ReactNode } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bot,
  ChevronDown,
  FileText,
  Sparkles,
  ShieldCheck,
  Users,
  Brain,
} from "lucide-react"

const widgets = [
  {
    title: "Transaction Analysis",
    description: "Open the transaction investigation flow and start a new analyst prompt.",
    icon: ShieldCheck,
    href: "/home",
    accent: "from-rose-500/20 via-orange-500/10 to-transparent",
    links: [
      { label: "Transaction Risk Analysis", href: "/home" },
      { label: "New Chat", href: "/chat?new=true" },
    ],
  },
  {
    title: "Wallet Risk Scoring",
    description: "Review wallet intelligence and address-level risk signals.",
    icon: Activity,
    href: "/web3/address",
    accent: "from-cyan-500/20 via-sky-500/10 to-transparent",
    links: [
      { label: "Address Analytics", href: "/web3/address" },
      { label: "Top Accounts", href: "/web3/top-accounts" },
      { label: "Wallet Monitoring", href: "/web3/address-activity" },
    ],
  },
  {
    title: "Airdrop Notifications",
    description: "Track airdrop activity and related alert streams.",
    icon: Bell,
    href: "/web3/address-activity-airdrop",
    accent: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
    links: [
      { label: "Airdrop Activity", href: "/web3/address-activity-airdrop" },
      { label: "Inbox", href: "/notifications/inbox" },
      { label: "Channels", href: "/notifications/channels" },
    ],
  },
  {
    title: "Identity Access",
    description: "Review users, groups, roles, and OAuth setup.",
    icon: Users,
    href: "/iam/users",
    accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
    links: [
      { label: "Users", href: "/iam/users" },
      { label: "Spaces", href: "/iam/groups" },
      { label: "Roles", href: "/iam/roles" },
    ],
  },
  {
    title: "Agent Management",
    description: "Inspect services, APIs, permissions, and mappings.",
    icon: Bot,
    href: "/operator/services",
    accent: "from-amber-500/20 via-yellow-500/10 to-transparent",
    links: [
      { label: "API Services", href: "/operator/services" },
      { label: "APIs", href: "/operator/apis" },
      { label: "Permissions", href: "/operator/permissions" },
      { label: "API Mappings", href: "/operator/mappings" },
    ],
  },
  {
    title: "Investigations",
    description: "Start a new chat or review ongoing sessions.",
    icon: FileText,
    href: "/chat?new=true",
    accent: "from-slate-500/20 via-slate-400/10 to-transparent",
    links: [
      { label: "New Chat", href: "/chat?new=true" },
      { label: "Chat Sessions", href: "/chat" },
    ],
  },
]

const sections = [
  {
    title: "Operations and Compliance",
    summary: "Core risk and monitoring workflows for analysts and compliance teams.",
    widgets: ["Transaction Analysis", "Wallet Risk Scoring", "Airdrop Notifications", "Investigations"],
  },
  {
    title: "Administration",
    summary: "Operational controls for identity and platform management.",
    widgets: ["Agent Management", "Identity Access"],
  },
]

const interactiveAnalysisLinks = [
  { label: "Investigate a transaction", href: "/chat?prompt=Find%20out%20everything%20about%20this%20transaction" },
  { label: "Review a wallet", href: "/chat?prompt=Is%20this%20wallet%20high%20risk%3F" },
  { label: "Monitor activity", href: "/chat?prompt=Show%20recent%20monitoring%20signals" },
]

const metrics = [
  { label: "MONITORED WALLETS", value: "128", delta: "▲ 6 today", deltaColor: "#5cd6a8" },
  { label: "OPEN INVESTIGATIONS", value: "14", delta: "3 escalated", deltaColor: "#e0c060" },
  { label: "TRANSACTIONS AT RISK", value: "32", delta: "▲ requires review", deltaColor: "#ff8a6a", highlight: true },
  { label: "AIRDROPS IDENTIFIED", value: "312", delta: "▲ 28 this cycle", deltaColor: "#5cd6a8" },
]

function WidgetCard({
  title,
  description,
  icon: Icon,
  href,
  links,
  accent,
}: {
  title: string
  description: string
  icon: ElementType
  href: string
  links: { label: string; href: string }[]
  accent: string
}) {
  return (
    <Card className="group relative h-full overflow-hidden border-white/60 bg-white/80 shadow-[0_1px_0_rgba(255,255,255,0.8),0_24px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_50px_-22px_rgba(59,130,246,0.45)]">
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${accent}`} />
      <CardHeader className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-slate-950 text-white shadow-lg shadow-slate-950/10 ring-1 ring-black/5">
            <Icon className="h-5 w-5" />
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            Open
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-lg tracking-tight">{title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SectionAccordion({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string
  summary: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)]">
        <CollapsibleTrigger asChild>
          <button className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 ${open ? "bg-slate-50 border-b-2 border-slate-200" : ""}`}>
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${open ? "bg-slate-900" : "bg-slate-300"}`} />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-800">{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{summary}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${open ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-500"}`}>
              {open ? "Collapse" : "Expand"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 pt-4">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_26%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(255,255,255,1)_100%)]">
        <div className="flex items-center gap-2 px-6 pt-5 md:hidden">
          <SidebarTrigger />
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
          <section
            style={{
              position: "relative",
              width: "100%",
              borderRadius: 26,
              overflow: "hidden",
              background: "#141b3d",
              border: "1px solid rgba(255,255,255,.06)",
              fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
            }}
          >
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}</style>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(900px 300px at 50% -40%, rgba(124,92,255,.22), transparent 70%)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: "linear-gradient(90deg,transparent,#7c5cff,#34c3d6,transparent)", opacity: 0.7 }} />

            <div style={{ position: "relative", padding: "40px 48px 0" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: 12, letterSpacing: ".22em", color: "#7c5cff" }}>
                  // OVERVIEW
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: 11, letterSpacing: ".1em", color: "#4d4b5e" }}>
                  RISK · MONITORING · IDENTITY · NOTIFICATIONS · AGENTS
                </span>
              </div>
              <h1 style={{ margin: "8px 0 0", fontSize: 48, fontWeight: 700, letterSpacing: "-.035em", color: "#ffffff", lineHeight: 0.95 }}>
                At a Glance<span style={{ color: "#615cff" }}>.</span>
              </h1>
            </div>

            <div
              style={{
                position: "relative",
                marginTop: 34,
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                borderTop: "1px solid rgba(255,255,255,.08)",
              }}
            >
              {metrics.map((m, i) => (
                <div
                  key={m.label}
                  style={{
                    padding: "26px 32px",
                    borderRight: i < metrics.length - 1 ? "1px solid rgba(255,255,255,.08)" : "none",
                    background: m.highlight ? "linear-gradient(180deg,rgba(255,120,90,.10),transparent)" : "transparent",
                  }}
                >
                  <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: ".13em", color: m.highlight ? "#f0a896" : "#797690" }}>
                    {m.label}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 54, fontWeight: m.highlight ? 700 : 600, letterSpacing: "-.03em", color: m.highlight ? "#ff9c84" : "#fff", lineHeight: 1, textShadow: m.highlight ? "0 0 28px rgba(255,120,90,.4)" : "none" }}>
                    {m.value}
                  </div>
                  <div style={{ marginTop: 8, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: 11, color: m.deltaColor }}>{m.delta}</div>
                </div>
              ))}
            </div>
          </section>

          {sections.map((section, index) => (
            <SectionAccordion
              key={section.title}
              title={section.title}
              summary={section.summary}
              defaultOpen={index === 0}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {widgets
                  .filter((widget) => section.widgets.includes(widget.title))
                  .map((widget) => (
                    <WidgetCard key={widget.title} {...widget} />
                  ))}
              </div>
            </SectionAccordion>
          ))}

          <SectionAccordion
            title="Interactive Analysis"
            summary="Jump into guided prompts and ad hoc investigation flows."
          >
            <Card className="overflow-hidden border-white/70 bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
              <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="relative overflow-hidden p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_26%)]" />
                  <div className="relative space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                      <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                      Prompt-driven analysis
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                        Investigate faster with guided prompts.
                      </h3>
                      <p className="max-w-xl text-sm leading-6 text-slate-600">
                        Use the interactive workspace to explore suspicious activity, compare wallets, and generate follow-up questions in one place.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {interactiveAnalysisLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 p-6 lg:border-l lg:border-t-0">
                  <div className="flex h-full flex-col justify-between gap-4 rounded-3xl bg-slate-950 p-6 text-white shadow-inner">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-white/70">
                        <Brain className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-[0.2em]">Workspace assistant</span>
                      </div>
                      <p className="text-lg font-semibold tracking-tight">
                        Start a conversational investigation or continue an existing one.
                      </p>
                      <p className="text-sm leading-6 text-white/68">
                        Turn a signal into a report, a ticket, or a deeper query chain without leaving the dashboard.
                      </p>
                    </div>
                    <Link
                      href="/chat?new=true"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
                    >
                      Open analysis workspace
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </SectionAccordion>

          <SectionAccordion
            title="Quick Entry Points"
            summary="Jump to the most common workflows from one place."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Analyze a transaction", href: "/home", icon: ShieldCheck },
                { label: "Open monitoring tools", href: "/web3/explorer", icon: Activity },
                { label: "Review inbox alerts", href: "/notifications/inbox", icon: Bell },
                { label: "Manage agent services", href: "/operator/services", icon: Bot },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                    {item.label}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </SectionAccordion>
        </div>
      </div>
    </ProtectedRoute>
  )
}
