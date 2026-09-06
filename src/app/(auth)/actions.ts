"use server";

import { z } from "zod";
import { prisma } from "@/core/db/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/core/auth/auth";
import { slugify } from "@/core/lib/utils";
import { redirect } from "next/navigation";

function getAppOrigin() {
  if (process.env.AUTH_URL) return process.env.AUTH_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email").transform((e) => e.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function registerUser(
  prev: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists. Try signing in." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const orgSlug = slugify(`${name}-org`) || `org-${Date.now()}`;

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name, email, passwordHash },
    });

    const org = await tx.organization.create({
      data: {
        name: `${name}'s Studio`,
        slug: `${orgSlug}-${created.id.slice(0, 6)}`,
        status: "ACTIVE",
        createdById: created.id,
      },
    });

    await tx.organizationMember.create({
      data: { organizationId: org.id, userId: created.id, role: "OWNER", accepted: true },
    });

    await tx.business.create({
      data: {
        organizationId: org.id,
        name: `${name}'s Business`,
        defaultCurrency: "USD",
        isDefault: true,
      },
    });

    return created;
  });

  await signIn("credentials", {
    email,
    password,
    redirectTo: `${getAppOrigin()}/dashboard`,
  });

  redirect("/dashboard");
}

export async function loginUser(
  prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email and password are required." };

  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse({ email, password });
  if (!parsed.success) return { error: "Please provide a valid email and password." };

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: `${getAppOrigin()}/dashboard`,
    });
  } catch (err) {
    // next-auth throws a redirect after success; ignore it.
    if (isRedirectError(err)) redirect("/dashboard");
    return { error: "Invalid email or password." };
  }
  return { error: "Invalid email or password." };
}

function isRedirectError(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as any).digest === "string" &&
    ((err as any).digest.startsWith("NEXT_REDIRECT") || (err as any).digest.startsWith("NEXT_HTTP"))
  );
}