"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { auditLog } from "@/core/lib/audit";
import { getEmailProvider } from "@/core/lib/email";
import { absoluteUrl } from "@/core/lib/utils";
import type { OrgRole } from "@/types";

export async function inviteMemberAction(
  email: string,
  role: OrgRole
): Promise<{ ok: boolean; error?: string; email?: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };
  const orgId = (session.user as any).defaultOrg?.id;
  if (!orgId) return { ok: false, error: "No organization" };

  const parsed = z.object({ email: z.string().email(), role: z.enum(["OWNER", "ADMIN", "BILLING", "MEMBER", "VIEWER"]) }).safeParse({ email, role });
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };
  if (role === "OWNER") return { ok: false, error: "You can't invite another owner." };

  const normalized = parsed.data.email.toLowerCase();

  // Existing member?
  const existingUser = await prisma.user.findUnique({ where: { email: normalized }, include: { memberships: { where: { organizationId: orgId } } } });
  if (existingUser?.memberships.some((m) => m.accepted)) {
    return { ok: false, error: "This person is already a member of this workspace." };
  }

  const token = crypto.randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.invitation.create({
    data: { organizationId: orgId, email: normalized, role, token, expiresAt, invitedById: session.user.id },
  });

  const acceptUrl = absoluteUrl(`/invite/${token}`);
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true, slug: true } });

  try {
    const provider = getEmailProvider();
    await provider.send({
      to: normalized,
      subject: `${org?.name ?? "Your workspace"} invited you to GENVOUCH Invoice Studio`,
      html: `<p>You've been invited to <strong>${org?.name ?? "a workspace"}</strong> on GENVOUCH Invoice Studio.</p><p><a href="${acceptUrl}">Accept invitation</a></p>`,
      text: `Accept your invitation: ${acceptUrl}`,
    });
  } catch (err) {
    console.error("[invite] email failed (still recording invitation)", err);
  }

  await auditLog("MEMBER_INVITED", `Invited ${normalized} as ${role}`, {
    actorId: session.user.id,
    organizationId: orgId,
  });

  revalidatePath("/dashboard/team");
  return { ok: true, email: normalized };
}

export async function removeMemberAction(userId: string) {
  const session = await auth();
  if (!session?.user) return { ok: false };
  const orgId = (session.user as any).defaultOrg?.id;

  const target = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId } },
  });
  if (!target || target.role === "OWNER") return { ok: false };
  if (target.userId === session.user.id) return { ok: false, error: "You can't remove yourself." };

  await prisma.organizationMember.delete({ where: { id: target.id } });
  await auditLog("MEMBER_REMOVED", `Removed a team member`, {
    actorId: session.user.id,
    organizationId: orgId,
  });
  revalidatePath("/dashboard/team");
  return { ok: true };
}

export async function updateRoleAction(userId: string, role: OrgRole) {
  const session = await auth();
  if (!session?.user) return { ok: false };
  const orgId = (session.user as any).defaultOrg?.id;

  const member = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId } },
  });
  if (!member || member.role === "OWNER") return { ok: false };
  if (role === "OWNER") return { ok: false };

  await prisma.organizationMember.update({
    where: { id: member.id },
    data: { role },
  });
  await auditLog("MEMBER_ROLE_CHANGED", `Updated role for a team member to ${role}`, {
    actorId: session.user.id,
    organizationId: orgId,
  });
  revalidatePath("/dashboard/team");
  return { ok: true };
}

export async function acceptInvitationAction(token: string) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Please sign in first." };

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: { select: { name: true, slug: true } } },
  });
  if (!invitation || invitation.acceptedAt) return { ok: false, error: "This invitation is invalid or already accepted." };
  if (invitation.expiresAt < new Date()) return { ok: false, error: "This invitation has expired." };
  if (invitation.email.toLowerCase() !== session.user.email?.toLowerCase()) {
    return { ok: false, error: "This invitation was sent to a different email address." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { memberships: { where: { organizationId: invitation.organizationId } } },
  });
  const member = existing?.memberships[0];
  if (member && member.accepted) return { ok: true, redirectTo: `/dashboard?org=${invitation.organization.slug}` };

  if (member) {
    await prisma.organizationMember.update({
      where: { id: member.id },
      data: { accepted: true, role: invitation.role },
    });
  } else {
    await prisma.organizationMember.create({
      data: {
        organizationId: invitation.organizationId,
        userId: session.user.id,
        role: invitation.role,
        accepted: true,
      },
    });
  }

  await prisma.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } });

  return { ok: true, redirectTo: `/dashboard?org=${invitation.organization.slug}` };
}