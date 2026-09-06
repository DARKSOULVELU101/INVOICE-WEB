import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { getNextInvoiceNumber } from "@/core/data/organization";
import { InvoiceForm } from "./invoice-form";

export const metadata = { title: "New invoice" };

export default async function NewInvoicePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orgId = (session.user as any).defaultOrg?.id;
  if (!orgId) redirect("/dashboard/setup");

  const [businesses, customers, number] = await Promise.all([
    prisma.business.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, defaultCurrency: true, logo: true },
      orderBy: { isDefault: "desc" },
    }),
    prisma.customer.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, company: true, email: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
    getNextInvoiceNumber(orgId),
  ]);

  return (
    <InvoiceForm
      businesses={businesses}
      customers={customers}
      initial={{
        number,
        businessId: businesses[0]?.id ?? "",
        currency: businesses[0]?.defaultCurrency ?? "USD",
      }}
    />
  );
}