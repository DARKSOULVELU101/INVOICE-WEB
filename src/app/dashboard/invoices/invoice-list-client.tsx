"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, FileText, Paperclip, Trash2, MoreVertical, Copy, ExternalLink, Send, Plus } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { formatCurrency } from "@/core/lib/utils";
import { InvoiceBadge } from "@/components/badge/invoice-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { deleteInvoiceAction } from "./actions";

type InvoiceRow = {
  id: string;
  number: string;
  status: string;
  total: number;
  currency: string;
  issuedDate: string;
  dueDate: string | null;
  customerName: string;
  businessName: string;
  publicToken: string | null;
};

export function InvoiceListClient({ invoices }: { invoices: InvoiceRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesQuery =
        !query ||
        inv.number.toLowerCase().includes(query.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [invoices, query, statusFilter]);

  const totals = useMemo(() => {
    return filtered.reduce((acc, inv) => acc + inv.total, 0);
  }, [filtered]);

  const onDelete = async (id: string) => {
    setBusyId(id);
    await deleteInvoiceAction(id);
    setBusyId(null);
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by number or customer…"
            className="pl-9"
            aria-label="Search invoices"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "DRAFT", "PENDING", "SENT", "PAID", "OVERDUE"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                statusFilter === s
                  ? "bg-ink-900 text-white shadow-sm"
                  : "border border-border bg-white text-ink-500 hover:border-ink-300 hover:text-ink-700"
              )}
            >
              {s === "ALL" ? "All" : s[0] + s.slice(1).toLowerCase().replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState hasInvoices={invoices.length > 0} />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-subtle text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3">Issued</th>
                    <th className="px-5 py-3">Due</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <TableRow
                      key={inv.id}
                      inv={inv}
                      onDelete={onDelete}
                      busy={busyId === inv.id}
                      openMenu={openMenu === inv.id}
                      setMenu={(id) => setOpenMenu((cur) => (cur === id ? null : id))}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-surface-subtle">
                    <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-ink-700">
                      {filtered.length} result{filtered.length === 1 ? "" : "s"}
                    </td>
                    <td className="px-5 py-3 text-right font-display font-bold text-ink-900">
                      {formatCurrency(totals, "USD")}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((inv) => (
              <motion.div key={inv.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/dashboard/invoices/${inv.id}`} className="font-display font-semibold text-ink-900 hover:text-brand-700">
                        {inv.number}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink-500">{inv.customerName}</p>
                    </div>
                    <InvoiceBadge status={inv.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-ink-400">
                      <p>Issued {new Date(inv.issuedDate).toLocaleDateString()}</p>
                      {inv.dueDate && <p>Due {new Date(inv.dueDate).toLocaleDateString()}</p>}
                    </div>
                    <p className="font-display text-lg font-bold text-ink-900">{formatCurrency(inv.total, inv.currency || "USD")}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">View</Button>
                    </Link>
                    <Link href={`/dashboard/invoices/${inv.id}?edit=1`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">Edit</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-ink-400 hover:text-semantic-danger"
                      aria-label={`Delete ${inv.number}`}
                      onClick={() => {
                        if (confirm(`Delete ${inv.number}? This cannot be undone.`)) onDelete(inv.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TableRow({
  inv,
  onDelete,
  busy,
  openMenu,
  setMenu,
}: {
  inv: InvoiceRow;
  onDelete: (id: string) => void;
  busy: boolean;
  openMenu: boolean;
  setMenu: (id: string | null) => void;
}) {
  const shareUrl = inv.publicToken ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/i/${inv.publicToken}` : null;
  return (
    <tr className="group border-b border-border/60 transition-colors hover:bg-surface-subtle/60 last:border-0">
      <td className="px-5 py-3.5">
        <Link href={`/dashboard/invoices/${inv.id}`} className="inline-flex items-center gap-2 font-semibold text-ink-900 hover:text-brand-700">
          <Paperclip className="h-3.5 w-3.5 text-ink-300" />
          {inv.number}
        </Link>
      </td>
      <td className="px-5 py-3.5 text-ink-600">{inv.customerName}</td>
      <td className="px-5 py-3.5"><InvoiceBadge status={inv.status} /></td>
      <td className="px-5 py-3.5 text-right font-semibold text-ink-900">{formatCurrency(inv.total, inv.currency)}</td>
      <td className="px-5 py-3.5 text-ink-500">{new Date(inv.issuedDate).toLocaleDateString()}</td>
      <td className="px-5 py-3.5 text-ink-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
      <td className="px-5 py-3.5">
        <div className="relative flex items-center justify-end gap-1">
          {inv.publicToken && (
            <>
              <a
                href={shareUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${inv.number} public link`}
                className="gv-focus-ring rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl ?? "")}
                aria-label="Copy share link"
                className="gv-focus-ring rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-brand-700"
              >
                <Copy className="h-4 w-4" />
              </button>
            </>
          )}
          <div className="relative">
            <button
              onClick={() => setMenu(inv.id)}
              aria-label="More actions"
              aria-expanded={openMenu}
              className="gv-focus-ring rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {openMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-white shadow-xl"
                >
                  <Link href={`/dashboard/invoices/${inv.id}?edit=1`} className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-surface-subtle">
                    <FileText className="h-4 w-4" /> Edit
                  </Link>
                  <Link href={`/dashboard/invoices/${inv.id}/send`} className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-surface-subtle">
                    <Send className="h-4 w-4" /> Send invoice
                  </Link>
                  <button
                    onClick={() => onDelete(inv.id)}
                    disabled={busy}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-semantic-danger hover:bg-semantic-dangerBg disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </td>
    </tr>
  );
}

function EmptyState({ hasInvoices }: { hasInvoices: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-20 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <FileText className="h-7 w-7" />
      </span>
      <h3 className="mt-5 font-display text-xl font-semibold text-ink-900">
        {hasInvoices ? "No matching invoices" : "No invoices yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-ink-400">
        {hasInvoices
          ? "Try adjusting your search or filters."
          : "Create your first invoice — it takes under a minute."}
      </p>
      {!hasInvoices && (
        <Link href="/dashboard/invoices/new" className="mt-6">
          <Button>
            <Plus className="h-4 w-4" /> Create your first invoice
          </Button>
        </Link>
      )}
    </div>
  );
}