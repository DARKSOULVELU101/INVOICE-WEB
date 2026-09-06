import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, Mail, Phone, Building2 } from "lucide-react";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orgId = (session.user as any).defaultOrg?.id;
  if (!orgId) redirect("/dashboard/setup");

  const customers = await prisma.customer.findMany({
    where: { organizationId: orgId },
    include: { _count: { select: { invoices: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-slide-up">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">Customers</h1>
          <p className="mt-1 text-sm text-ink-500">{customers.length} saved contacts</p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button size="md"><Plus className="h-4 w-4" /> Add customer</Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-20 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Users className="h-7 w-7" />
          </span>
          <h3 className="mt-5 font-display text-xl font-semibold text-ink-900">No customers yet</h3>
          <p className="mt-1 max-w-sm text-sm text-ink-400">
            Add the people and companies you bill — they&apos;ll be one tap away when creating invoices.
          </p>
          <Link href="/dashboard/customers/new" className="mt-6">
            <Button><Plus className="h-4 w-4" /> Add your first customer</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <Card key={c.id} hover className="p-5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-sm font-bold text-white">
                    {(c.company || c.name).slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-display font-semibold text-ink-900">{c.company || c.name}</p>
                    {c.company && <p className="text-xs text-ink-400">{c.name}</p>}
                  </div>
                </div>
                <span className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-ink-500">
                  {c._count.invoices} invoice{c._count.invoices === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-ink-500">
                {c.email && (
                  <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-ink-300" /> {c.email}</p>
                )}
                {c.phone && (
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-ink-300" /> {c.phone}</p>
                )}
                <p className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-ink-300" />
                  {[c.city, c.state, c.country].filter(Boolean).join(", ") || "No address"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}