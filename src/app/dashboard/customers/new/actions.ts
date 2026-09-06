"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { auditLog } from "@/core/lib/audit";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerSaveResult = { ok: boolean; error?: string; customerId?: string };

export async function saveCustomerAction(input: unknown): Promise<CustomerSaveResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };
  const orgId = (session.user as any).defaultOrg?.id;

  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields." };
  }
  const d = parsed.data;

  const customer = await prisma.customer.create({
    data: {
      organizationId: orgId,
      name: d.name,
      company: d.company || null,
      email: d.email || null,
      phone: d.phone || null,
      taxId: d.taxId || null,
      addressLine1: d.addressLine1 || null,
      addressLine2: d.addressLine2 || null,
      city: d.city || null,
      state: d.state || null,
      postalCode: d.postalCode || null,
      country: d.country || null,
      notes: d.notes || null,
    },
  });

  await auditLog("ORG_UPDATED", `Customer ${customer.name} was added`, {
    actorId: session.user.id,
    organizationId: orgId,
    entityType: "customer",
    entityId: customer.id,
  });

  revalidatePath("/dashboard/customers");
  return { ok: true, customerId: customer.id };
}