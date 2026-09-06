"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, MailCheck } from "lucide-react";
import { GenvouchMark } from "@/components/brand/GenvouchMark";
import { Button } from "@/components/ui/button";
import { acceptInvitationAction } from "../../dashboard/team/actions";

export function AcceptInvite({ token, orgName }: { token: string; orgName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAccept = async () => {
    setBusy(true);
    setError(null);
    const res = await acceptInvitationAction(token);
    if (!res.ok) {
      setError(res.error ?? "Couldn't accept invitation");
      setBusy(false);
      return;
    }
    router.push(res.redirectTo ?? "/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-surface-subtle to-surface p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 text-white">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink-900">
          You&apos;re invited
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          <strong className="text-ink-800">{orgName}</strong> has invited you to collaborate on
          GENVOUCH Invoice Studio. Accept to join the workspace.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-semantic-dangerBg px-4 py-2.5 text-sm font-medium text-semantic-danger">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-3">
          <Button onClick={onAccept} className="w-full" size="lg" loading={busy}>
            {busy ? "Joining…" : "Accept invitation"}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            Secured end-to-end
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-border pt-5">
          <GenvouchMark className="h-6 w-6" gradientId="invite-g" />
          <span className="text-xs text-ink-400">Powered by GENVOUCH TECHNOLOGIES PVT</span>
        </div>
      </motion.div>
    </div>
  );
}