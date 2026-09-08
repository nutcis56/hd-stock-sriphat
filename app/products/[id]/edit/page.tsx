import ProductFormClient, {
  type EditableProduct,
} from "@/components/products/product-form-client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/products");

  const { id } = await params;
  const record = await prisma.product.findUnique({ where: { sku: id } });
  if (!record?.isActive) notFound();
  const product: EditableProduct = {
    sku: record.sku,
    name: record.name,
    sourceNote: record.sourceNote,
    unit: record.unit,
    packSize: Number(record.packSize),
    stockPpk: Number(record.stockPpk),
    stockSri: Number(record.stockSri),
  };

  return <ProductFormClient mode="edit" product={product} />;
}
