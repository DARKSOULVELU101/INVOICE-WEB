import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { TeamClient } from "./team-client";
import type { OrgRole } from "@/types";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orgId = (session.user as any).defaultOrg?.id;
  if (!orgId) redirect("/dashboard/setup");

  const [members, invitations, currentRole] = await Promise.all([
    prisma.organizationMember.findMany({
      where: { organizationId: orgId, accepted: true },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invitation.findMany({
      where: {
        organizationId: orgId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: session.user.id } },
      select: { role: true },
    }),
  ]);

  const canManage = currentRole?.role === "OWNER" || currentRole?.role === "ADMIN";

  return (
    <TeamClient
      members={members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        role: m.role as OrgRole,
        isCurrentUser: m.user.id === session.user.id,
      }))}
      invitations={invitations.map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role as OrgRole,
        createdAt: i.createdAt.toISOString(),
      }))}
      canManage={canManage}
    />
  );
}