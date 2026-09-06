"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Rocket, Sparkles } from "lucide-react";
import { GenvouchMark } from "@/components/brand/GenvouchMark";
import { GenvouchLoader } from "@/components/brand/GenvouchLoader";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { createWorkspaceAction } from "./actions";

export function SetupClient({ email, name }: { email: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await createWorkspaceAction(Object.fromEntries(form.entries()) as Record<string, string>);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong");
      setBusy(false);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white p-6">
      <GenvouchLoader minDisplayMs={1500} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-[720px] -translate-x-1/2 rounded-full bg-brand-soft blur-3xl opacity-70" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <GenvouchMark className="h-10 w-10" gradientId="setup-g" />
          <div className="leading-none">
            <p className="font-display text-base font-bold tracking-tight text-ink-900">GENVOUCH</p>
            <p className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-ink-400">Invoice Studio</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">Set up your workspace</h1>
              <p className="text-sm text-ink-500">Welcome, {name || email}.</p>
            </div>
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-semantic-dangerBg px-4 py-2.5 text-sm font-medium text-semantic-danger">
              {error}
            </p>
          )}

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div>
              <Label htmlFor="orgName">Workspace name</Label>
              <Input id="orgName" name="orgName" required placeholder="Acme Studio" defaultValue={name ? `${name}'s Studio` : ""} />
              <p className="mt-1 text-xs text-ink-400">Your organization&apos;s name.</p>
            </div>
            <div>
              <Label htmlFor="businessName">Default business name</Label>
              <Input id="businessName" name="businessName" required placeholder="Acme Studio Pvt Ltd" defaultValue={name ? `${name}'s Business` : ""} />
              <p className="mt-1 text-xs text-ink-400">Shown on your invoices. You can add more later.</p>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={busy}>
              <Rocket className="h-4 w-4" /> {busy ? "Creating workspace…" : "Create my workspace"}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              On the free plan — upgrade anytime.
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">Powered by GENVOUCH TECHNOLOGIES PVT</p>
      </motion.div>
    </div>
  );
}