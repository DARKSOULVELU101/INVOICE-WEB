"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GenvouchLoader } from "@/components/brand/GenvouchLoader";
import { GenvouchLogo } from "@/components/brand/GenvouchLogo";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  FileText,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
  ArrowRight,
  Globe,
  LayoutDashboard,
  Zap,
} from "lucide-react";

function DashboardMock() {
  return (
    <div className="gv-card overflow-hidden text-left shadow-2xl">
      <div className="flex items-center justify-between border-b border-border bg-white/80 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>
        <div className="hidden items-center gap-2 text-xs font-medium text-ink-500 sm:flex">
          <span className="h-8 w-28 rounded-lg bg-ink-100" />
          <span className="h-8 w-28 rounded-lg bg-ink-100" />
          <span className="h-8 w-24 rounded-lg bg-brand-500/15" />
        </div>
      </div>
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        <div className="hidden border-r border-border bg-surface-subtle p-4 md:block">
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-brand-500/10 px-3 py-2">
            <span className="h-6 w-6 rounded-md bg-gradient-to-br from-brand-500 to-accent-600" />
            <div>
              <p className="text-xs font-semibold text-ink-900">Studio Inc.</p>
              <p className="text-[10px] text-ink-400">Organization</p>
            </div>
          </div>
          {["Dashboard", "Invoices", "Customers", "Team", "Settings"].map((item, i) => (
            <div
              key={item}
              className={`mb-1 rounded-md px-3 py-2 text-xs font-medium ${i === 1 ? "bg-ink-900 text-white" : "text-ink-500"}`}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Outstanding", value: "$12,480", change: "+8%", up: true },
              { label: "Paid this month", value: "$6,250", change: "+21%", up: true },
              { label: "Overdue", value: "$1,120", change: "-3%", up: false },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-border bg-white p-4">
                <p className="text-[11px] font-medium text-ink-400">{k.label}</p>
                <p className="mt-1 font-display text-xl font-bold tracking-tight text-ink-900">{k.value}</p>
                <p className={`mt-1 text-[11px] font-semibold ${k.up ? "text-emerald-600" : "text-rose-600"}`}>{k.change}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-border">
            <div className="grid grid-cols-[1fr_90px_90px_110px] gap-3 border-b border-border bg-surface-subtle px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              <span>Invoice</span>
              <span className="text-center">Status</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Sent</span>
            </div>
            {mockInvoices.map((r) => (
              <div key={r} className="grid grid-cols-[1fr_90px_90px_110px] items-center gap-3 border-b border-border/60 px-4 py-3 text-xs last:border-0">
                <span className="font-semibold text-ink-900">INV-2024-000{r}</span>
                <span className={`mx-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle(r)}`}>
                  {["Paid", "Pending", "Sent", "Overdue", "Draft"][r % 5]}
                </span>
                <span className="text-right font-medium text-ink-900">${(842 * r).toLocaleString()}</span>
                <span className="text-right text-ink-400">Apr {r + 2}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const mockInvoices = [1, 2, 3, 4, 5];

function statusStyle(r: number) {
  const s = r % 5;
  const map = [
    "bg-emerald-50 text-emerald-700",
    "bg-amber-50 text-amber-700",
    "bg-blue-50 text-blue-700",
    "bg-red-50 text-red-700",
    "bg-slate-100 text-slate-600",
  ];
  return map[s];
}

function AuditMock() {
  const rows = [
    { icon: FileText, text: "Invoice INV-2024-0008 created", time: "2 min ago", color: "bg-blue-50 text-blue-600" },
    { icon: Mail, text: "Invoice INV-2024-0008 sent to Acme Inc.", time: "1 min ago", color: "bg-violet-50 text-violet-600" },
    { icon: Globe, text: "Invoice INV-2024-0008 viewed", time: "just now", color: "bg-amber-50 text-amber-600" },
    { icon: BadgeCheck, text: "Payment received", time: "39s ago", color: "bg-emerald-50 text-emerald-600" },
    { icon: ShieldCheck, text: "Member invited · jane@acme.com", time: "3 min ago", color: "bg-slate-100 text-slate-500" },
  ];
  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-900">Audit trail</h3>
          <p className="text-xs text-ink-400">Every critical action, logged and transparent</p>
        </div>
        <span className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-semibold text-ink-500">Live</span>
      </div>
      <div className="relative space-y-5 pl-1">
        <span className="absolute left-[13px] top-2 bottom-2 w-px bg-border" />
        {rows.map((r, i) => (
          <div key={i} className="relative flex items-start gap-4">
            <span className={`z-10 mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full ${r.color}`}>
              <r.icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-800">{r.text}</p>
              <p className="text-xs text-ink-400">{r.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <GenvouchLoader />
      <main className="relative min-h-screen overflow-hidden bg-white">
        {/* Backdrop */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand-soft blur-3xl opacity-70" />
          <div className="absolute inset-y-0 right-0 hidden h-full w-1/2 bg-gradient-to-l from-brand-50/60 to-transparent lg:block" />
        </div>

        {/* Nav */}
        <header className="absolute inset-x-0 top-0 z-10">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <GenvouchLogo size="sm" />
            <div className="hidden items-center gap-8 text-sm font-medium text-ink-600 md:flex">
              <a href="#features" className="transition-colors hover:text-ink-900">Features</a>
              <a href="#security" className="transition-colors hover:text-ink-900">Security</a>
              <a href="#pricing" className="transition-colors hover:text-ink-900">Pricing</a>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-36 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/70 px-4 py-1.5 text-xs font-semibold text-brand-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            The modern business operating system for invoices
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl lg:text-7xl"
          >
            Invoicing that feels like
            <span className="text-gradient"> your business grows itself.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-500"
          >
            GENVOUCH Invoice Studio is a premium business operating system for freelancers,
            agencies, startups and SMEs. Create print-ready invoices, share secure public links,
            send branded email, and collect payments — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="h-12 px-7 text-base">
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="h-12 px-7 text-base">
                Tour the workspace
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-16 w-full max-w-5xl"
          >
            <DashboardMock />
          </motion.div>
        </section>

        {/* Features */}
        <section id="features" className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Everything you need</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              Premium tools. Zero friction.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className="gv-card gv-card-hover group p-7"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-white shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Security / bottom */}
        <section id="security" className="border-t border-border bg-surface-subtle">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Enterprise-grade</p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink-900">
                Security built into the foundation.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-ink-500">
                Every invoice share is protected by signed tokens instead of raw IDs. Your SMTP
                credentials and API keys never leave the server. Roles and permissions keep teams
                working safely together.
              </p>
              <ul className="mt-8 space-y-4">
                {security.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm font-medium text-ink-700">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-semantic-success" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="gv-card overflow-hidden"
            >
              <AuditMock />
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">
            <div className="flex items-center gap-3">
              <GenvouchLogo size="sm" showWordmark={false} />
              <div>
                <p className="text-sm font-semibold text-ink-900">GENVOUCH Invoice Studio</p>
                <p className="text-xs text-ink-400">Powered by GENVOUCH TECHNOLOGIES PVT</p>
              </div>
            </div>
            <p className="text-xs text-ink-400">
              © {new Date().getFullYear()} GENVOUCH TECHNOLOGIES PVT. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

const features = [
  {
    icon: LayoutDashboard,
    title: "Professional workspaces",
    description: "Organizations, teams, roles and multiple businesses under one roof. Built for growth from day one.",
  },
  {
    icon: FileText,
    title: "Print-ready PDFs",
    description: "Brand-consistent, pixel-perfect invoices generated server-side. Your logo, colors and typography preserved.",
  },
  {
    icon: Mail,
    title: "Branded email delivery",
    description: "Send invoices directly from your own domain. Server-side delivery with delivery logs — never expose credentials.",
  },
  {
    icon: Globe,
    title: "Secure public sharing",
    description: "Share an invoice with a signed link. No clutter, no raw IDs. Clients see a clean, branded view.",
  },
  {
    icon: Wallet,
    title: "Payment ready",
    description: "Architectured for Stripe, Razorpay, PayPal, UPI and crypto — without rewriting a single invoice.",
  },
  {
    icon: BadgeCheck,
    title: "Full audit trail",
    description: "Created, edited, sent, viewed, downloaded, deleted — every critical action is tracked and transparent.",
  },
];

const security = [
  "Signed tokens for every public invoice link",
  "Server-side email with protected credentials",
  "Role-based access for org members and teams",
  "Zod validation on every input, server-side",
  "Security headers and best-practice session handling",
];