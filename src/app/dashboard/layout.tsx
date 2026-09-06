import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { SideNav } from "@/components/layout/side-nav";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orgId = (session.user as any).defaultOrg?.id;
  if (!orgId) redirect("/dashboard/setup");

  const org = await prisma.organization.findFirst({
    where: { id: orgId, status: "ACTIVE" },
    select: { name: true, slug: true, logo: true },
  });

  return (
    <div className="min-h-screen bg-surface-subtle/60">
      <SideNav
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          orgName: org?.name,
        }}
      />
      <MobileNav
        user={{
          name: session.user.name,
          email: session.user.email,
          orgName: org?.name,
        }}
      />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}