"use client";

import { useMemo, useState, useEffect, isValidElement, cloneElement, type ReactNode, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X, Save, ArrowLeft, Wallet, Sparkles } from "lucide-react";
import { invoiceFormSchema, defaultInvoiceValues, type InvoiceFormValues } from "@/core/validation/invoice";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/core/lib/utils";
import { formatCurrency } from "@/core/lib/utils";
import { saveInvoiceAction } from "./actions";
import { motion as motionTokens } from "@/core/design";

type BusinessOption = { id: string; name: string; defaultCurrency: string; logo?: string | null };
type CustomerOption = { id: string; name: string; company?: string | null; email?: string | null };

export function InvoiceForm({
  businesses,
  customers,
  initial,
}: {
  businesses: BusinessOption[];
  customers: CustomerOption[];
  initial?: Partial<InvoiceFormValues> & { existing?: boolean };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewQty, setPreviewQty] = useState(0);

  const methods = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: initial ? { ...defaultInvoiceValues(), ...initial } : defaultInvoiceValues(),
  });

  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "items" });
  const watchItems = methods.watch("items");
  const watchDiscountType = methods.watch("discountType");
  const watchDiscount = methods.watch("discount");
  const watchCurrency = methods.watch("currency");
  const selectedBusinessId = methods.watch("businessId");
  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);

  useEffect(() => {
    if (selectedBusiness?.defaultCurrency && !initial?.existing) {
      const current = methods.getValues("currency");
      if (!current) methods.setValue("currency", selectedBusiness.defaultCurrency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusinessId]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;
    for (const item of watchItems ?? []) {
      const qty = Number(item?.quantity) || 0;
      const price = Number(item?.unitPrice) || 0;
      const disc = Number(item?.discount) || 0;
      const tax = Number(item?.taxRate) || 0;
      const lineTotal = qty * price - disc;
      subtotal += Math.max(0, lineTotal);
      taxTotal += (Math.max(0, lineTotal) * tax) / 100;
    }
    let discountTotal = 0;
    if (watchDiscountType === "percentage") discountTotal = (subtotal * Number(watchDiscount || 0)) / 100;
    else discountTotal = Math.min(subtotal, Number(watchDiscount || 0));
    const taxable = Math.max(0, subtotal - discountTotal);
    const finalTax = taxTotal > 0 && subtotal > 0 ? (taxable / subtotal) * taxTotal : 0;
    const total = taxable + finalTax;
    return { subtotal, discountTotal, taxTotal: finalTax, total };
  }, [watchItems, watchDiscountType, watchDiscount]);

  const onSave = async (values: InvoiceFormValues) => {
    setSaving(true);
    setError(null);
    const res = await saveInvoiceAction(values);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to save");
      return;
    }
    router.push(`/dashboard/invoices/${res.invoiceId}?created=1`);
    router.refresh();
  };

  const customersById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSave)} className="space-y-6" noValidate>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/invoices")}
              className="gv-focus-ring rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              aria-label="Back to invoices"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
              {initial?.existing ? `Edit ${initial.number}` : "New invoice"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <p role="alert" className="mr-2 text-sm font-medium text-semantic-danger">{error}</p>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => methods.setValue("status", "DRAFT")}
              className="hidden sm:inline-flex"
            >
              Save draft
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : initial?.existing ? "Save changes" : "Create invoice"}
            </Button>
          </div>
        </div>

        {/* Error alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-semantic-danger/20 bg-semantic-dangerBg px-4 py-3 text-sm font-medium text-semantic-danger"
              role="alert"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Basics */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Invoice basics</CardTitle>
              <CardDescription>Who this is for, and how it should look.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 md:grid-cols-3">
              <Field name="number" label="Invoice number" hint="Auto-generated if left blank">
                <Input placeholder="INV-2025-0001" />
              </Field>
              <Field name="type" label="Document type">
                <Select>
                  <option value="STANDARD">Standard invoice</option>
                  <option value="PROFORMA">Proforma</option>
                  <option value="ESTIMATE">Estimate</option>
                  <option value="RETAIL">Retail invoice</option>
                </Select>
              </Field>
              <Field name="status" label="Status">
                <Select>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Pending</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                </Select>
              </Field>
              <Field name="businessId" label="Your business">
                <Select disabled={businesses.length === 0}>
                  {businesses.length === 0 ? (
                    <option value="">Create a business in Settings first</option>
                  ) : (
                    businesses.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))
                  )}
                </Select>
              </Field>
              <Field name="customerId" label="Bill to">
                <Select disabled={customers.length === 0}>
                  {customers.length === 0 ? (
                    <option value="">No customers yet</option>
                  ) : (
                    customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company || c.name}
                        {c.email ? ` — ${c.email}` : ""}
                      </option>
                    ))
                  )}
                </Select>
              </Field>
              <Field name="currency" label="Currency">
                <Select>
                  {["USD", "EUR", "INR", "GBP", "AUD", "CAD", "AED", "SGD"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field name="issuedDate" label="Issue date">
                <Input type="date" />
              </Field>
              <Field name="dueDate" label="Due date">
                <Input type="date" />
              </Field>
              <Field name="reference" label="Reference / PO #">
                <Input placeholder="PO-1042" />
              </Field>
            </div>
            {customers.length === 0 && (
              <a
                href="/dashboard/customers/new"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
              >
                <Plus className="h-4 w-4" /> Add a customer first
              </a>
            )}
          </CardContent>
        </Card>

        {/* Line items */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Line items</CardTitle>
              <CardDescription>What you&apos;re charging for.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="hidden grid-cols-[1fr_90px_100px_90px_90px_40px] gap-3 px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-400 md:grid">
              <span>Description</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Discount</span>
              <span className="text-right">Tax %</span>
              <span />
            </div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: motionTokens.duration.fast }}
                    className="grid items-start gap-3 rounded-xl border border-border/70 bg-surface-subtle/50 p-3 md:grid-cols-[1fr_90px_100px_90px_90px_40px]"
                  >
                    <div>
                      <Label className="mb-1 md:hidden">Description</Label>
                      <Textarea
                        rows={1}
                        placeholder="Product or service name"
                        className="min-h-9 bg-white"
                        {...methods.register(`items.${index}.description`)}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 md:hidden">Qty</Label>
                      <Input type="number" step="any" min="0" {...methods.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                    </div>
                    <div>
                      <Label className="mb-1 md:hidden">Rate</Label>
                      <Input type="number" step="any" min="0" {...methods.register(`items.${index}.unitPrice`, { valueAsNumber: true })} />
                    </div>
                    <div>
                      <Label className="mb-1 md:hidden">Discount</Label>
                      <Input type="number" step="any" min="0" {...methods.register(`items.${index}.discount`, { valueAsNumber: true })} />
                    </div>
                    <div>
                      <Label className="mb-1 md:hidden">Tax %</Label>
                      <Input type="number" step="any" min="0" max="100" placeholder="0" {...methods.register(`items.${index}.taxRate`, { valueAsNumber: true })} />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove line item ${index + 1}`}
                      className="gv-focus-ring mt-0.5 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-semantic-dangerBg hover:text-semantic-danger md:mt-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ description: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 })}
              >
                <Plus className="h-4 w-4" /> Add line item
              </Button>

              {/* Quick amount preview */}
              <div className="flex items-center gap-2 text-sm text-ink-400">
                <Sparkles className="h-4 w-4 text-brand-500" />
                Live total:{" "}
                <span className="font-display font-bold text-ink-900">
                  {formatCurrency(totals.total, watchCurrency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discounts & details */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Discount</CardTitle>
                <CardDescription>Optional invoice-level discount.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Field name="discountType" label="Type">
                  <Select>
                    <option value="fixed">Fixed amount</option>
                    <option value="percentage">Percentage</option>
                  </Select>
                </Field>
                <Field name="discount" label={watchDiscountType === "percentage" ? "Discount (%)" : "Discount amount"}>
                  <Input type="number" step="any" min="0" placeholder="0" />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Notes & terms</CardTitle>
                <CardDescription>Shown on the invoice PDF.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Field name="notes" label="Notes to customer">
                  <Textarea placeholder="Thank you for your business!" rows={2} />
                </Field>
                <Field name="terms" label="Terms & conditions">
                  <Textarea rows={2} />
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card>
          <CardContent>
            <div className="flex flex-col items-end gap-2">
              <SummaryLine label="Subtotal" value={formatCurrency(totals.subtotal, watchCurrency)} />
              <SummaryLine
                label={watchDiscountType === "percentage" ? `Discount (${watchDiscount || 0}%)` : "Discount"}
                value={`− ${formatCurrency(totals.discountTotal, watchCurrency)}`}
                muted={totals.discountTotal === 0}
              />
              <SummaryLine label="Tax" value={formatCurrency(totals.taxTotal, watchCurrency)} />
              <div className="mt-2 flex w-full max-w-xs items-center justify-between rounded-xl bg-ink-900 px-5 py-3.5 text-white">
                <span className="text-sm font-semibold uppercase tracking-wider">Total</span>
                <span className="font-display text-lg font-bold">{formatCurrency(totals.total, watchCurrency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}

function Field({
  name,
  label,
  hint,
  children,
  className,
}: {
  name: string;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  const child = isValidElement(children)
    ? (cloneElement(children as ReactElement, { id: name }) as ReactNode)
    : children;
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      {child}
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

function SummaryLine({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex w-full max-w-xs items-center justify-between text-sm">
      <span className={cn("text-ink-400", muted && "opacity-50")}>{label}</span>
      <span className={cn("font-medium text-ink-700", muted && "opacity-50")}>{value}</span>
    </div>
  );
}