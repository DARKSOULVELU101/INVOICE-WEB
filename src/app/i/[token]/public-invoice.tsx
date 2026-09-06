"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, ShieldCheck, FileDown } from "lucide-react";
import { formatCurrency } from "@/core/lib/utils";
import { cn } from "@/core/lib/utils";
import { GenvouchMark } from "@/components/brand/GenvouchMark";
import { Badge } from "@/components/ui/badge";

type PublicInvoice = {
  id: string;
  number: string;
  type: string;
  status: string;
  currency: string;
  issuedDate: string;
  dueDate: string | null;
  subtotal: number;
  discount: number;
  discountType: string;
  taxTotal: number;
  total: number;
  notes: string | null;
  terms: string | null;
  lineItems: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    amount: number;
    sortOrder: number;
  }[];
  business: {
    name: string;
    legalName?: string | null;
    email?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    taxId?: string | null;
    logo?: string | null;
    upiId?: string | null;
    bankName?: string | null;
    bankAccountNo?: string | null;
    bankIFSC?: string | null;
    defaultCurrency?: string | null;
  };
  customer: {
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    taxId?: string | null;
  };
  organization: { name: string; slug: string; logo?: string | null };
};

export function PublicInvoiceSheet({ invoice, token }: { invoice: PublicInvoice; token: string }) {
  const [downloading, setDownloading] = useState(false);
  const currency = invoice.currency || invoice.business.defaultCurrency || "USD";
  const title =
    invoice.type === "PROFORMA" ? "Proforma Invoice" : invoice.type === "ESTIMATE" ? "Estimate" : "Invoice";

  const download = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/public/${invoice.id}/pdf?token=${encodeURIComponent(token)}`, { method: "GET" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(`/api/public/${invoice.id}/pdf`, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-subtle/70 py-6 sm:py-10">
      {/* Header */}
      <header className="mx-auto mb-6 flex w-full max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <GenvouchMark className="h-8 w-8" gradientId="public-g" />
          <div className="leading-none">
            <p className="font-display text-sm font-bold tracking-tight text-ink-900">GENVOUCH</p>
            <p className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-ink-400">Invoice Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-xs font-medium text-ink-400 sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Secure link
          </span>
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ink-800 active:scale-[0.98]"
          >
            <FileDown className="h-4 w-4" /> {downloading ? "Preparing…" : "Download PDF"}
          </button>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-600 via-accent-400 to-accent-200" />
        <div className="p-6 sm:p-10">
          {/* Head */}
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              {invoice.business.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={invoice.business.logo} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-xl font-bold text-white">
                  {(invoice.business.name || "G")[0].toUpperCase()}
                </span>
              )}
              <div>
                <p className="font-display text-lg font-bold text-ink-900">{invoice.business.name}</p>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-400">
                  GENVOUCH TECHNOLOGIES PVT
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-brand-600">{title.toUpperCase()}</p>
              <p className="mt-1 font-mono text-sm font-semibold text-ink-700">{invoice.number}</p>
              <div className="mt-2 flex justify-end">
                <StatusPill status={invoice.status} />
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink-400">From</p>
              <p className="text-sm font-semibold text-ink-900">{invoice.business.legalName || invoice.business.name}</p>
              {invoice.business.email && <p className="text-sm text-ink-500">{invoice.business.email}</p>}
              {invoice.business.phone && <p className="text-sm text-ink-500">{invoice.business.phone}</p>}
              {(invoice.business.addressLine1 || invoice.business.city) && (
                <p className="text-sm text-ink-500">
                  {[invoice.business.addressLine1, invoice.business.addressLine2, invoice.business.city].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink-400">Bill to</p>
              <p className="text-sm font-semibold text-ink-900">{invoice.customer.company || invoice.customer.name}</p>
              {invoice.customer.email && <p className="text-sm text-ink-500">{invoice.customer.email}</p>}
              {(invoice.customer.addressLine1 || invoice.customer.city) && (
                <p className="text-sm text-ink-500">
                  {[invoice.customer.addressLine1, invoice.customer.addressLine2, invoice.customer.city, invoice.customer.postalCode].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="mt-8 grid grid-cols-2 gap-3 rounded-xl bg-surface-subtle p-4 sm:grid-cols-3">
            <Cell label="Invoice no." value={invoice.number} />
            <Cell label="Issue date" value={new Date(invoice.issuedDate).toLocaleDateString("en-US", { dateStyle: "medium" })} />
            <Cell label="Due date" value={invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-US", { dateStyle: "medium" }) : "On receipt"} />
          </div>

          {/* Items */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="bg-ink-900 text-white">
                  <th className="rounded-l-lg px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                  <th className="px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider">Rate</th>
                  <th className="rounded-r-lg px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, i) => (
                  <tr key={item.id} className={cn("border-b border-border/60", i % 2 === 0 && "bg-white")}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{item.description}</p>
                      {item.taxRate > 0 && <p className="text-xs text-ink-400">Tax {item.taxRate}%</p>}
                    </td>
                    <td className="px-4 py-3 text-center text-ink-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-ink-600">{formatCurrency(item.unitPrice, currency)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink-900">{formatCurrency(item.amount, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex justify-between text-sm text-ink-500"><span>Subtotal</span><span className="font-medium text-ink-800">{formatCurrency(invoice.subtotal, currency)}</span></div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm text-ink-500">
                  <span>{invoice.discountType === "percentage" ? `Discount (${invoice.discount}%)` : "Discount"}</span>
                  <span className="font-medium text-ink-800">− {formatCurrency(discountAmount(invoice), currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-ink-500"><span>Tax</span><span className="font-medium text-ink-800">{formatCurrency(invoice.taxTotal, currency)}</span></div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-ink-900 px-5 py-3.5 text-white">
                <span className="text-xs font-bold uppercase tracking-wider">Total</span>
                <span className="font-display text-xl font-bold">{formatCurrency(invoice.total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(invoice.notes || invoice.terms) && (
            <div className="mt-8 space-y-4">
              {invoice.notes && (
                <div>
                  <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink-400">Notes</p>
                  <p className="whitespace-pre-wrap text-sm text-ink-600">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink-400">Terms</p>
                  <p className="whitespace-pre-wrap text-sm text-ink-600">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Payment details */}
          {(invoice.business.upiId || invoice.business.bankAccountNo) && (
            <div className="mt-6 rounded-xl border border-border bg-surface-subtle p-4">
              <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink-400">Payment details</p>
              <p className="text-sm text-ink-600">
                {invoice.business.bankName ? `Bank: ${invoice.business.bankName}` : ""}
                {invoice.business.bankAccountNo ? ` · Account: ${invoice.business.bankAccountNo}` : ""}
                {invoice.business.bankIFSC ? ` · IFSC: ${invoice.business.bankIFSC}` : ""}
                {invoice.business.upiId ? ` · UPI: ${invoice.business.upiId}` : ""}
              </p>
            </div>
          )}

          <p className="mt-10 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
            Generated with <span className="font-semibold text-brand-600">GENVOUCH Invoice Studio</span>
            <span className="mx-1">·</span>
            Powered by GENVOUCH TECHNOLOGIES PVT
          </p>
        </div>
      </motion.main>

      <footer className="mx-auto mt-6 flex items-center justify-center gap-2 px-4 pb-8 text-center text-xs text-ink-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        This link is protected by a signed token and expires when the invoice is closed.
      </footer>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink-800">{value}</p>
    </div>
  );
}

function statusVariant(status: string) {
  switch (status) {
    case "PAID": return "success" as const;
    case "OVERDUE": return "danger" as const;
    case "PENDING": return "warning" as const;
    case "SENT": return "info" as const;
    default: return "neutral" as const;
  }
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    DRAFT: "Draft", PENDING: "Pending", SENT: "Sent", PARTIALLY_PAID: "Partially paid", PAID: "Paid", OVERDUE: "Overdue", CANCELLED: "Cancelled",
  };
  return map[status] ?? status;
}

function StatusPill({ status }: { status: string }) {
  return (
    <Badge variant={statusVariant(status)} dot>{statusLabel(status)}</Badge>
  );
}

function discountAmount(invoice: PublicInvoice) {
  return invoice.discountType === "percentage"
    ? (invoice.subtotal * invoice.discount) / 100
    : invoice.discount;
}