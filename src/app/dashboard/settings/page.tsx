import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orgId = (session.user as any).defaultOrg?.id;
  if (!orgId) redirect("/dashboard/setup");

  const [org, businesses, profile] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true, slug: true, logo: true, plan: true, taxId: true, country: true },
    }),
    prisma.business.findMany({
      where: { organizationId: orgId },
      orderBy: { isDefault: "desc" },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } }),
  ]);

  return (
    <SettingsClient
      org={{
        id: org?.id ?? "",
        name: org?.name ?? "",
        slug: org?.slug ?? "",
        plan: org?.plan ?? "free",
        taxId: org?.taxId ?? "",
        country: org?.country ?? "",
      }}
      businesses={businesses}
      profile={profile}
    />
  );
}