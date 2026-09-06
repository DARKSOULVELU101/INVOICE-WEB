import { notFound } from "next/navigation";
import { prisma } from "@/core/db/prisma";
import { auditLog } from "@/core/lib/audit";
import { headers } from "next/headers";
import { PublicInvoiceSheet } from "./public-invoice";
import { GenvouchLoader } from "@/components/brand/GenvouchLoader";

export const metadata = { title: "Invoice" };

export default async function PublicInvoicePage({ params }: { params: { token: string } }) {
  const token = params.token;

  const invoice = await prisma.invoice.findFirst({
    where: { publicToken: token },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      business: true,
      customer: true,
      organization: { select: { name: true, slug: true, logo: true } },
    },
  });

  if (!invoice) notFound();

  // Log a view (only once per open to avoid spam is handled by viewedAt semantics)
  const h = headers();
  const forwarded = h.get("x-forwarded-for") ?? h.get("x-real-ip");
  await auditLog("INVOICE_VIEWED", `Public invoice ${invoice.number} was viewed`, {
    organizationId: invoice.organizationId,
    invoiceId: invoice.id,
    ipHash: forwarded ? hashIp(forwarded) : undefined,
    userAgent: h.get("user-agent") ?? undefined,
  });

  if (!invoice.viewedAt) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { viewedAt: new Date() },
    });
  }

  return (
    <>
      <GenvouchLoader minDisplayMs={1600} />
      <PublicInvoiceSheet
        token={params.token}
        invoice={{
          ...invoice,
          issuedDate: invoice.issuedDate.toISOString(),
          dueDate: invoice.dueDate?.toISOString() ?? null,
        }}
      />
    </>
  );
}

function hashIp(ip: string) {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash << 5) - hash + ip.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(36);
}