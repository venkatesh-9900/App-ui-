"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2, Mail, ArrowRight, UserPlus, Building2, Copy, CheckCircle2,
  Search, LogIn, ShieldCheck, Bell, Bot, FileText, Globe, Lock,
  Menu, X, Code2, Key, Users, Layers, BarChart2, ChevronRight,
  Webhook, Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AuthMode = 'default' | 'signin' | 'signup' | 'retrieve-org';
type AuthStep = 'email' | 'otp' | 'result';
type UserType = 'member' | 'admin';

// ─── Static data ──────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Overview",    id: "overview" },
  { label: "Products",    id: "products" },
  { label: "Developers",  id: "developers" },
  { label: "Enterprise",  id: "enterprise" },
  { label: "Docs",        id: "docs" },
  { label: "About",       id: "about" },
];

const capabilities = [
  { icon: Bot,        title: "Multi-Agent System",      desc: "Natural language queries drive multi-step agents that investigate wallets, transactions, and counterparty risk end-to-end." },
  { icon: ShieldCheck, title: "Compliance Automation", desc: "Integrate with AML sanctions screening, and velocity checks enforce enterprise policy with zero manual overhead." },
  { icon: Bell,       title: "Address and Transaction Monitoring",      desc: "Watchlist alerts across 15+ blockchain networks." },
  { icon: FileText,   title: "Automated Reports",       desc: "Generate detailed investigative reports and auto-escalate to operations teams with full human-in-the-loop oversight." },
];

const terminalLines = [
  { text: "$ analyze 0x7f3a4d2e...c9b2",                  cls: "text-white" },
  { text: "  Initializing agent pipeline…",               cls: "text-slate-500" },
  { text: "  ✓  Agent 1: Risk score 73 / 100 — elevated", cls: "text-emerald-400" },
  { text: "  ✓  Agent 2: Routing to compliance review",   cls: "text-emerald-400" },
  { text: "  ⚠  Agent 3: Velocity threshold exceeded",    cls: "text-amber-400" },
  { text: "  ⚑  Compliance breach detected",              cls: "text-red-400" },
  { text: "  →  TKT-2026-8841 created  ·  Ops Team",     cls: "text-blue-400" },
  { text: "  →  Alert dispatched  ·  Security Team (+4)", cls: "text-blue-400" },
];

const enterpriseFeatures = [
  { icon: Key,      title: "Enterprise SSO / SAML 2.0",  desc: "Okta, Azure AD, Google Workspace, Ping — any SAML 2.0 provider works out of the box." },
  { icon: Users,    title: "Role-Based Access Control",   desc: "Fine-grained permissions for analysts, compliance officers, and administrators." },
  { icon: BarChart2, title: "Audit Logs & Reporting",     desc: "Full audit trail of every query, agent decision, and escalation for regulatory review." },
  { icon: Layers,   title: "Private Cloud Deployment",    desc: "Deploy within your own VPC or on-premise. Your transaction data never leaves your perimeter." },
];

const devFeatures = [
  { icon: Code2,   title: "REST API",  desc: "Full programmatic access to analyze addresses, transactions, and risk signals at scale." },
  { icon: Webhook, title: "Webhooks",  desc: "Real-time event push when monitored addresses trigger alerts or policy thresholds." },
  { icon: Network, title: "SDK",       desc: "TypeScript and Python SDKs with full type coverage for rapid integration." },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "bg-slate-950/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)]" : "bg-slate-950"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <button onClick={() => scrollTo("overview")} className="shrink-0 flex items-center">
          <Image src="/logo.png" alt="Kernel Mind" width={130} height={38} className="invert" priority />
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/5 cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Login — top-right */}
        <Button
          onClick={onLogin}
          size="sm"
          className="shrink-0 cursor-pointer hidden md:inline-flex"
        >
          Sign In
          <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>

        {/* Mobile toggle */}
        <button
          className="md:hidden ml-auto text-slate-400 hover:text-white"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-slate-900 border-t border-slate-800"
          >
            <div className="px-6 py-3 flex flex-col gap-0.5">
              {navLinks.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="py-2.5 text-sm text-slate-300 hover:text-white text-left cursor-pointer"
                >
                  {label}
                </button>
              ))}
              <div className="pt-2 pb-1">
                <Button onClick={onLogin} className="w-full cursor-pointer" size="sm">
                  Sign In
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function TerminalMockup() {
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60">
        {["bg-red-500/40", "bg-amber-500/40", "bg-green-500/40"].map((c) => (
          <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
        ))}
        <span className="ml-2 text-[10px] text-slate-500 font-mono tracking-wide">kernel-mind ~ intelligence</span>
      </div>
      <div className="p-5 space-y-2">
        {terminalLines.map(({ text, cls }, i) => (
          <motion.p
            key={i}
            className={cn("font-mono text-[12px] leading-relaxed", cls)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.38 + 0.4, duration: 0.25 }}
          >
            {text}
          </motion.p>
        ))}
        <motion.span
          className="inline-block w-1.5 h-3.5 bg-slate-400 ml-4"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: terminalLines.length * 0.38 + 0.5 }}
        />
      </div>
    </div>
  );
}

function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section
      id="overview"
      className="bg-slate-950 pt-32 pb-20 relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-400 border border-slate-700 rounded-full px-3 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
            AI-native · Multi-chain · Enterprise-ready
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-4">
            Blockchain intelligence<br />
            <span className="text-slate-400">built for compliance.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-md mb-8">
            A self-improving multi-agent force that collectively analyze and reason transactions, addresses, and wallets, enforce enterprise policy, and escalate to your operations team — automatically, end to end.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onGetStarted} size="lg" className="cursor-pointer group">
              Get started
              <ChevronRight className="ml-1.5 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <button
              onClick={() => document.getElementById("docs")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 cursor-pointer"
            >
              View documentation <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Right: terminal */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="hidden md:block"
        >
          <TerminalMockup />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Products & Services ──────────────────────────────────────────────────────

function ProductsSection() {
  return (
    <section id="products" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Products & Services</p>
          <h2 className="text-3xl font-bold text-slate-900">Built for the full compliance workflow</h2>
          <p className="mt-2 text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            From first alert to final report, every step is automated by purpose-built agents with human oversight at critical junctions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-5 hover:border-slate-200 hover:shadow-sm transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center mb-4">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-14 grid grid-cols-3 gap-6 border-t border-slate-100 pt-10">
          {[
            { value: "15+", label: "Blockchain networks supported", sub: "Ethereum, Bitcoin, Solana, and more" },
            { value: "< 2s", label: "Average agent response time",   sub: "Across full pipeline execution" },
            { value: "100%", label: "Fully automated workflow",      sub: "Zero manual queuing or routing" },
          ].map(({ value, label, sub }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="text-sm font-medium text-slate-700 mt-1">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Developers ───────────────────────────────────────────────────────────────

function DevelopersSection() {
  const snippet = `curl -X POST https://api.kernelmind.io/v1/analyze \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "address": "0x7f3a4d2e...c9b2",
    "chain": "ethereum",
    "policy_set": "default"
  }'`;

  return (
    <section id="developers" className="bg-slate-950 py-20 relative overflow-hidden"
      style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-start">
        {/* Left: code block */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Developers</p>
          <h2 className="text-3xl font-bold text-white mb-3">Enterprise Integration Ready</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
            A clean REST API, real-time webhooks, and full-coverage SDKs. Embed blockchain intelligence directly into your existing compliance tooling.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/50">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] text-slate-400 font-mono">REST API · v1</span>
            </div>
            <pre className="p-4 text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
              <code>{snippet}</code>
            </pre>
          </div>
        </div>

        {/* Right: feature cards */}
        <div className="flex flex-col gap-4 mt-10 md:mt-14">
          {devFeatures.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Enterprise ───────────────────────────────────────────────────────────────

function EnterpriseSection() {
  return (
    <section id="enterprise" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
        {/* Left: feature grid */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Enterprise Integration</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Enterprise-grade, out of the box</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Deploy with confidence. Kernel Mind meets the security, compliance, and operational requirements of regulated financial institutions.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {enterpriseFeatures.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-slate-100 p-4 hover:border-slate-200 hover:shadow-sm transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center mb-3">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">{title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: CTA card */}
        <div className="rounded-2xl bg-slate-950 p-8 relative overflow-hidden"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Talk to us</p>
          <h3 className="text-2xl font-bold text-white mb-3 leading-snug">
            Ready to deploy blockchain intelligence across your organisation?
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Our team works with compliance, risk, and technology stakeholders to configure policies, map integrations, and deploy to production.
          </p>
          <div className="flex flex-col gap-2">
            {["Custom policy configuration", "Dedicated onboarding support", "99.9% uptime SLA"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
          <Button className="mt-7 cursor-pointer" variant="outline">
            Contact Sales
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Docs + Footer ────────────────────────────────────────────────────────────

function SiteFooter() {
  const cols = [
    { heading: "Product", links: ["Overview", "AI Agents", "Compliance", "Monitoring", "Reports"] },
    { heading: "Developers", links: ["REST API", "Webhooks", "SDK", "Changelog", "Status"] },
    { heading: "Enterprise", links: ["SSO / SAML", "RBAC", "Audit Logs", "Deployment", "SLA"] },
    { heading: "Company", links: ["About", "Blog", "Careers", "Privacy", "Terms"] },
  ];

  return (
    <footer id="about" className="bg-slate-950 border-t border-slate-800">
      <div id="docs" className="max-w-6xl mx-auto px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Image src="/logo.png" alt="Kernel Mind" width={110} height={24} className="invert mb-3" />
          <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">
            AI-native blockchain intelligence for compliance teams.
          </p>
        </div>

        {/* Link columns */}
        {cols.map(({ heading, links }) => (
          <div key={heading}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3">{heading}</p>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <span className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">{link}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-[11px] text-slate-600">
          <span>© 2026 Kernel Mind. All rights reserved.</span>
          <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Multi-chain · 15+ networks</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { isAuthenticated, isLoading: globalLoading, login, requestOTP, loginWithOTP, loginUserWithOTP, signupRoot, retrieveOrg } = useAuth();
  const router = useRouter();

  const [showAuth, setShowAuth] = useState(false);
  const [ssoConnecting, setSsoConnecting] = useState(false);
  const [mode, setMode] = useState<AuthMode>('default');
  const [step, setStep] = useState<AuthStep>('email');
  const [userType, setUserType] = useState<UserType>('member');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultOrgId, setResultOrgId] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [copied, setCopied] = useState(false);

  if (globalLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  const resetFlow = () => {
    setMode('default'); setStep('email'); setUserType('member');
    setEmail(""); setOtp(""); setOrganizationId("");
    setResultOrgId(""); setResultMessage(""); setCopied(false);
  };

  const openAuth = () => { resetFlow(); setSsoConnecting(false); setShowAuth(true); };
  const closeAuth = () => { setShowAuth(false); setSsoConnecting(false); resetFlow(); };
  const cancelSSO = () => setSsoConnecting(false);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode); setStep('email'); setUserType('member');
    setOtp(""); setOrganizationId(""); setResultOrgId(""); setResultMessage(""); setCopied(false);
  };

  const handleSSOLogin = async () => {
    setSsoConnecting(true);
    await login();
    setSsoConnecting(false); // only reached if login() fails (success redirects away)
  };

  const handleGetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email"); return; }
    if (mode === 'signin' && !organizationId) { toast.error("Please enter your Organization ID"); return; }
    setIsLoading(true);
    try {
      await requestOTP({ email,
        successTask: () => { setStep('otp'); toast.success("OTP sent to your email"); },
        errorTask: (error) => toast.error(error || "Failed to send OTP"),
      });
    } finally { setIsLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) { toast.error("OTP must be exactly 6 digits"); return; }
    setIsLoading(true);
    try {
      await signupRoot({ email, otp,
        successTask: (data) => { setResultOrgId(data.organization_id || ""); setResultMessage(data.message); setStep('result'); toast.success("Organization created successfully"); },
        conflictTask: (data) => { setResultOrgId(data.organization_id || ""); setResultMessage(data.message); setStep('result'); toast.info("You already have an organization"); },
        errorTask: (error) => toast.error(error || "Signup failed"),
      });
    } finally { setIsLoading(false); }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) { toast.error("OTP must be exactly 6 digits"); return; }
    setIsLoading(true);
    const loginFn = userType === 'admin' ? loginWithOTP : loginUserWithOTP;
    try {
      await loginFn({ email, otp, organizationId,
        successTask: () => {
          const returnUrl = sessionStorage.getItem("return_url");
          if (returnUrl && returnUrl !== '/') { sessionStorage.removeItem("return_url"); router.push(returnUrl); }
          else { router.push('/home'); }
        },
        errorTask: (error) => toast.error(error || "Login failed"),
      });
    } finally { setIsLoading(false); }
  };

  const handleRetrieveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) { toast.error("OTP must be exactly 6 digits"); return; }
    setIsLoading(true);
    try {
      await retrieveOrg({ email, otp,
        successTask: (message) => { setResultMessage(message); setStep('result'); toast.success("Organization ID sent to your email"); },
        errorTask: (error) => toast.error(error || "Failed to retrieve organization"),
      });
    } finally { setIsLoading(false); }
  };

  const copyOrgId = async () => {
    try {
      await navigator.clipboard.writeText(resultOrgId);
      setCopied(true); toast.success("Copied");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Could not copy — please copy manually"); }
  };

  const modeConfig = {
    signin:        { title: "Sign In",                icon: LogIn },
    signup:        { title: "Create Organization",    icon: UserPlus },
    'retrieve-org': { title: "Retrieve Organization ID", icon: Search },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onLogin={openAuth} />

      <main className="flex-1">
        <HeroSection onGetStarted={openAuth} />
        <ProductsSection />
        <DevelopersSection />
        <EnterpriseSection />
      </main>

      <SiteFooter />

      {/* ── Auth modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeAuth(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.22 }}
              className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-7 relative"
            >
              {/* Close */}
              <button
                onClick={closeAuth}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {ssoConnecting ? (
                /* ── Enterprise Sign On intermediate screen ── */
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-5 py-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-foreground">Enterprise Sign On</h2>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[240px] leading-relaxed">
                      Connecting to your identity provider. You'll be redirected shortly.
                    </p>
                  </div>
                  <div className="w-full flex items-center gap-1.5 justify-center flex-wrap pt-1">
                    {["Okta", "Azure AD", "Google Workspace", "Ping"].map((p) => (
                      <span key={p} className="text-[10px] text-muted-foreground/60 bg-muted/60 border border-border/50 rounded px-1.5 py-0.5">
                        {p}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={cancelSSO}
                    className="w-full cursor-pointer"
                  >
                    Cancel
                  </Button>
                </motion.div>
              ) : mode === 'default' ? (
                <div className="flex flex-col gap-4">
                  <div className="mb-1">
                    <h2 className="text-lg font-semibold text-foreground">Sign in to Kernel Mind</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Access your workspace</p>
                  </div>

                  {/* SSO — primary */}
                  <div className="space-y-2">
                    <Button
                      data-testid="login-sso-button"
                      onClick={handleSSOLogin}
                      size="lg"
                      className="w-full h-11 font-semibold group cursor-pointer"
                    >
                      <Lock className="w-4 h-4 mr-2 shrink-0" />
                      Continue with Enterprise SSO
                      <ArrowRight className="ml-auto w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                    <div className="flex items-center gap-1.5 justify-center flex-wrap">
                      {["Okta", "Azure AD", "Google Workspace", "Ping"].map((p) => (
                        <span key={p} className="text-[10px] text-muted-foreground/60 bg-muted/60 border border-border/50 rounded px-1.5 py-0.5">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2.5 text-muted-foreground/70 font-medium">or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" onClick={() => switchMode('signin')} size="lg" className="w-full h-11 cursor-pointer">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign in with email OTP
                    </Button>
                    <p className="text-[11px] text-center text-muted-foreground">
                      We'll send a one-time code to your work email
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-1 text-xs text-muted-foreground">
                    <button type="button" onClick={() => switchMode('signup')} className="hover:text-foreground transition-colors cursor-pointer">
                      Create organization
                    </button>
                    <span className="text-border">·</span>
                    <button type="button" onClick={() => switchMode('retrieve-org')} className="hover:text-foreground transition-colors cursor-pointer">
                      Find org ID
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Button variant="ghost" size="sm" onClick={resetFlow} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground cursor-pointer">
                    <ArrowRight className="mr-2 w-4 h-4 rotate-180" /> Back
                  </Button>

                  <div className="flex items-center gap-2 mb-5">
                    {(() => { const Ic = modeConfig[mode].icon; return <Ic className="w-4 h-4 text-primary" />; })()}
                    <h2 className="text-lg font-semibold">{modeConfig[mode].title}</h2>
                  </div>

                  {step === 'email' && (
                    <form onSubmit={handleGetOTP} className="space-y-4">
                      {mode === 'signin' && (
                        <div className="flex rounded-lg border border-border overflow-hidden">
                          {(['member', 'admin'] as UserType[]).map((t) => (
                            <button key={t} type="button" onClick={() => setUserType(t)}
                              className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${userType === t ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                            >
                              {t === 'member' ? 'Team Member' : 'Admin'}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" required />
                        </div>
                      </div>
                      {mode === 'signin' && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="org-id">Organization ID</Label>
                            <button type="button" onClick={() => switchMode('retrieve-org')} className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                              Don&apos;t know your ID?
                            </button>
                          </div>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input id="org-id" type="text" placeholder="Enter your organization ID" value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} className="pl-10 h-11" required />
                          </div>
                        </div>
                      )}
                      <Button type="submit" disabled={isLoading} className="w-full h-11 cursor-pointer">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send OTP
                      </Button>
                    </form>
                  )}

                  {step === 'otp' && (
                    <form onSubmit={mode === 'signup' ? handleSignup : mode === 'signin' ? handleSignIn : handleRetrieveOrg} className="space-y-4">
                      <p className="text-sm text-muted-foreground">OTP sent to <span className="font-semibold text-foreground">{email}</span></p>
                      <div className="space-y-1.5">
                        <Label htmlFor="otp">One-Time Password</Label>
                        <Input id="otp" type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="h-11 tracking-[0.5em] text-center font-mono text-lg" maxLength={6} required autoFocus />
                      </div>
                      <Button type="submit" disabled={isLoading} className="w-full h-11 cursor-pointer">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === 'signup' ? 'Create Organization' : mode === 'signin' ? 'Sign In' : 'Retrieve Organization ID'}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => { setOtp(""); setStep('email'); }} className="w-full text-muted-foreground cursor-pointer">
                        Didn&apos;t receive code? Try again
                      </Button>
                    </form>
                  )}

                  {step === 'result' && (
                    <div className="space-y-5">
                      {mode === 'signup' && resultOrgId && (
                        <>
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-4 h-4" /><p className="text-sm font-medium">{resultMessage}</p>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-muted-foreground">Your Organization ID</Label>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 p-3 rounded-lg bg-muted font-mono text-sm break-all select-all">{resultOrgId}</div>
                              <Button variant="outline" size="icon" onClick={copyOrgId} className="shrink-0 cursor-pointer">
                                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Save this ID — you will need it to sign in.</p>
                          </div>
                          <Button onClick={() => { setOrganizationId(resultOrgId); switchMode('signin'); }} className="w-full h-11 cursor-pointer">
                            Continue to Sign In <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {mode === 'retrieve-org' && (
                        <>
                          <div className="flex items-center gap-2 text-green-600"><Mail className="w-4 h-4" /><p className="text-sm font-medium">{resultMessage}</p></div>
                          <p className="text-sm text-muted-foreground">Check your inbox for your organization ID.</p>
                          <Button onClick={() => switchMode('signin')} className="w-full h-11 cursor-pointer">
                            Back to Sign In <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
