import OperationFormClient from "@/components/stock/operation-form-client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReceivePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const products = await prisma.product.findMany({ where: { isActive: true }, select: { sku: true, name: true, unit: true }, orderBy: { name: "asc" } });
  return (
    <OperationFormClient
      mode="receive"
      products={products}
      actor={{
        id: session.user.id,
        username: session.user.username,
        displayName: session.user.name ?? session.user.username,
        position: session.user.position,
      }}
    />
  );
}
