import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AuditTimeline } from "./audit-timeline";

export const metadata = { title: "Audit log" };

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orgId = (session.user as any).defaultOrg?.id;
  if (!orgId) redirect("/dashboard/setup");

  const entries = await prisma.auditEntry.findMany({
    where: { organizationId: orgId },
    include: {
      actor: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">Audit log</h1>
        <p className="mt-1 text-sm text-ink-500">
          A transparent record of important actions across your workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Last {entries.length} events</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-400">No activity recorded yet.</p>
          ) : (
            <AuditTimeline
              entries={entries.map((e) => ({
                id: e.id,
                action: e.action,
                description: e.description,
                actorName: e.actor?.name ?? null,
                actorEmail: e.actor?.email ?? null,
                createdAt: e.createdAt.toISOString(),
              }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}