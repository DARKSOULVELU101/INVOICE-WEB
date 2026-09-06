import { NextResponse } from "next/server";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { generateInvoicePdf } from "@/core/pdf/generate";
import { auditLog } from "@/core/lib/audit";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = (session.user as any).defaultOrg?.id;

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      business: true,
      customer: true,
      organization: { select: { name: true, slug: true, logo: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  try {
    const pdf = await generateInvoicePdf(invoice as any);
    await auditLog("INVOICE_DOWNLOADED", `Invoice ${invoice.number} was downloaded`, {
      actorId: session.user.id,
      organizationId: orgId,
      invoiceId: invoice.id,
    });

    return new NextResponse(pdf as unknown as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[pdf] generation failed", err);
    return NextResponse.json(
      { error: `PDF generation failed: ${err?.message ?? "unknown"}` },
      { status: 500 }
    );
  }
}