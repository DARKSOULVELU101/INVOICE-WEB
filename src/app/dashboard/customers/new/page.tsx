import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";
import { CustomerForm } from "./customer-form";

export const metadata = { title: "Add customer" };

export default async function NewCustomerPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <CustomerForm />;
}