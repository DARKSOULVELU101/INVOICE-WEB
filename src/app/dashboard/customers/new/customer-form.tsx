"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { saveCustomerAction } from "./actions";
import { ArrowLeft, UserPlus } from "lucide-react";

export function CustomerForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    const res = await saveCustomerAction(data);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to save customer");
      return;
    }
    router.push(`/dashboard/customers`);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6" noValidate>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/customers")}
          className="gv-focus-ring rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          aria-label="Back to customers"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Add customer</h1>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-semantic-danger/20 bg-semantic-dangerBg px-4 py-3 text-sm font-medium text-semantic-danger">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Who you&apos;re billing.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name *</Label>
              <Input id="name" name="name" required placeholder="Jane Doe" />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" placeholder="Acme Inc." />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="jane@acme.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+1 555 000 1234" />
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID</Label>
              <Input id="taxId" name="taxId" placeholder="GST/VAT/TIN" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" placeholder="United States" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Address</CardTitle>
            <CardDescription>Appears on the invoice as the billing address.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="addressLine1">Address line 1</Label>
              <Input id="addressLine1" name="addressLine1" placeholder="123 Market Street" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="addressLine2">Address line 2</Label>
              <Input id="addressLine2" name="addressLine2" placeholder="Suite 400" />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="San Francisco" />
            </div>
            <div>
              <Label htmlFor="state">State / Province</Label>
              <Input id="state" name="state" placeholder="CA" />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal code</Label>
              <Input id="postalCode" name="postalCode" placeholder="94103" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Internal notes, invisible on the invoice.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea id="notes" name="notes" rows={2} placeholder="Payment preference, contact person, etc." />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/customers")}>Cancel</Button>
        <Button type="submit" loading={saving}>
          <UserPlus className="h-4 w-4" /> {saving ? "Saving…" : "Save customer"}
        </Button>
      </div>
    </form>
  );
}