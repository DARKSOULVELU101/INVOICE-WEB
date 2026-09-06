import type { Invoice, InvoiceLineItem, OrganizationMember } from "@prisma/client";

export type OrgRole = "OWNER" | "ADMIN" | "BILLING" | "MEMBER" | "VIEWER";
export type OrgStatus = "ACTIVE" | "SUSPENDED" | "TRIAL";
export type BusinessType =
  | "SOLE_PROPRIETORSHIP"
  | "PARTNERSHIP"
  | "LLC"
  | "PRIVATE_LIMITED"
  | "PUBLIC_LIMITED"
  | "NON_PROFIT"
  | "OTHER";

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type InvoiceType = "STANDARD" | "PROFORMA" | "ESTIMATE" | "RETAIL";

export type PaymentProvider = "MANUAL" | "STRIPE" | "RAZORPAY" | "PAYPAL" | "UPI" | "CRYPTO";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type EmailStatus = "QUEUED" | "SENT" | "DELIVERED" | "BOUNCED" | "FAILED" | "REJECTED";

export type AuditAction =
  | "INVOICE_CREATED"
  | "INVOICE_EDITED"
  | "INVOICE_SENT"
  | "INVOICE_VIEWED"
  | "INVOICE_DOWNLOADED"
  | "INVOICE_DELETED"
  | "INVOICE_PAID"
  | "LOGIN"
  | "LOGOUT"
  | "ORG_CREATED"
  | "ORG_UPDATED"
  | "MEMBER_INVITED"
  | "MEMBER_ROLE_CHANGED"
  | "MEMBER_REMOVED"
  | "EMAIL_SENT"
  | "SETTINGS_UPDATED";

export type Currency = string;

export type InvoiceWithRelations = Invoice & {
  lineItems: InvoiceLineItem[];
  business: {
    name: string;
    legalName?: string | null;
    email?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    taxId?: string | null;
    logo?: string | null;
    upiId?: string | null;
    bankName?: string | null;
    bankAccountNo?: string | null;
    bankIFSC?: string | null;
    defaultCurrency: string;
  };
  customer: {
    name: string;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    taxId?: string | null;
  };
  organization: { name: string; slug: string; logo?: string | null };
  createdBy: { name?: string | null; email: string };
};

export type MemberWithUser = OrganizationMember & {
  user: { id: string; name?: string | null; email: string; image?: string | null };
};
