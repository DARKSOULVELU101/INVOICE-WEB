import { prisma } from "@/core/db/prisma";
import type { InvoiceType, InvoiceStatus } from "@/types";

export async function getOrganizationForUser(userId: string, orgId: string) {
  const member = await prisma.organizationMember.findFirst({
    where: { userId, organizationId: orgId, accepted: true },
    select: { role: true },
  });
  if (!member) return null;
  return member;
}

export async function getUserOrganization(userId: string) {
  const member = await prisma.organizationMember.findFirst({
    where: { userId, accepted: true },
    orderBy: { createdAt: "asc" },
    select: {
      role: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          plan: true,
        },
      },
    },
  });
  return member;
}

export async function listOrganizations(userId: string) {
  return prisma.organizationMember.findMany({
    where: { userId, accepted: true },
    select: {
      role: true,
      organization: { select: { id: true, name: true, slug: true, logo: true, plan: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDashboardStats(organizationId: string) {
  const [invoices, totalOutstandingAgg, totalPaidAgg, overdueAgg, customers, openCount] =
    await Promise.all([
      prisma.invoice.findMany({
        where: { organizationId },
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
          amountDue: true,
          currency: true,
          issuedDate: true,
          dueDate: true,
          customer: { select: { name: true, company: true } },
          publicToken: true,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.invoice.aggregate({
        where: { organizationId, status: { in: ["PENDING", "SENT", "PARTIALLY_PAID", "OVERDUE"] } },
        _sum: { amountDue: true },
      }),
      prisma.invoice.aggregate({
        where: { organizationId, status: "PAID" },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { organizationId, status: "OVERDUE" },
        _sum: { amountDue: true },
      }),
      prisma.customer.count({ where: { organizationId } }),
      prisma.invoice.aggregate({
        where: { organizationId, status: { notIn: ["PAID", "CANCELLED"] } },
        _count: { _all: true },
      }),
    ]);

  return {
    invoices,
    outstanding: totalOutstandingAgg._sum.amountDue ?? 0,
    paid: totalPaidAgg._sum.total ?? 0,
    overdue: overdueAgg._sum.amountDue ?? 0,
    customers,
    openInvoices: openCount?._count._all ?? 0,
  };
}

export async function getBusinesses(organizationId: string) {
  return prisma.business.findMany({
    where: { organizationId },
    orderBy: { isDefault: "desc" },
  });
}

export async function getCustomers(organizationId: string) {
  return prisma.customer.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getCustomersAll(organizationId: string) {
  return prisma.customer.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function getNextInvoiceNumber(organizationId: string, prefix = "INV") {
  const last = await prisma.invoice.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  });
  let seq = 1;
  if (last?.number) {
    const match = last.number.match(/(\d+)$/);
    if (match) seq = parseInt(match[1], 10) + 1;
  }
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
}

export async function getInvoiceWithDetails(organizationId: string, invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      business: true,
      customer: true,
      organization: { select: { name: true, slug: true, logo: true } },
      createdBy: { select: { name: true, email: true } },
      template: { select: { id: true, name: true } },
      payments: true,
    },
  });
  return invoice;
}

export async function listInvoices(organizationId: string) {
  return prisma.invoice.findMany({
    where: { organizationId },
    include: {
      customer: { select: { name: true, company: true } },
      business: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}