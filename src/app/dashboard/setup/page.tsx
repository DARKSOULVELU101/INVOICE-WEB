import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { SetupClient } from "./setup-client";

export const metadata = { title: "Set up your workspace" };

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Already has an organization: send to dashboard
  const existing = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id, accepted: true },
  });
  if (existing) redirect("/dashboard");

  return <SetupClient email={session.user.email ?? ""} name={session.user.name ?? ""} />;
}