import type { OrgRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

type OrgSummary = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
};

type MembershipSummary = {
  organizationId: string;
  role: OrgRole;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      defaultOrg?: OrgSummary | null;
      memberships?: MembershipSummary[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    defaultOrg?: OrgSummary | null;
    memberships?: MembershipSummary[];
  }
}