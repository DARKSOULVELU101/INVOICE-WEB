export type PricingInput = {
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number; // percent
  }[];
  discountType: "fixed" | "percentage";
  discount?: number;
};

export type PricingResult = {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  lineItems: {
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    lineTotal: number;
    taxAmount: number;
    amount: number;
  }[];
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calculateInvoicePricing(input: PricingInput): PricingResult {
  const discount = input.discount ?? 0;
  const discountType = input.discountType ?? "fixed";

  let subtotal = 0;
  let taxTotal = 0;

  const lineItems = input.items.map((item, i) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const itemDiscount = Number(item.discount) || 0;
    const taxRate = Number(item.taxRate) || 0;

    const base = quantity * unitPrice;
    const discounted = Math.max(0, base - itemDiscount);
    const taxAmount = round2((discounted * taxRate) / 100);
    const amount = round2(discounted + taxAmount);

    subtotal += discounted;
    taxTotal += taxAmount;

    return {
      sortOrder: i,
      quantity,
      unitPrice,
      discount: itemDiscount,
      taxRate,
      lineTotal: round2(discounted),
      taxAmount,
      amount,
    };
  });

  subtotal = round2(subtotal);
  let discountTotal = 0;

  if (discountType === "percentage" && discount > 0) {
    discountTotal = round2((subtotal * discount) / 100);
  } else {
    discountTotal = round2(Math.min(subtotal, discount));
  }

  // Recalculate tax proportionally if discount applies before tax (common default).
  // Here we treat invoice-level discount as reducing the taxable subtotal.
  const taxableSubtotal = round2(subtotal - discountTotal);
  taxTotal = round2((taxableSubtotal / (subtotal || 1)) * taxTotal);
  const total = round2(taxableSubtotal + taxTotal);

  return { subtotal, discountTotal, taxTotal, total, lineItems };
}
