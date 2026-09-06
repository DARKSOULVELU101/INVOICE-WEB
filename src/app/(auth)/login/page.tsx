import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { AuthShell } from "../auth-shell";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return (
    <AuthShell mode="login">
      <LoginForm />
    </AuthShell>
  );
}