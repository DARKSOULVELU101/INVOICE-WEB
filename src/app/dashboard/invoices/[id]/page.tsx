import { notFound, redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { getInvoiceWithDetails } from "@/core/data/organization";
import { InvoiceViewer } from "./invoice-viewer";

export const metadata = { title: "Invoice details" };

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { edit?: string; created?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orgId = (session.user as any).defaultOrg?.id;
  if (!orgId) redirect("/dashboard/setup");

  const invoice = await getInvoiceWithDetails(orgId, params.id);
  if (!invoice) notFound();

  const [businesses, customers] = await Promise.all([
    prisma.business.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, defaultCurrency: true, logo: true },
    }),
    prisma.customer.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, company: true, email: true },
    }),
  ]);

  return (
    <InvoiceViewer
      invoice={serde(invoice)!}
      businesses={businesses}
      customers={customers}
      initialEdit={searchParams.edit === "1"}
      justCreated={searchParams.created === "1"}
    />
  );
}

function serde(invoice: Awaited<ReturnType<typeof getInvoiceWithDetails>>) {
  if (!invoice) return null;
  return {
    ...invoice,
    issuedDate: invoice.issuedDate.toISOString(),
    dueDate: invoice.dueDate?.toISOString() ?? null,
    viewedAt: invoice.viewedAt?.toISOString() ?? null,
    sentAt: invoice.sentAt?.toISOString() ?? null,
    paidAt: invoice.paidAt?.toISOString() ?? null,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    lineItems: invoice.lineItems.map((li) => ({
      ...li,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      discount: li.discount,
      taxRate: li.taxRate,
      amount: li.amount,
    })),
  };
}