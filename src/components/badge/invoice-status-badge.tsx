"use client";

import { Badge } from "@/components/ui/badge";
import { invoiceStatusMeta } from "@/core/lib/invoice-status";

export function invoiceBadgeVariant(status: string) {
  switch (status) {
    case "PAID": return "success" as const;
    case "OVERDUE": return "danger" as const;
    case "PENDING": return "warning" as const;
    case "SENT": return "info" as const;
    case "PARTIALLY_PAID": return "accent" as const;
    default: return "neutral" as const;
  }
}

export function InvoiceBadge({ status }: { status: string }) {
  const meta = invoiceStatusMeta[status as keyof typeof invoiceStatusMeta] ?? invoiceStatusMeta.DRAFT;
  return (
    <Badge variant={invoiceBadgeVariant(status)} dot>
      {meta.label}
    </Badge>
  );
}