"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, MailPlus, Crown, Trash2, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { inviteMemberAction, removeMemberAction, updateRoleAction } from "./actions";
import type { OrgRole } from "@/types";

type Member = {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  role: OrgRole;
  isCurrentUser: boolean;
};

type Invitation = {
  id: string;
  email: string;
  role: OrgRole;
  createdAt: string;
};

const roleMeta: Record<OrgRole, { label: string; variant: "brand" | "success" | "accent" | "neutral" | "info" }> = {
  OWNER: { label: "Owner", variant: "brand" },
  ADMIN: { label: "Admin", variant: "accent" },
  BILLING: { label: "Billing", variant: "info" },
  MEMBER: { label: "Member", variant: "neutral" },
  VIEWER: { label: "Viewer", variant: "neutral" },
};

export function TeamClient({
  members,
  invitations,
  canManage,
}: {
  members: Member[];
  invitations: Invitation[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("MEMBER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    const res = await inviteMemberAction(email, role);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to invite");
      return;
    }
    setEmail("");
    setSuccess(`Invitation sent to ${res.email}.`);
    router.refresh();
  };

  const onRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this workspace?`)) return;
    await removeMemberAction(userId);
    router.refresh();
  };

  const onChangeRole = async (userId: string, newRole: OrgRole) => {
    await updateRoleAction(userId, newRole);
    router.refresh();
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">Team</h1>
        <p className="mt-1 text-sm text-ink-500">Manage who can create, send and control invoices.</p>
      </div>

      {invitations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div>
              <CardTitle>Pending invitations</CardTitle>
              <CardDescription>Waiting for these people to accept.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {invitations.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                      <MailPlus className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-900">{inv.email}</p>
                      <p className="text-xs text-ink-400">Invited {new Date(inv.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={roleMeta[inv.role].variant}>{roleMeta[inv.role].label}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {canManage && (
        <Card className="mb-6">
          <CardHeader>
            <div>
              <CardTitle>Invite a teammate</CardTitle>
              <CardDescription>They&apos;ll get an email with a secure invitation link.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" />
              </div>
              <div className="sm:w-44">
                <Label htmlFor="invite-role">Role</Label>
                <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as OrgRole)}>
                  <option value="MEMBER">Member</option>
                  <option value="BILLING">Billing</option>
                  <option value="ADMIN">Admin</option>
                  <option value="VIEWER">Viewer</option>
                </Select>
              </div>
              <Button type="submit" loading={busy}>
                <UserPlus className="h-4 w-4" /> Invite
              </Button>
            </form>
            {error && <p className="mt-3 text-sm font-medium text-semantic-danger">{error}</p>}
            {success && <p className="mt-3 text-sm font-medium text-emerald-600">{success}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Members ({members.length})</CardTitle>
            <CardDescription>People with access to this workspace.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/60">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3.5">
                <Avatar name={m.name} image={m.image} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink-900">
                    {m.name ?? "Unnamed"}
                    {m.isCurrentUser && <span className="text-xs font-normal text-ink-400">(you)</span>}
                    {m.role === "OWNER" && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                  </p>
                  <p className="truncate text-xs text-ink-400">{m.email}</p>
                </div>
                <Badge variant={roleMeta[m.role].variant}>{roleMeta[m.role].label}</Badge>
                {canManage && !m.isCurrentUser && m.role !== "OWNER" && (
                  <div className="flex items-center gap-1.5">
                    <Select
                      defaultValue={m.role}
                      onChange={(e) => onChangeRole(m.userId, e.target.value as OrgRole)}
                      className="h-8 w-28 text-xs"
                      aria-label={`Change role for ${m.name ?? m.email}`}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="BILLING">Billing</option>
                      <option value="ADMIN">Admin</option>
                      <option value="VIEWER">Viewer</option>
                    </Select>
                    <button
                      onClick={() => onRemove(m.userId, m.name ?? m.email)}
                      aria-label={`Remove ${m.name ?? m.email}`}
                      className="gv-focus-ring rounded-md p-1.5 text-ink-400 transition-colors hover:bg-semantic-dangerBg hover:text-semantic-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-ink-600">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <p>
          Role-based access controls what each member can do. <strong>Owners</strong> and <strong>Admins</strong> can manage members and settings.
        </p>
      </div>
    </div>
  );
}