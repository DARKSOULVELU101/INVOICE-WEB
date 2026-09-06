import { z } from "zod";

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be at least 0.01"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
  discount: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

export const invoiceFormSchema = z.object({
  id: z.string().optional(),
  number: z.string().min(1, "Invoice number is required"),
  type: z.enum(["STANDARD", "PROFORMA", "ESTIMATE", "RETAIL"]),
  status: z.enum(["DRAFT", "PENDING", "SENT", "PAID", "OVERDUE", "CANCELLED", "PARTIALLY_PAID"]).default("DRAFT"),
  businessId: z.string().min(1, "Select a business"),
  customerId: z.string().min(1, "Select a customer"),
  issuedDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().optional(),
  currency: z.string().min(1),
  discountType: z.enum(["fixed", "percentage"]).default("fixed"),
  discount: z.coerce.number().min(0).default(0),
  reference: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "Add at least one line item"),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export function defaultInvoiceValues(): InvoiceFormValues {
  const today = new Date();
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  return {
    number: "",
    type: "STANDARD",
    status: "DRAFT",
    businessId: "",
    customerId: "",
    issuedDate: today.toISOString().split("T")[0],
    dueDate: in30.toISOString().split("T")[0],
    currency: "USD",
    discountType: "fixed",
    discount: 0,
    reference: "",
    notes: "",
    terms: "Payment is due within the specified terms. Thank you for your business.",
    items: [{ description: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }],
  };
}