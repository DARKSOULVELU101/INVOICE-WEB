import type { InvoiceStatus } from "@/types";

export const invoiceStatusMeta: Record<
  InvoiceStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  DRAFT: { label: "Draft", color: "#66768f", bg: "#eef0f3", dot: "#66768f" },
  PENDING: { label: "Pending", color: "#b45309", bg: "#fffbeb", dot: "#f59e0b" },
  SENT: { label: "Sent", color: "#1d4ed8", bg: "#eff6ff", dot: "#2563eb" },
  PARTIALLY_PAID: { label: "Partially Paid", color: "#6d28d9", bg: "#f5f3ff", dot: "#7c3aed" },
  PAID: { label: "Paid", color: "#15803d", bg: "#ecfdf3", dot: "#16a34a" },
  OVERDUE: { label: "Overdue", color: "#b91c1c", bg: "#fef2f2", dot: "#dc2626" },
  CANCELLED: { label: "Cancelled", color: "#475569", bg: "#f1f5f9", dot: "#94a3b8" },
};

export function statusLabel(status: string) {
  return invoiceStatusMeta[status as InvoiceStatus]?.label ?? status;
}