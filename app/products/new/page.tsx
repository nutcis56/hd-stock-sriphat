import ProductFormClient from "@/components/products/product-form-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/products");

  return <ProductFormClient mode="create" />;
}
