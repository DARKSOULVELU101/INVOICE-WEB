import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { listInvoices } from "@/core/data/organization";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/core/lib/utils";
import { Plus } from "lucide-react";
import { InvoiceListClient } from "./invoice-list-client";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orgId = (session.user as any).defaultOrg?.id;
  if (!orgId) redirect("/dashboard/setup");

  const invoices = await listInvoices(orgId);

  return (
    <div className="animate-slide-up">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">Invoices</h1>
          <p className="mt-1 text-sm text-ink-500">
            {invoices.length} invoice{invoices.length === 1 ? "" : "s"} · manage, send and track
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button size="md">
            <Plus className="h-4 w-4" /> New invoice
          </Button>
        </Link>
      </div>

      <InvoiceListClient invoices={serde(invoices)} />
    </div>
  );
}

function serde(invoices: Awaited<ReturnType<typeof listInvoices>>) {
  return invoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    total: inv.total,
    currency: inv.currency,
    issuedDate: inv.issuedDate.toISOString(),
    dueDate: inv.dueDate?.toISOString() ?? null,
    customerName: inv.customer.company || inv.customer.name,
    businessName: inv.business.name,
    publicToken: inv.publicToken,
  }));
}