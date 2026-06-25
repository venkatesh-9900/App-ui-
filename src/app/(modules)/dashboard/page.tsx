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
    accent: "from-primary/20 via-primary/10 to-transparent",
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
    <Card className="group relative h-full overflow-hidden border-border bg-card/80 shadow-lg dark:shadow-none backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-primary/20">
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${accent}`} />
      <CardHeader className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-primary text-primary-foreground shadow-lg shadow-primary/10 ring-1 ring-border">
            <Icon className="h-5 w-5" />
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
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
              className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:bg-accent hover:text-accent-foreground"
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
      <div className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-sm">
        <CollapsibleTrigger asChild>
          <button className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-accent ${open ? "bg-accent/50 border-b-2 border-border" : ""}`}>
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${open ? "bg-primary" : "bg-muted-foreground/30"}`} />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{summary}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${open ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>
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
      {/* Dashboard Refinement
          Uses a custom neutral-950 gradient in dark mode so the dashboard adapts
          to a pure grey theme without relying on hardcoded dark blue colors. */}
      <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_26%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(255,255,255,1)_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.15),_transparent_26%),linear-gradient(180deg,_rgba(24,24,27,1)_0%,_rgba(9,9,11,1)_100%)]">
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

            <div className="relative pt-8 px-6 md:pt-10 md:px-12">
              <div className="flex items-baseline gap-3 md:gap-[18px] flex-wrap">
                <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }} className="text-[10px] md:text-xs tracking-[.22em] text-[#7c5cff]">
                  // OVERVIEW
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }} className="text-[9px] md:text-[11px] tracking-[.1em] text-[#4d4b5e]">
                  RISK · MONITORING · IDENTITY · NOTIFICATIONS · AGENTS
                </span>
              </div>
              <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight text-white leading-none">
                At a Glance<span className="text-[#615cff]">.</span>
              </h1>
            </div>

            <div className="overflow-hidden border-t border-white/10 mt-6 md:mt-8">
              <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] -mr-px -mb-px">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="p-6 md:px-8 border-b border-r border-white/10"
                    style={{
                      background: m.highlight ? "linear-gradient(180deg,rgba(255,120,90,.10),transparent)" : "transparent",
                    }}
                  >
                    <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }} className={`text-[10px] md:text-[10.5px] tracking-[.13em] ${m.highlight ? "text-[#f0a896]" : "text-[#797690]"}`}>
                      {m.label}
                    </div>
                    <div className={`mt-2 md:mt-2.5 text-4xl md:text-[54px] leading-none tracking-tight ${m.highlight ? "font-bold text-[#ff9c84]" : "font-semibold text-white"}`} style={{ textShadow: m.highlight ? "0 0 28px rgba(255,120,90,.4)" : "none" }}>
                      {m.value}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: m.deltaColor }} className="mt-2 text-[10px] md:text-[11px]">{m.delta}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {sections.map((section, index) => (
            <SectionAccordion
              key={section.title}
              title={section.title}
              summary={section.summary}
              defaultOpen={index === 0}
            >
              {/* Dashboard Refinement
                  Responsive grid layout ensures mobile screens (<768px) drop to 1 card per row
                  to prevent content compression, while preserving the existing 4-column desktop layout. */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
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
            <Card className="overflow-hidden border-border bg-gradient-to-br from-card via-card to-muted shadow-[0_18px_48px_-28px_rgba(15,23,42,0.28)] dark:shadow-none backdrop-blur">
              <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="relative overflow-hidden p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_26%)]" />
                  <div className="relative space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-foreground" />
                      Prompt-driven analysis
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                        Investigate faster with guided prompts.
                      </h3>
                      <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                        Use the interactive workspace to explore suspicious activity, compare wallets, and generate follow-up questions in one place.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {interactiveAnalysisLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:bg-accent hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/80 p-6 lg:border-l lg:border-t-0">
                  <div className="flex h-full flex-col justify-between gap-4 rounded-3xl bg-primary p-6 text-primary-foreground shadow-inner">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary-foreground/70">
                        <Brain className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-[0.2em]">Workspace assistant</span>
                      </div>
                      <p className="text-lg font-semibold tracking-tight">
                        Start a conversational investigation or continue an existing one.
                      </p>
                      <p className="text-sm leading-6 text-primary-foreground/70">
                        Turn a signal into a report, a ticket, or a deeper query chain without leaving the dashboard.
                      </p>
                    </div>
                    <Link
                      href="/chat?new=true"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-background px-4 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
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
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    {item.label}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </SectionAccordion>
        </div>
      </div>
    </ProtectedRoute>
  )
}
