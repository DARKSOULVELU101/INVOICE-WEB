import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { getDashboardStats } from "@/core/data/organization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { invoiceStatusMeta } from "@/core/lib/invoice-status";
import { formatCurrency } from "@/core/lib/utils";
import {
  ArrowUpRight,
  FileText,
  Plus,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export const metadata = { title: "Overview" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orgId = (session.user as any).defaultOrg?.id;
  if (!orgId) redirect("/dashboard/setup");

  const stats = await getDashboardStats(orgId);
  const currency = "USD";

  const kpis = [
    {
      label: "Outstanding",
      value: formatCurrency(stats.outstanding, currency),
      hint: `${stats.openInvoices} open invoices`,
      icon: Wallet,
      tone: "text-brand-700 bg-brand-50",
    },
    {
      label: "Collected",
      value: formatCurrency(stats.paid, currency),
      hint: "All time",
      icon: TrendingUp,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Overdue",
      value: formatCurrency(stats.overdue, currency),
      hint: "Needs follow-up",
      icon: AlertTriangle,
      tone: "text-rose-700 bg-rose-50",
    },
    {
      label: "Customers",
      value: String(stats.customers),
      hint: "Saved contacts",
      icon: Users,
      tone: "text-violet-700 bg-violet-50",
    },
  ];

  return (
    <div className="animate-slide-up">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">Good to see you.</h1>
          <p className="mt-1 text-sm text-ink-500">Here&apos;s how your cash flow is shaping up.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/invoices">
            <Button variant="secondary" size="md">
              <FileText className="h-4 w-4" /> View invoices
            </Button>
          </Link>
          <Link href="/dashboard/invoices/new">
            <Button size="md">
              <Plus className="h-4 w-4" /> New invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} hover className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-ink-400">{kpi.label}</p>
                <p className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-900">{kpi.value}</p>
                <p className="mt-1 text-xs text-ink-400">{kpi.hint}</p>
              </div>
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${kpi.tone}`}>
                <kpi.icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent invoices */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent invoices</CardTitle>
            </div>
            <Link href="/dashboard/invoices" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800">
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {stats.invoices.length === 0 ? (
              <EmptyInvoices />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                      <th className="pb-3 pr-4">Invoice</th>
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4 text-right">Amount</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.invoices.map((inv) => {
                      const meta = invoiceStatusMeta[inv.status as keyof typeof invoiceStatusMeta] ?? invoiceStatusMeta.DRAFT;
                      return (
                        <tr key={inv.id} className="border-b border-border/60 last:border-0">
                          <td className="py-3 pr-4">
                            <Link href={`/dashboard/invoices/${inv.id}`} className="font-semibold text-ink-900 transition-colors hover:text-brand-700">
                              {inv.number}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 text-ink-600">{inv.customer.company || inv.customer.name}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={badgeVariant(inv.status)} dot>
                              {meta.label}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-right font-semibold text-ink-900">
                            {formatCurrency(inv.total, currency)}
                          </td>
                          <td className="py-3 text-right text-ink-500">
                            {new Date(inv.issuedDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions / status */}
        <div className="space-y-6">
          <Card className="border-none bg-gradient-to-br from-brand-700 via-accent-500 to-accent-200 p-6 text-white shadow-lg">
            <CheckCircle2 className="h-8 w-8 opacity-90" />
            <h3 className="mt-3 font-display text-lg font-semibold">Create your next invoice</h3>
            <p className="mt-1 text-sm text-white/80">
              Branded to your business, ready to sign and send in under a minute.
            </p>
            <Link href="/dashboard/invoices/new" className="mt-5 inline-block">
              <Button variant="secondary" size="md" className="bg-white text-brand-700 hover:bg-white/90">
                <Plus className="h-4 w-4" /> New invoice
              </Button>
            </Link>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trust & safety</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-ink-600">
                {[
                  "Shared links are protected by signed tokens",
                  "Email credentials never leave the server",
                  "Every action is audit-logged",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-semantic-success" />
                    {t}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function badgeVariant(status: string) {
  switch (status) {
    case "PAID": return "success" as const;
    case "OVERDUE": return "danger" as const;
    case "PENDING": return "warning" as const;
    case "SENT": return "info" as const;
    case "PARTIALLY_PAID": return "accent" as const;
    default: return "neutral" as const;
  }
}

function EmptyInvoices() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-subtle px-6 py-14 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <FileText className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">No invoices yet</h3>
      <p className="mt-1 max-w-xs text-sm text-ink-400">
        Create your first branded invoice and send it in seconds.
      </p>
      <Link href="/dashboard/invoices/new" className="mt-5">
        <Button size="sm">
          <Plus className="h-4 w-4" /> Create your first invoice
        </Button>
      </Link>
    </div>
  );
}