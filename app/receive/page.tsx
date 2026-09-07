import OperationFormClient from "@/components/stock/operation-form-client";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReceivePage() {
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { sku: true, name: true, unit: true }, orderBy: { name: "asc" } });
  return <OperationFormClient mode="receive" products={products} />;
}
