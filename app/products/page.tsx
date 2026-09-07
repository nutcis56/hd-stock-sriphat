import ProductListClient, {
  type ProductListItem,
} from "@/components/products/product-list-client";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductPage() {
  const records = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ name: "asc" }, { sku: "asc" }],
  });

  const products: ProductListItem[] = records.map((product) => ({
    sku: product.sku,
    name: product.name,
    unit: product.unit,
    packSize: Number(product.packSize),
    stockPpk: Number(product.stockPpk),
    stockSri: Number(product.stockSri),
    reorderPoint: Number(product.reorderPoint),
    sourceNote: product.sourceNote,
    updatedAt: product.updatedAt.toISOString(),
  }));

  return <ProductListClient products={products} />;
}
