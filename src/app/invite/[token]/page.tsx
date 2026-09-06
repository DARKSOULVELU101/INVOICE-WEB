import { notFound, redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { prisma } from "@/core/db/prisma";
import { AcceptInvite } from "./accept-invite";

export const metadata = { title: "Join workspace" };

export default async function InvitePage({ params }: { params: { token: string } }) {
  const session = await auth();
  if (!session?.user) return redirect(`/login?next=/invite/${params.token}`);

  const invitation = await prisma.invitation.findUnique({
    where: { token: params.token },
    include: { organization: { select: { name: true, slug: true, plan: true } } },
  });

  if (!invitation || invitation.acceptedAt) notFound();
  if (invitation.email.toLowerCase() !== session.user.email?.toLowerCase()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          <h1 className="font-display text-xl font-bold text-ink-900">Wrong account</h1>
          <p className="mt-2 text-sm text-ink-500">
            This invitation was sent to <strong>{invitation.email}</strong>. Sign in with that email to accept it.
          </p>
        </div>
      </div>
    );
  }

  return <AcceptInvite token={params.token} orgName={invitation.organization.name} />;
}