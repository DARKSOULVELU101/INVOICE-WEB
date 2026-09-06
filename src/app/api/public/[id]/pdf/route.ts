import { NextResponse } from "next/server";
import { prisma } from "@/core/db/prisma";
import { generateInvoicePdf } from "@/core/pdf/generate";
import { auditLog } from "@/core/lib/audit";
import { headers } from "next/headers";

// Public PDF download guarded by the invoice's own signed high-entropy token.
// The token lives in the public share URL, so a raw DB ID alone is not enough.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    select: { id: true, publicToken: true, number: true, organizationId: true, publicLink: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const reqUrl = _req.url;
  const referer = _req.headers.get("referer");

  // valid if the request's URL query carries the token OR it touches the public page
  const url = new URL(reqUrl);
  const token = url.searchParams.get("token");

  const isPublicReferer =
    referer && (referer.includes(`/i/${invoice.publicToken}`) || invoice.publicLink && referer.startsWith(invoice.publicLink));

  if (!invoice.publicToken || (token !== invoice.publicToken && !isPublicReferer)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const full = await prisma.invoice.findFirst({
    where: { id: invoice.id },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      business: true,
      customer: true,
      organization: { select: { name: true, slug: true, logo: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  if (!full) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const pdf = await generateInvoicePdf(full as any);
    const h = headers();
    const forwarded = h.get("x-forwarded-for") ?? h.get("x-real-ip");
    await auditLog("INVOICE_DOWNLOADED", `Public invoice ${invoice.number} was downloaded`, {
      organizationId: invoice.organizationId,
      invoiceId: invoice.id,
      ipHash: forwarded ? simpleHash(forwarded) : undefined,
    });

    return new NextResponse(pdf as unknown as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[public pdf] failed", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}

function simpleHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(36);
}