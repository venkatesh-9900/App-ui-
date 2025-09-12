import { AlertTriangle, ArrowRightLeft, BarChart, Bell, Bot, ClipboardCheck, Home, Network, Search, Settings, ShieldCheck, Wallet, History, Sliders, Gauge, Users, Cog, Key, Code, Book, Plug, CreditCard, Building, } from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    items: [
      { name: "Home", href: "/", icon: Home },
      { name: "Analyze", href: "/analyze", icon: BarChart },
      { name: "Chat", href: "/chat", icon: Bot },
      { name: "Investigate", href: "/investigate", icon: Search },
    ],
  },
  {
    name: "Monitoring",
    items: [
      { name: "Transaction Analysis", href: "/transaction-analysis", icon: ArrowRightLeft },
      { name: "Wallet Screening", href: "/wallet-screening", icon: Wallet },
      { name: "Network Analytics", href: "/network-analytics", icon: Network },
    ],
  },
  {
    name: "Intelligence",
    items: [
     
      { name: "Threat Detection", href: "/threat-detection", icon: AlertTriangle },
      { name: "Risk Assessment", href: "/risk-assessment", icon: ShieldCheck },
      { name: "Compliance", href: "/compliance", icon: ClipboardCheck },
    ],
  },
  {
    name: "Alerts & Notifications",
    items: [
      { name: "Alert Subscriptions", href: "/alerts", icon: Bell },
      { name: "Notification Settings", href: "/notification-settings", icon: Settings },
      { name: "Alert History", href: "/alert-history", icon: History },
    ],
  },
  {
    name: "Agentic AI",
    items: [
    //   { name: "AI Agents", href: "/ai-agents", icon: Bot },
      { name: "Configuration", href: "/ai-config", icon: Sliders },
      { name: "Performance", href: "/ai-performance", icon: Gauge },
    ],
  },
  {
    name: "Administration",
    items: [
      { name: "User Management", href: "/user-management", icon: Users },
      { name: "Settings", href: "/settings", icon: Cog },
      { name: "Permissions", href: "/permissions", icon: Key },
    ],
  },
  {
    name: "Developer",
    items: [
      { name: "API Keys", href: "/api-keys", icon: Code },
      { name: "Documentation", href: "/documentation", icon: Book },
      { name: "Integration Guides", href: "/integration", icon: Plug },
    ],
  },
  {
    name: "Account",
    items: [
      // { name: "Profile", href: "/profile", icon: User },
      { name: "Billing", href: "/billing", icon: CreditCard },
      { name: "Enterprise Setup", href: "/enterprise", icon: Building },
    ],
  },
];
export default navigation;