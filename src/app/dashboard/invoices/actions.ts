"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { auditLog } from "@/core/lib/audit";

export async function deleteInvoiceAction(invoiceId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orgId = (session.user as any).defaultOrg?.id;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: orgId },
    select: { id: true, number: true, organizationId: true },
  });
  if (!invoice) return { ok: false, error: "Invoice not found" };

  await prisma.invoice.delete({ where: { id: invoice.id } });

  await auditLog("INVOICE_DELETED", `Invoice ${invoice.number} was deleted`, {
    actorId: session.user.id,
    organizationId: invoice.organizationId,
    invoiceId: invoice.id,
  });

  revalidatePath("/dashboard/invoices");
  return { ok: true };
}