import { NextResponse } from "next/server";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { auditLog } from "@/core/lib/audit";

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).defaultOrg?.id;

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id ?? "");

  const business = await prisma.business.findFirst({ where: { id, organizationId: orgId } });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (business.isDefault) {
    return NextResponse.json({ error: "You can't delete your default business." }, { status: 400 });
  }

  const invoiceCount = await prisma.invoice.count({ where: { businessId: id } });
  if (invoiceCount > 0) {
    return NextResponse.json(
      { error: "This business has invoices. Move them first before deleting." },
      { status: 400 }
    );
  }

  await prisma.business.update({
    where: { id },
    data: { isDefault: false },
  });

  await prisma.business.delete({ where: { id } });

  // Ensure another default exists if none left
  const remaining = await prisma.business.findFirst({ where: { organizationId: orgId } });
  if (remaining && !remaining.isDefault) {
    await prisma.business.update({ where: { id: remaining.id }, data: { isDefault: true } });
  }

  await auditLog("SETTINGS_UPDATED", `Business '${business.name}' was deleted`, {
    actorId: session.user.id,
    organizationId: orgId,
  });

  return NextResponse.json({ ok: true });
}