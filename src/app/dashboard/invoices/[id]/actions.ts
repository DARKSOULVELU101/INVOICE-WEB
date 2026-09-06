"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { auditLog } from "@/core/lib/audit";
import { getEmailProvider, emailConfigured } from "@/core/lib/email";
import { absoluteUrl } from "@/core/lib/utils";

export type SendInvoiceResult = { ok: boolean; error?: string; message?: string };

export async function recordPublicTokenAction(invoiceId: string) {
  const session = await auth();
  if (!session?.user) return { ok: false };

  const token = crypto.randomBytes(18).toString("base64url");
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: (session.user as any).defaultOrg?.id },
    select: { id: true, number: true, organizationId: true },
  });
  if (!invoice) return { ok: false };

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      publicToken: token,
      publicLink: absoluteUrl(`/i/${token}`),
    },
  });

  await auditLog("INVOICE_EDITED", `Public share link created for ${invoice.number}`, {
    actorId: session.user.id,
    organizationId: invoice.organizationId,
    invoiceId: invoice.id,
  });

  revalidatePath(`/dashboard/invoices/${invoice.id}`);
  revalidatePath("/dashboard/invoices");
  return { ok: true, url: absoluteUrl(`/i/${token}`) };
}

export async function sendInvoiceAction(
  invoiceId: string,
  email: string
): Promise<SendInvoiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in" };
  const orgId = (session.user as any).defaultOrg?.id;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: orgId },
    include: {
      customer: true,
      business: true,
    },
  });
  if (!invoice) return { ok: false, error: "Invoice not found" };

  const to = (email.trim() || invoice.customer.email || "").trim();
  if (!to) return { ok: false, error: "Customer has no email address." };

  // Ensure a public token exists so the email link is secure and consistent.
  let publicToken = invoice.publicToken;
  if (!publicToken) {
    publicToken = crypto.randomBytes(18).toString("base64url");
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        publicToken,
        publicLink: absoluteUrl(`/i/${publicToken}`),
      },
    });
  }
  const link = absoluteUrl(`/i/${publicToken}`);

  const statusLabelMap: Record<string, string> = {
    DRAFT: "Draft",
    PENDING: "Pending",
    SENT: "Sent",
    PARTIALLY_PAID: "Partially paid",
    PAID: "Paid",
    OVERDUE: "Overdue",
    CANCELLED: "Cancelled",
  };

  const html = emailTemplate({
    businessName: invoice.business.name,
    customerName: invoice.customer.company || invoice.customer.name,
    invoiceNumber: invoice.number,
    total: invoice.total,
    currency: invoice.currency || invoice.business.defaultCurrency || "USD",
    dueDate: invoice.dueDate,
    status: statusLabelMap[invoice.status] ?? invoice.status,
    link,
  });

  const provider = getEmailProvider();
  const from = process.env.EMAIL_FROM ?? "GENVOUCH Invoice Studio <no-reply@genvouch.com>";

  try {
    const result = await provider.send({
      to,
      subject: `${invoice.business.name} sent you invoice ${invoice.number}`,
      html,
      text: `View your invoice ${invoice.number} here: ${link}`,
      replyTo: process.env.EMAIL_REPLY_TO,
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: invoice.status === "DRAFT" ? "SENT" : invoice.status, sentAt: new Date() },
    });

    await prisma.invoiceEmailLog.create({
      data: {
        invoiceId: invoice.id,
        to,
        from,
        subject: `${invoice.business.name} sent you invoice ${invoice.number}`,
        status: result.id ? "SENT" : emailConfigured() ? "SENT" : "QUEUED",
        providerId: result.id,
      },
    });

    await auditLog("INVOICE_SENT", `Invoice ${invoice.number} sent to ${to}`, {
      actorId: session.user.id,
      organizationId: orgId,
      invoiceId: invoice.id,
    });

    revalidatePath(`/dashboard/invoices/${invoice.id}`);
    revalidatePath("/dashboard/invoices");

    return {
      ok: true,
      message: emailConfigured()
        ? `Invoice sent to ${to}.`
        : `Invoice queued for ${to} — add your RESEND_API_KEY to deliver real email.`,
    };
  } catch (err: any) {
    console.error("[sendInvoice] failed", err);

    await prisma.invoiceEmailLog.create({
      data: {
        invoiceId: invoice.id,
        to,
        from,
        subject: `${invoice.business.name} sent you invoice ${invoice.number}`,
        status: "FAILED",
        error: String(err?.message ?? err),
      },
    });

    return { ok: false, error: `Failed to send email: ${err?.message ?? "unknown error"}` };
  }
}

function emailTemplate({
  businessName,
  customerName,
  invoiceNumber,
  total,
  currency,
  dueDate,
  status,
  link,
}: {
  businessName: string;
  customerName: string;
  invoiceNumber: string;
  total: number;
  currency: string;
  dueDate: Date | null;
  status: string;
  link: string;
}) {
  const totalLocale = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(total);
  const due = dueDate
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(dueDate)
    : "On receipt";
  return `<!DOCTYPE html>
<html>
<body style="margin:0;background:#f4f5f7;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#1F41F5,#7C3AED 60%,#0891B2);padding:32px 36px;">
            <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">GENVOUCH</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.75);letter-spacing:0.2em;margin-top:2px;">INVOICE STUDIO</div>
          </td>
        </tr>
        <tr><td style="padding:32px 36px;">
          <p style="margin:0 0 6px;font-size:13px;color:#66768f;">Hi ${customerName},</p>
          <p style="margin:0 0 20px;font-size:16px;color:#171a23;line-height:1.5;">
            <strong>${businessName}</strong> has sent you invoice <strong>${invoiceNumber}</strong>.
          </p>
          <table style="width:100%;border:1px solid #e5e8ef;border-radius:12px;margin-bottom:24px;">
            <tr>
              <td style="padding:14px 16px;font-size:12px;color:#66768f;">Status<br/><strong style="color:#171a23;">${status}</strong></td>
              <td style="padding:14px 16px;font-size:12px;color:#66768f;">Due date<br/><strong style="color:#171a23;">${due}</strong></td>
              <td style="padding:14px 16px;font-size:12px;color:#66768f;text-align:right;">Amount due<br/><strong style="color:#1F41F5;font-size:18px;">${totalLocale}</strong></td>
            </tr>
          </table>
          <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#1F41F5,#7C3AED);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 28px;border-radius:10px;">View invoice</a>
          <p style="margin:28px 0 0;font-size:12px;color:#8594aa;line-height:1.6;">
            This link is protected by a signed token and doesn't require an account.<br/>
            Powered by GENVOUCH TECHNOLOGIES PVT.
          </p>
        </td></tr>
      </table>
    </td></tr>
</table>
    </body>
    </html>`;
}