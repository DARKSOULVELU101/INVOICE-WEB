"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerUser } from "../actions";
import { Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { genvouchAuthMotion } from "../motion";
import { GenvouchLoader } from "@/components/brand/GenvouchLoader";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" loading={pending}>
      {pending ? "Creating your workspace…" : "Create my free workspace"}
    </Button>
  );
}

function ErrorField({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1.5 text-xs font-medium text-semantic-danger">{errors[0]}</p>;
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerUser, undefined);

  return (
    <motion.div {...genvouchAuthMotion}>
      <GenvouchLoader minDisplayMs={1800} />
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">
          Start your studio
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          One workspace with organizations, teams and unlimited invoices.
        </p>
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
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Ada Lovelace" required />
          <ErrorField errors={state?.fieldErrors?.name} />
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
          <ErrorField errors={state?.fieldErrors?.email} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" required />
          <ErrorField errors={state?.fieldErrors?.password} />
        </div>
        <SubmitButton />
        <p className="text-center text-xs text-ink-400">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}