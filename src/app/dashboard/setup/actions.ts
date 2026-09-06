"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { slugify } from "@/core/lib/utils";

export async function createWorkspaceAction(input: Record<string, string>) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = z
    .object({
      orgName: z.string().min(2, "Workspace name must be at least 2 characters"),
      businessName: z.string().min(1, "Business name is required"),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields." };

  const slug = slugify(parsed.data.orgName);

  const org = await prisma.$transaction(async (tx) => {
    const created = await tx.organization.create({
      data: {
        name: parsed.data.orgName,
        slug: `${slug}-${Date.now().toString(36)}`,
        status: "ACTIVE",
        createdById: session.user.id,
      },
    });
    await tx.organizationMember.create({
      data: { organizationId: created.id, userId: session.user.id, role: "OWNER", accepted: true },
    });
    await tx.business.create({
      data: {
        organizationId: created.id,
        name: parsed.data.businessName,
        defaultCurrency: "USD",
        isDefault: true,
      },
    });
    return created;
  });

  // Update the session's default org by clearing and relying on next request
  return { ok: true, orgId: org.id };
}

// The JWT holds defaultOrg from login time. After setup, force a fresh session
// with the new org by re-issuing the token via a redirect. Simplest robust path:
export async function completeSetupAndRedirect(sessionOrgId: string) {
  redirect(`/dashboard?seeded=${sessionOrgId}`);
}