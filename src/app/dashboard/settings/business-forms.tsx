"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { saveBusinessAction } from "./actions";

type Business = {
  id: string;
  name: string;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  type: string | null;
  taxId: string | null;
  defaultCurrency: string;
  isDefault: boolean;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  upiId: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
  bankIFSC: string | null;
};

export function BusinessForm({
  business,
  onDone,
}: {
  business: Business | null;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const form = new FormData(e.currentTarget);
        const res = await saveBusinessAction({ ...Object.fromEntries(form.entries()), id: business?.id });
        setBusy(false);
        if (!res.ok) return setError(res.error ?? "Failed to save");
        onDone();
      }}
    >
      {error && <p className="text-sm font-medium text-semantic-danger">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="b-name">Business name *</Label>
          <Input id="b-name" name="name" required defaultValue={business?.name ?? ""} placeholder="Acme Studio" />
        </div>
        <div>
          <Label htmlFor="b-legal">Legal name</Label>
          <Input id="b-legal" name="legalName" defaultValue={business?.legalName ?? ""} placeholder="Acme Studio Pvt Ltd" />
        </div>
        <div>
          <Label htmlFor="b-type">Type</Label>
          <Select id="b-type" name="type" defaultValue={business?.type ?? "SOLE_PROPRIETORSHIP"}>
            <option value="SOLE_PROPRIETORSHIP">Sole proprietorship</option>
            <option value="PARTNERSHIP">Partnership</option>
            <option value="LLC">LLC</option>
            <option value="PRIVATE_LIMITED">Private limited</option>
            <option value="PUBLIC_LIMITED">Public limited</option>
            <option value="NON_PROFIT">Non-profit</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="b-currency">Currency</Label>
          <Select id="b-currency" name="defaultCurrency" defaultValue={business?.defaultCurrency ?? "USD"}>
            {["USD", "EUR", "INR", "GBP", "AUD", "CAD", "AED", "SGD"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="b-email">Email</Label>
          <Input id="b-email" name="email" type="email" defaultValue={business?.email ?? ""} />
        </div>
        <div>
          <Label htmlFor="b-phone">Phone</Label>
          <Input id="b-phone" name="phone" defaultValue={business?.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="b-tax">Tax ID</Label>
          <Input id="b-tax" name="taxId" defaultValue={business?.taxId ?? ""} placeholder="GSTIN / VAT" />
        </div>
        <div>
          <Label htmlFor="b-website">Website</Label>
          <Input id="b-website" name="website" defaultValue={business?.website ?? ""} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="b-addr1">Address line 1</Label>
          <Input id="b-addr1" name="addressLine1" defaultValue={business?.addressLine1 ?? ""} placeholder="123 Market Street" />
        </div>
        <div>
          <Label htmlFor="b-addr2">Address line 2</Label>
          <Input id="b-addr2" name="addressLine2" defaultValue={business?.addressLine2 ?? ""} />
        </div>
        <div>
          <Label htmlFor="b-city">City</Label>
          <Input id="b-city" name="city" defaultValue={business?.city ?? ""} />
        </div>
        <div>
          <Label htmlFor="b-state">State / Province</Label>
          <Input id="b-state" name="state" defaultValue={business?.state ?? ""} />
        </div>
        <div>
          <Label htmlFor="b-postal">Postal code</Label>
          <Input id="b-postal" name="postalCode" defaultValue={business?.postalCode ?? ""} />
        </div>
        <div>
          <Label htmlFor="b-country">Country</Label>
          <Input id="b-country" name="country" defaultValue={business?.country ?? ""} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {business ? "Save changes" : "Create business"}
        </Button>
      </div>
    </form>
  );
}

export function BusinessPaymentForm({ business }: { business: Business }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <form
      className="rounded-xl border border-border p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setSaved(null);
        const form = new FormData(e.currentTarget);
        const res = await saveBusinessAction({ ...Object.fromEntries(form.entries()), id: business.id });
        setBusy(false);
        if (res.ok) {
          setSaved("Saved.");
          router.refresh();
        }
      }}
    >
      <p className="mb-3 text-sm font-semibold text-ink-900">{business.name}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`bank-${business.id}`}>Bank name</Label>
          <Input id={`bank-${business.id}`} name="bankName" defaultValue={business.bankName ?? ""} placeholder="HDFC Bank" />
        </div>
        <div>
          <Label htmlFor={`acct-${business.id}`}>Account number</Label>
          <Input id={`acct-${business.id}`} name="bankAccountNo" defaultValue={business.bankAccountNo ?? ""} placeholder="00012345678" />
        </div>
        <div>
          <Label htmlFor={`ifsc-${business.id}`}>IFSC / SWIFT</Label>
          <Input id={`ifsc-${business.id}`} name="bankIFSC" defaultValue={business.bankIFSC ?? ""} placeholder="HDFC0001234" />
        </div>
        <div>
          <Label htmlFor={`upi-${business.id}`}>UPI ID</Label>
          <Input id={`upi-${business.id}`} name="upiId" defaultValue={business.upiId ?? ""} placeholder="payments@okaxis" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        {saved && <span className="text-xs font-medium text-emerald-600">{saved}</span>}
        <Button type="submit" variant="secondary" size="sm" loading={busy}>
          Save
        </Button>
      </div>
    </form>
  );
}