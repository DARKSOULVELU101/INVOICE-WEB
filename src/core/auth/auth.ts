import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/core/db/prisma";
import { z } from "zod";
import type { OrgRole } from "@/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(8),
          })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: {
            memberships: {
              where: { accepted: true },
include: { organization: { select: { id: true, name: true, slug: true, logo: true, status: true } } },
            },
          },
        });

        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        const defaultMembership =
          user.memberships.find((m) => m.organization.status === "ACTIVE") ?? user.memberships[0];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          defaultOrg: defaultMembership
            ? {
                id: defaultMembership.organization.id,
                name: defaultMembership.organization.name,
                slug: defaultMembership.organization.slug,
                logo: defaultMembership.organization.logo,
              }
            : null,
          memberships: user.memberships.map((m) => ({
            organizationId: m.organizationId,
            role: m.role as OrgRole,
          })),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.defaultOrg = (user as any).defaultOrg;
        token.memberships = (user as any).memberships;
      }

      // Keep org membership fresh (covers setup / invitations after login).
      if (token.id && (!token.memberships || trigger === "update")) {
        try {
          const memberships = await prisma.organizationMember.findMany({
            where: { userId: token.id as string, accepted: true, organization: { status: "ACTIVE" } },
            include: { organization: { select: { id: true, name: true, slug: true, logo: true } } },
            orderBy: { createdAt: "asc" },
          });
          token.memberships = memberships.map((m) => ({
            organizationId: m.organizationId,
            role: m.role as OrgRole,
          }));
          const existingDefaultId = (token.defaultOrg as any)?.id;
          const defaultOrg =
            memberships.find((m) => m.organization.id === existingDefaultId) ?? memberships[0];
          token.defaultOrg = defaultOrg
            ? {
                id: defaultOrg.organization.id,
                name: defaultOrg.organization.name,
                slug: defaultOrg.organization.slug,
                logo: defaultOrg.organization.logo,
              }
            : null;
        } catch (err) {
          console.error("[auth] failed to refresh org memberships", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).defaultOrg = token.defaultOrg as any;
        (session.user as any).memberships = token.memberships as any;
      }
      return session;
    },
  },
});