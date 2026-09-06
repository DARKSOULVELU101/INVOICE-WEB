"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginUser } from "../actions";
import { Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { motion as motionTokens } from "@/core/design";
import { genvouchAuthMotion } from "../motion";
import { GenvouchLoader } from "@/components/brand/GenvouchLoader";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" loading={pending}>
      {pending ? "Signing in…" : "Sign in to your workspace"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginUser, undefined);

  return (
    <motion.div {...genvouchAuthMotion}>
      <GenvouchLoader minDisplayMs={1800} />
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-500">Sign in to manage invoices, team and payments.</p>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-semantic-danger/20 bg-semantic-dangerBg px-4 py-3 text-sm font-medium text-semantic-danger"
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password" className="mb-0">Password</Label>
            <span className="text-xs font-medium text-brand-600 hover:underline">Forgot?</span>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
        </div>
        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New to GENVOUCH?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}