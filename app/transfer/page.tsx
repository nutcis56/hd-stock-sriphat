import OperationFormClient from "@/components/stock/operation-form-client";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TransferPage() {
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { sku: true, name: true, unit: true }, orderBy: { name: "asc" } });
  return <OperationFormClient mode="transfer" products={products} />;
}
