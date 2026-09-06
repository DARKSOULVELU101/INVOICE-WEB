"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Pencil,
  Send,
  Share2,
  Copy,
  ExternalLink,
  Check,
  Trash2,
  ReceiptText,
  Mail,
  Clock,
  CalendarDays,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/field";
import { invoiceStatusMeta, statusLabel } from "@/core/lib/invoice-status";
import { formatCurrency } from "@/core/lib/utils";
import { cn } from "@/core/lib/utils";
import { sendInvoiceAction, recordPublicTokenAction } from "./actions";
import { InvoiceForm } from "../new/invoice-form";
import { deleteInvoiceAction } from "../actions";
import { motion as motionTokens } from "@/core/design";

type ViewerInvoice = {
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
  amountDue: number;
  notes: string | null;
  terms: string | null;
  reference: string | null;
  publicToken: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
    id: string;
    name: string;
    legalName?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
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
    defaultCurrency: string;
  };
  customer: {
    id: string;
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    taxId?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  organization: { name: string; slug: string; logo?: string | null };
};

export function InvoiceViewer({
  invoice,
  businesses,
  customers,
  initialEdit,
  justCreated,
}: {
  invoice: ViewerInvoice;
  businesses: any[];
  customers: any[];
  initialEdit?: boolean;
  justCreated?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(initialEdit ?? false);
  const [sendOpen, setSendOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState<"share" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendMail, setSendMail] = useState(invoice.customer.email ?? "");
  const [sendMsg, setSendMsg] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const currency = invoice.currency || invoice.business.defaultCurrency || "USD";
  const meta = invoiceStatusMeta[invoice.status as keyof typeof invoiceStatusMeta] ?? invoiceStatusMeta.DRAFT;
  const shareUrl = invoice.publicToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/i/${invoice.publicToken}`
    : null;

  // Build initial form values when entering edit mode
  const initialForm = useMemo(
    () => ({
      id: invoice.id,
      number: invoice.number,
      type: invoice.type as any,
      status: invoice.status as any,
      businessId: invoice.business.id,
      customerId: invoice.customer.id,
      issuedDate: invoice.issuedDate.split("T")[0],
      dueDate: invoice.dueDate ? invoice.dueDate.split("T")[0] : "",
      currency: invoice.currency,
      discountType: (invoice.discountType as any) ?? "fixed",
      discount: invoice.discount,
      reference: invoice.reference ?? "",
      notes: invoice.notes ?? "",
      terms: invoice.terms ?? "",
      items: invoice.lineItems.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        discount: li.discount,
        taxRate: li.taxRate,
      })),
    }),
    [invoice]
  );

  const onDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pdf`, { method: "GET" });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      router.refresh();
    } catch {
      window.open(`/api/invoices/${invoice.id}/pdf`, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const onSend = async () => {
    if (!invoice.customer.email && !sendMail) {
      setSendError("This customer has no email. Add one to send the invoice.");
      return;
    }
    setSending(true);
    setSendError(null);
    setSendMsg(null);
    const res = await sendInvoiceAction(invoice.id, sendMail || invoice.customer.email || "");
    setSending(false);
    if (!res.ok) {
      setSendError(res.error ?? "Failed to send");
      return;
    }
    setSendMsg(`Invoice sent to ${sendMail || invoice.customer.email}`);
    setSendOpen(false);
    setSendMsg(res.message ?? "");
    router.refresh();
  };

  const onCopyShare = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied("share");
    setTimeout(() => setCopied(null), 1800);
  };

  const onDelete = async () => {
    if (!confirm(`Delete invoice ${invoice.number}? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await deleteInvoiceAction(invoice.id);
    if (res?.ok) {
      router.push("/dashboard/invoices");
      router.refresh();
    }
    setDeleting(false);
  };

  return (
    <div className="animate-slide-up">
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/invoices")}
            className="gv-focus-ring rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            aria-label="Back to invoices"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">{invoice.number}</h1>
            <Badge variant={badgeVariant(invoice.status)} dot>{meta.label}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md" onClick={onDownload} loading={downloading}>
            <FileDown className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="secondary" size="md" onClick={() => setSendOpen(true)}>
            <Send className="h-4 w-4" /> Send
          </Button>
          <Button variant="secondary" size="md" onClick={() => setShareOpen(true)}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
          {!editing && (
            <Button variant="secondary" size="md" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
          <Button variant="dangerGhost" size="icon" onClick={onDelete} loading={deleting} aria-label="Delete invoice">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {justCreated && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-semantic-successBg px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <Check className="h-4 w-4" />
          Invoice created. Add a public share link and send it to your customer.
        </motion.div>
      )}

      {sendMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-semantic-successBg px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <Check className="h-4 w-4" />
          {sendMsg}
        </motion.div>
      )}

      {editing ? (
        <InvoiceForm
          businesses={businesses}
          customers={customers}
          initial={{ ...initialForm, existing: true }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* Document preview */}
          <Card className="overflow-hidden">
            <InvoiceSheet invoice={invoice} currency={currency} />
          </Card>

          {/* Side panel */}
          <div className="space-y-4">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-ink-900">Summary</h3>
                <Badge variant={badgeVariant(invoice.status)} dot>{meta.label}</Badge>
              </div>
              <dl className="space-y-3 text-sm">
                <Row label="Subtotal" value={formatCurrency(invoice.subtotal, currency)} />
                {invoice.discount > 0 && (
                  <Row
                    label={invoice.discountType === "percentage" ? `Discount (${invoice.discount}%)` : "Discount"}
                    value={`− ${formatCurrency(discountAmount(invoice), currency)}`}
                  />
                )}
                <Row label="Tax" value={formatCurrency(invoice.taxTotal, currency)} />
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <dt className="font-medium text-ink-500">Total</dt>
                  <dd className="font-display text-xl font-bold text-ink-900">{formatCurrency(invoice.total, currency)}</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-5">
              <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Timeline</h3>
              <ul className="space-y-4">
                <TimelineItem
                  icon={ReceiptText}
                  label="Created"
                  value={formatDate(invoice.createdAt)}
                  tone="bg-brand-50 text-brand-600"
                />
                {invoice.sentAt && (
                  <TimelineItem icon={Mail} label="Sent" value={formatDate(invoice.sentAt)} tone="bg-violet-50 text-violet-600" />
                )}
                {invoice.viewedAt && (
                  <TimelineItem icon={ExternalLink} label="Viewed" value={formatDate(invoice.viewedAt)} tone="bg-amber-50 text-amber-600" />
                )}
                <TimelineItem icon={CalendarDays} label="Due" value={invoice.dueDate ? formatDate(invoice.dueDate) : "Open"} tone="bg-slate-50 text-slate-500" last />
              </ul>
            </Card>

            {shareUrl && (
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-ink-900">Public link</h3>
                  <Badge variant="success" dot>Secure</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    aria-label="Public share link"
                    className="flex-1 text-xs"
                  />
                  <Button variant="secondary" size="icon" onClick={onCopyShare} aria-label="Copy share link">
                    {copied === "share" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-ink-400">
                  Protected by a signed token. Anyone with this link can view this invoice.
                </p>
              </Card>
            )}

            <Card className="p-5">
              <h3 className="mb-2 font-display text-base font-semibold text-ink-900">Customer</h3>
              <p className="text-sm font-medium text-ink-800">{invoice.customer.company || invoice.customer.name}</p>
              {invoice.customer.email && <p className="mt-0.5 text-sm text-ink-500">{invoice.customer.email}</p>}
              {invoice.customer.phone && <p className="mt-0.5 text-sm text-ink-500">{invoice.customer.phone}</p>}
              <Link
                href={`/dashboard/customers/${invoice.customer.id}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
              >
                View customer <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* Send dialog */}
      <Dialog open={sendOpen} onClose={() => setSendOpen(false)} title="Send invoice" description={`Email ${invoice.number} to your customer`}>
        <form
          action={() => onSend()}
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
        >
          {sendError && (
            <p role="alert" className="rounded-lg bg-semantic-dangerBg px-3 py-2 text-sm font-medium text-semantic-danger">{sendError}</p>
          )}
          <div>
            <Label htmlFor="to">Recipient email</Label>
            <Input id="to" type="email" value={sendMail} onChange={(e) => setSendMail(e.target.value)} placeholder="client@company.com" />
          </div>
          <p className="text-sm text-ink-500">
            The customer will receive a branded email with a secure link to view and download this invoice as a PDF.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setSendOpen(false)}>Cancel</Button>
            <Button type="submit" loading={sending}>
              <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send invoice"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Share dialog */}
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} title="Share invoice" description="Get a secure link your customer can open">
        {shareUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-ink-500">
              Your public link is ready. Copy it and share it any way you prefer.
            </p>
            <div className="flex items-center gap-2">
              <Input value={shareUrl} readOnly onClick={(e) => (e.target as HTMLInputElement).select()} />
              <Button variant="secondary" size="icon" onClick={onCopyShare} aria-label="Copy">
                {copied === "share" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await recordPublicTokenAction(invoice.id);
              router.refresh();
              setShareOpen(false);
            }}
          >
            <p className="text-sm text-ink-500">
              Create a secure signed link to share this invoice with anyone — no app account required.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShareOpen(false)}>Cancel</Button>
              <Button type="submit">Generate secure link</Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

function InvoiceSheet({ invoice, currency }: { invoice: ViewerInvoice; currency: string }) {
  return (
    <div className="bg-white p-6 sm:p-10">
      {/* Head */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          {invoice.business.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={invoice.business.logo} alt="" className="h-11 w-11 rounded-lg object-cover" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 text-lg font-bold text-white">
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
          <p className="font-display text-2xl font-bold text-brand-600">
            {invoice.type === "PROFORMA" ? "PROFORMA" : invoice.type === "ESTIMATE" ? "ESTIMATE" : "INVOICE"}
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-ink-700">{invoice.number}</p>
        </div>
      </div>

      <div className="my-6 h-[2px] bg-gradient-to-r from-brand-600 to-accent-600" />

      {/* Parties */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink-400">From</p>
          <p className="text-sm font-semibold text-ink-900">{invoice.business.legalName || invoice.business.name}</p>
          {invoice.business.email && <p className="text-sm text-ink-500">{invoice.business.email}</p>}
          {invoice.business.phone && <p className="text-sm text-ink-500">{invoice.business.phone}</p>}
          {invoice.business.addressLine1 && (
            <p className="text-sm text-ink-500">{[invoice.business.addressLine1, invoice.business.addressLine2].filter(Boolean).join(", ")}</p>
          )}
          {(invoice.business.city || invoice.business.country) && (
            <p className="text-sm text-ink-500">
              {[invoice.business.city, invoice.business.state, invoice.business.postalCode, invoice.business.country].filter(Boolean).join(", ")}
            </p>
          )}
          {invoice.business.taxId && <p className="mt-1 text-sm font-medium text-ink-600">Tax ID: {invoice.business.taxId}</p>}
        </div>
        <div className="sm:text-right">
          <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink-400">Bill to</p>
          <p className="text-sm font-semibold text-ink-900">{invoice.customer.company || invoice.customer.name}</p>
          {invoice.customer.company && <p className="text-sm text-ink-500">{invoice.customer.name}</p>}
          {invoice.customer.email && <p className="text-sm text-ink-500">{invoice.customer.email}</p>}
          {(invoice.customer.addressLine1 || invoice.customer.city) && (
            <p className="text-sm text-ink-500">
              {[invoice.customer.addressLine1, invoice.customer.addressLine2, invoice.customer.city, invoice.customer.postalCode, invoice.customer.country].filter(Boolean).join(", ")}
            </p>
          )}
          {invoice.customer.taxId && <p className="mt-1 text-sm font-medium text-ink-600">Tax ID: {invoice.customer.taxId}</p>}
        </div>
      </div>

      {/* Meta */}
      <div className="mt-8 grid grid-cols-2 gap-3 rounded-xl bg-surface-subtle p-4 sm:grid-cols-3">
        <MetaCell label="Invoice no." value={invoice.number} />
        <MetaCell label="Issue date" value={new Date(invoice.issuedDate).toLocaleDateString("en-US", { dateStyle: "medium" })} />
        <MetaCell label="Due date" value={invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-US", { dateStyle: "medium" }) : "On receipt"} />
        {invoice.reference && <MetaCell label="Reference" value={invoice.reference} />}
        <MetaCell label="Currency" value={invoice.currency} />
      </div>

      {/* Items */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="rounded-lg bg-ink-900 text-white">
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
          <TotalRow label="Subtotal" value={formatCurrency(invoice.subtotal, currency)} />
          {invoice.discount > 0 && (
            <TotalRow
              label={invoice.discountType === "percentage" ? `Discount (${invoice.discount}%)` : "Discount"}
              value={`− ${formatCurrency(discountAmount(invoice), currency)}`}
            />
          )}
          <TotalRow label="Tax" value={formatCurrency(invoice.taxTotal, currency)} />
          <div className="mt-3 flex items-center justify-between rounded-xl bg-ink-900 px-5 py-3.5 text-white">
            <span className="text-xs font-bold uppercase tracking-wider">Total</span>
            <span className="font-display text-xl font-bold">{formatCurrency(invoice.total, currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes & payment */}
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

      <p className="mt-10 text-center text-xs text-ink-400">
        Generated with <span className="font-semibold text-brand-600">GENVOUCH Invoice Studio</span> · Powered by GENVOUCH TECHNOLOGIES PVT
      </p>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink-800">{value}</p>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-800">{value}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-800">{value}</dd>
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  label,
  value,
  tone,
  last,
}: {
  icon: any;
  label: string;
  value: string;
  tone: string;
  last?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-medium text-ink-800">{label}</p>
        <p className="text-xs text-ink-400">{value}</p>
      </div>
      {!last && <span className="ml-auto h-2 w-2 rounded-full bg-border" />}
    </li>
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

function discountAmount(invoice: ViewerInvoice) {
  if (invoice.discountType === "percentage") {
    return (invoice.subtotal * invoice.discount) / 100;
  }
  return invoice.discount;
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}