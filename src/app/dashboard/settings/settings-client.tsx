"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, CreditCard, Plus, Star, Store, Trash2, User } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { Dialog } from "@/components/ui/dialog";
import { saveOrgAction, saveProfileAction } from "./actions";
import { BusinessForm, BusinessPaymentForm } from "./business-forms";

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

export function SettingsClient({
  org,
  businesses,
  profile,
}: {
  org: { id: string; name: string; slug: string; plan: string; taxId: string; country: string };
  businesses: Business[];
  profile: { name: string | null; email: string } | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "org" | "businesses" | "payment">("profile");
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [businessDialog, setBusinessDialog] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "org", label: "Organization", icon: Store },
    { id: "businesses", label: "Businesses", icon: Building2 },
    { id: "payment", label: "Payments", icon: CreditCard },
  ] as const;

  const onOrgSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy("org");
    setError(null);
    setSaved(null);
    const form = new FormData(e.currentTarget);
    const res = await saveOrgAction(Object.fromEntries(form.entries()));
    setBusy(null);
    if (!res.ok) return setError(res.error ?? "Failed to save");
    setSaved("Organization settings saved.");
    router.refresh();
  };

  const onProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy("profile");
    setError(null);
    setSaved(null);
    const form = new FormData(e.currentTarget);
    const res = await saveProfileAction(Object.fromEntries(form.entries()));
    setBusy(null);
    if (!res.ok) return setError(res.error ?? "Failed to save");
    setSaved("Profile updated.");
    router.refresh();
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your workspace, business profiles and payments.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setError(null);
              setSaved(null);
            }}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
              tab === t.id ? "bg-ink-900 text-white shadow-sm" : "text-ink-500 hover:bg-white hover:text-ink-900"
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-semantic-danger/20 bg-semantic-dangerBg px-4 py-3 text-sm font-medium text-semantic-danger">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-semantic-successBg px-4 py-3 text-sm font-medium text-emerald-800">
          <Check className="h-4 w-4" /> {saved}
        </div>
      )}

      {tab === "profile" && (
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Your profile</CardTitle>
                <CardDescription>Your name and email — shown across the workspace.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={onProfileSave} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" defaultValue={profile?.name ?? ""} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={profile?.email ?? ""}
                    disabled
                    className="bg-ink-50 text-ink-400"
                  />
                  <p className="mt-1 text-xs text-ink-400">Email is tied to your account.</p>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" loading={busy === "profile"}>
                    Save profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "org" && (
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                  Your workspace identity. Plan: <span className="font-semibold text-ink-700">{org.plan}</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={onOrgSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="org-name">Organization name</Label>
                    <Input id="org-name" name="name" defaultValue={org.name} required />
                  </div>
                  <div>
                    <Label htmlFor="org-slug">Slug</Label>
                    <Input id="org-slug" name="slug" defaultValue={org.slug} disabled className="bg-ink-50 text-ink-400" />
                  </div>
                  <div>
                    <Label htmlFor="org-tax">Tax ID / GST</Label>
                    <Input id="org-tax" name="taxId" defaultValue={org.taxId ?? ""} />
                  </div>
                  <div>
                    <Label htmlFor="org-country">Country</Label>
                    <Input id="org-country" name="country" defaultValue={org.country ?? ""} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" loading={busy === "org"}>
                    Save organization
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "businesses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">Multiple business profiles under one workspace.</p>
            <Button
              size="sm"
              onClick={() => {
                setEditingBusiness(null);
                setBusinessDialog(true);
              }}
            >
              <Plus className="h-4 w-4" /> New business
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {businesses.map((b) => (
              <Card key={b.id} hover className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-sm font-bold text-white">
                      {b.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <p className="flex items-center gap-2 font-display font-semibold text-ink-900">
                        {b.name}
                        {b.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                            <Star className="h-3 w-3" /> Default
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-ink-400">{b.legalName || (b.type ? b.type.toLowerCase().replace("_", " ") : "Business")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Edit ${b.name}`}
                      onClick={() => {
                        setEditingBusiness(b);
                        setBusinessDialog(true);
                      }}
                    >
                      <PencilGlyph />
                    </Button>
                    {!b.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-ink-400 hover:text-semantic-danger"
                        aria-label={`Delete ${b.name}`}
                        onClick={async () => {
                          const res = await fetch("/api/businesses", {
                            method: "DELETE",
                            body: JSON.stringify({ id: b.id }),
                            headers: { "Content-Type": "application/json" },
                          });
                          if (res.ok) router.refresh();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-ink-400">Currency</dt>
                    <dd className="font-semibold text-ink-800">{b.defaultCurrency}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-400">Tax ID</dt>
                    <dd className="font-semibold text-ink-800">{b.taxId || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-400">Email</dt>
                    <dd className="truncate font-semibold text-ink-800">{b.email || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-400">City</dt>
                    <dd className="font-semibold text-ink-800">{b.city || "—"}</dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "payment" && (
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Payment details</CardTitle>
                <CardDescription>
                  Shown on your invoices. Ready for Stripe, Razorpay & PayPal via the same invoice — no rewrite needed.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {businesses.length === 0 ? (
                <p className="text-sm text-ink-400">Create a business first to add payment details.</p>
              ) : (
                <div className="space-y-5">
                  {businesses.map((b) => (
                    <BusinessPaymentForm key={b.id} business={b} />
                  ))}
                  <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-ink-400">
                    <CreditCard className="h-4 w-4" />
                    Online payments (Stripe / Razorpay / PayPal / UPI) arrive in a future release — your invoices are already
                    structured for them.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog
        open={businessDialog}
        onClose={() => setBusinessDialog(false)}
        title={editingBusiness ? "Edit business" : "New business"}
        description="Identify the business entity on the invoice's FROM side."
        size="lg"
      >
        <BusinessForm
          key={editingBusiness?.id ?? "new"}
          business={editingBusiness}
          onDone={() => {
            setBusinessDialog(false);
            router.refresh();
          }}
        />
      </Dialog>
    </div>
  );
}

function PencilGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793Zm-2.207 2.207-9 9A.75.75 0 0 0 2 15.25V17a.75.75 0 0 0 .75.75h1.75a.75.75 0 0 0 .53-.22l9-9-2.75-2.744Z" />
    </svg>
  );
}