"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { auditLog } from "@/core/lib/audit";

export async function saveOrgAction(input: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };
  const orgId = (session.user as any).defaultOrg?.id;

  const parsed = z
    .object({ name: z.string().min(2), taxId: z.string().optional().or(z.literal("")), country: z.string().optional().or(z.literal("")) })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Organization name must be at least 2 characters." };

  await prisma.organization.update({
    where: { id: orgId },
    data: { name: parsed.data.name, taxId: parsed.data.taxId || null, country: parsed.data.country || null },
  });

  await auditLog("ORG_UPDATED", `Organization settings were updated`, {
    actorId: session.user.id,
    organizationId: orgId,
  });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function saveProfileAction(input: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };

  const parsed = z.object({ name: z.string().min(1).max(120) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Name is required." };

  await prisma.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name } });
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

const businessSchema = z.object({
  id: z.string().optional().or(z.literal("")),
  name: z.string().min(1, "Business name is required"),
  legalName: z.string().optional().or(z.literal("")),
  type: z.string().optional().or(z.literal("")),
  defaultCurrency: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
  addressLine1: z.string().optional().or(z.literal("")),
  addressLine2: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  upiId: z.string().optional().or(z.literal("")),
  bankName: z.string().optional().or(z.literal("")),
  bankAccountNo: z.string().optional().or(z.literal("")),
  bankIFSC: z.string().optional().or(z.literal("")),
});

export async function saveBusinessAction(input: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };
  const orgId = (session.user as any).defaultOrg?.id;

  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please fill in the required fields." };
  const d = parsed.data;
  const n = (v?: string) => (v ? v.trim() : null) || null;

  const data = {
    name: d.name,
    legalName: n(d.legalName),
    type: d.type || "SOLE_PROPRIETORSHIP",
    defaultCurrency: d.defaultCurrency,
    email: n(d.email),
    phone: n(d.phone),
    website: n(d.website),
    taxId: n(d.taxId),
    addressLine1: n(d.addressLine1),
    addressLine2: n(d.addressLine2),
    city: n(d.city),
    state: n(d.state),
    postalCode: n(d.postalCode),
    country: n(d.country),
    upiId: n(d.upiId),
    bankName: n(d.bankName),
    bankAccountNo: n(d.bankAccountNo),
    bankIFSC: n(d.bankIFSC),
  };

  if (d.id) {
    const existing = await prisma.business.findFirst({ where: { id: d.id, organizationId: orgId } });
    if (!existing) return { ok: false, error: "Business not found" };
    await prisma.business.update({ where: { id: d.id }, data });
  } else {
    const count = await prisma.business.count({ where: { organizationId: orgId } });
    await prisma.business.create({
      data: { ...data, organizationId: orgId, isDefault: count === 0 },
    });
  }

  await auditLog("SETTINGS_UPDATED", `Business profile '${d.name}' was saved`, {
    actorId: session.user.id,
    organizationId: orgId,
  });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}