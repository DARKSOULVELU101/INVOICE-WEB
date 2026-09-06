import type { InvoiceStatus } from "@/types";

export const invoiceStatusMeta: Record<
  InvoiceStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  DRAFT: { label: "Draft", color: "#85809A", bg: "#EEEBF5", dot: "#85809A" },
  PENDING: { label: "Pending", color: "#A86F2C", bg: "#FAF4E9", dot: "#D79A5A" },
  SENT: { label: "Sent", color: "#4A5FB6", bg: "#EEF3FB", dot: "#3B63A8" },
  PARTIALLY_PAID: { label: "Partially Paid", color: "#8F7BE0", bg: "#EEE9FA", dot: "#8F7BE0" },
  PAID: { label: "Paid", color: "#2F7D5C", bg: "#EAF5F0", dot: "#3E9D7B" },
  OVERDUE: { label: "Overdue", color: "#B84454", bg: "#FBEFF1", dot: "#CB6E84" },
  CANCELLED: { label: "Cancelled", color: "#6B6783", bg: "#F1EEF8", dot: "#A9A4BC" },
};

export function statusLabel(status: string) {
  return invoiceStatusMeta[status as InvoiceStatus]?.label ?? status;
}