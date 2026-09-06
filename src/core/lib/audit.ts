import { prisma } from "@/core/db/prisma";
import type { AuditAction } from "@/types";
import type { headers as headersType } from "next/headers";

type AuditContext = {
  actorId?: string | null;
  organizationId?: string | null;
  invoiceId?: string | null;
  entityType?: string;
  entityId?: string;
  ipHash?: string;
  userAgent?: string;
};

export async function auditLog(
  action: AuditAction,
  description: string,
  ctx: AuditContext = {},
  extra?: { entityType?: string; entityId?: string; metadata?: Record<string, unknown> }
) {
  try {
    await prisma.auditEntry.create({
      data: {
        action,
        description,
        actorId: ctx.actorId ?? null,
        organizationId: ctx.organizationId,
        invoiceId: ctx.invoiceId ?? null,
        entityType: extra?.entityType ?? ctx.entityType,
        entityId: extra?.entityId ?? ctx.entityId,
        ipHash: ctx.ipHash,
        userAgent: ctx.userAgent,
        metadata: extra?.metadata ? JSON.stringify(extra.metadata) : null,
      },
    });
  } catch (err) {
    // Audit logging must never break the primary operation.
    console.error("[audit] failed to write log", err);
  }
}

export async function captureAuditMeta(headers: Awaited<ReturnType<typeof headersType>>) {
  const ip = headers.get("x-forwarded-for") ?? headers.get("x-real-ip");
  const ua = headers.get("user-agent");
  return {
    ipHash: ip ? simpleHash(ip) : undefined,
    userAgent: ua ?? undefined,
  };
}

function simpleHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0;
  }
  const unsigned = hash >>> 0;
  return unsigned.toString(36);
}
