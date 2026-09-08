import UserFormClient from "@/components/admin/user-form-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewUserPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/products");

  return <UserFormClient mode="create" />;
}
