"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { invoiceFormSchema } from "@/core/validation/invoice";
import { calculateInvoicePricing } from "@/core/lib/pricing";
import { auditLog } from "@/core/lib/audit";
import crypto from "crypto";
import { getNextInvoiceNumber } from "@/core/data/organization";

export type SaveInvoiceResult = { ok: boolean; error?: string; invoiceId?: string };

export async function saveInvoiceAction(input: unknown): Promise<SaveInvoiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };
  const orgId = (session.user as any).defaultOrg?.id;
  if (!orgId) return { ok: false, error: "No organization selected" };

  const parsed = invoiceFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields." };
  }
  const data = parsed.data;

  // Authorization: user must belong to the organization
  const member = await prisma.organizationMember.findFirst({
    where: { organizationId: orgId, userId: session.user.id, accepted: true },
  });
  if (!member || member.role === "VIEWER") {
    return { ok: false, error: "You don't have permission to create invoices." };
  }

  const business = await prisma.business.findFirst({
    where: { id: data.businessId, organizationId: orgId },
  });
  if (!business) return { ok: false, error: "Invalid business selected" };

  const customer = await prisma.customer.findFirst({
    where: { id: data.customerId, organizationId: orgId },
  });
  if (!customer) return { ok: false, error: "Invalid customer selected" };

  const pricing = calculateInvoicePricing({
    items: data.items,
    discount: data.discount,
    discountType: data.discountType,
  });

  const issuedDate = new Date(data.issuedDate + "T12:00:00");
  const dueDate = data.dueDate ? new Date(data.dueDate + "T12:00:00") : null;
  const totals = {
    subtotal: pricing.subtotal,
    discount: data.discount,
    discountType: data.discountType,
    taxTotal: pricing.taxTotal,
    total: pricing.total,
    amountDue: pricing.total,
  };

  const common = {
    organizationId: orgId,
    businessId: data.businessId,
    customerId: data.customerId,
    number: data.number.trim().toUpperCase(),
    type: data.type,
    issuedDate,
    dueDate,
    currency: data.currency,
    notes: data.notes || null,
    terms: data.terms || null,
    reference: data.reference || null,
    ...totals,
  };

  try {
    if (data.id) {
      // Existing invoice
      const existing = await prisma.invoice.findFirst({
        where: { id: data.id, organizationId: orgId },
        include: { lineItems: { select: { id: true } } },
      });
      if (!existing) return { ok: false, error: "Invoice not found" };

      await prisma.$transaction(async (tx) => {
        await tx.invoiceLineItem.deleteMany({ where: { invoiceId: existing.id } });
        await tx.invoice.update({
          where: { id: existing.id },
          data: {
            ...common,
            status: data.status,
            lineItems: {
              create: pricing.lineItems.map((li, i) => ({
                description: data.items[i].description,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
                discount: li.discount,
                taxRate: li.taxRate,
                amount: li.amount,
                sortOrder: i,
              })),
            },
          },
        });
      });

      await auditLog("INVOICE_EDITED", `Invoice ${common.number} was updated`, {
        actorId: session.user.id,
        organizationId: orgId,
        invoiceId: existing.id,
      });

      revalidatePath("/dashboard/invoices");
      return { ok: true, invoiceId: existing.id };
    }

    // Determine unique number if blank
    let number = common.number;
    if (!number) number = await getNextInvoiceNumber(orgId);

    const publicToken = crypto.randomBytes(18).toString("base64url");

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          organizationId: orgId,
          businessId: data.businessId,
          customerId: data.customerId,
          createdById: session.user.id,
          number,
          type: data.type,
          status: data.status,
          issuedDate,
          dueDate,
          currency: data.currency,
          subtotal: pricing.subtotal,
          discount: data.discount,
          discountType: data.discountType,
          taxTotal: pricing.taxTotal,
          total: pricing.total,
          amountDue: pricing.total,
          notes: data.notes || null,
          terms: data.terms || null,
          reference: data.reference || null,
          publicToken,
          lineItems: {
            create: pricing.lineItems.map((li, i) => ({
              description: data.items[i].description,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              discount: li.discount,
              taxRate: li.taxRate,
              amount: li.amount,
              sortOrder: i,
            })),
          },
        },
      });
      return created;
    });

    await auditLog("INVOICE_CREATED", `Invoice ${number} was created`, {
      actorId: session.user.id,
      organizationId: orgId,
      invoiceId: invoice.id,
    });

    revalidatePath("/dashboard/invoices");
    return { ok: true, invoiceId: invoice.id };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { ok: false, error: "An invoice with this number already exists for your organization." };
    }
    console.error("[saveInvoice] failed", err);
    return { ok: false, error: "Something went wrong while saving the invoice." };
  }
}