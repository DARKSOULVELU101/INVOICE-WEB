"use client";

import { motion } from "framer-motion";
import { motion as motionTokens } from "@/core/design";
import {
  FileText,
  Pencil,
  Send,
  Globe,
  Download,
  Trash2,
  ShieldCheck,
  UserPlus,
  UserMinus,
  Mail,
  Wallet,
  Settings as SettingsIcon,
  Crown,
  LogIn,
  LogOut,
} from "lucide-react";

const actionMeta: Record<string, { icon: any; tone: string; label: string }> = {
  INVOICE_CREATED: { icon: FileText, tone: "bg-brand-50 text-brand-600", label: "Invoice created" },
  INVOICE_EDITED: { icon: Pencil, tone: "bg-slate-100 text-slate-600", label: "Invoice edited" },
  INVOICE_SENT: { icon: Send, tone: "bg-violet-50 text-violet-600", label: "Invoice sent" },
  INVOICE_VIEWED: { icon: Globe, tone: "bg-amber-50 text-amber-600", label: "Invoice viewed" },
  INVOICE_DOWNLOADED: { icon: Download, tone: "bg-cyan-50 text-cyan-600", label: "Invoice downloaded" },
  INVOICE_DELETED: { icon: Trash2, tone: "bg-rose-50 text-rose-600", label: "Invoice deleted" },
  INVOICE_PAID: { icon: Wallet, tone: "bg-emerald-50 text-emerald-600", label: "Invoice paid" },
  LOGIN: { icon: LogIn, tone: "bg-slate-100 text-slate-600", label: "Signed in" },
  LOGOUT: { icon: LogOut, tone: "bg-slate-100 text-slate-600", label: "Signed out" },
  ORG_CREATED: { icon: Crown, tone: "bg-brand-50 text-brand-600", label: "Workspace created" },
  ORG_UPDATED: { icon: SettingsIcon, tone: "bg-slate-100 text-slate-600", label: "Workspace updated" },
  MEMBER_INVITED: { icon: UserPlus, tone: "bg-brand-50 text-brand-600", label: "Member invited" },
  MEMBER_ROLE_CHANGED: { icon: ShieldCheck, tone: "bg-violet-50 text-violet-600", label: "Role changed" },
  MEMBER_REMOVED: { icon: UserMinus, tone: "bg-rose-50 text-rose-600", label: "Member removed" },
  EMAIL_SENT: { icon: Mail, tone: "bg-violet-50 text-violet-600", label: "Email sent" },
  SETTINGS_UPDATED: { icon: SettingsIcon, tone: "bg-slate-100 text-slate-600", label: "Settings updated" },
};

export function AuditTimeline({
  entries,
}: {
  entries: { id: string; action: string; description: string | null; actorName: string | null; actorEmail: string | null; createdAt: string }[];
}) {
  return (
    <div className="relative space-y-6 pl-1">
      <span className="absolute left-[15px] top-2 bottom-4 w-px bg-border" />
      {entries.map((e, i) => {
        const meta = actionMeta[e.action] ?? { icon: ShieldCheck, tone: "bg-slate-100 text-slate-600", label: e.action };
        return (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.duration.base, delay: Math.min(i * 0.015, 0.4) }}
            className="relative flex items-start gap-4"
          >
            <span className={`z-10 mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full ${meta.tone}`}>
              <meta.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink-900">{meta.label}</p>
                <time className="text-xs text-ink-400">
                  {new Date(e.createdAt).toLocaleString("en-US", {
                    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                  })}
                </time>
              </div>
              {e.description && <p className="mt-0.5 text-sm text-ink-500">{e.description}</p>}
              <p className="mt-0.5 text-xs text-ink-400">
                {e.actorName ?? "System"} {e.actorEmail ? `· ${e.actorEmail}` : ""}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}