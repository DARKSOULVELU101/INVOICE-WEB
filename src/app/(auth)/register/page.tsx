import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { AuthShell } from "../auth-shell";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return (
    <AuthShell mode="register">
      <RegisterForm />
    </AuthShell>
  );
}