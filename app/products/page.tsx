import ProductListClient, {
  type ProductListItem,
} from "@/components/products/product-list-client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ toast?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { toast } = await searchParams;
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

  return (
    <ProductListClient
      key={toast ?? "products"}
      products={products}
      canManage={session.user.role === "ADMIN"}
      successToast={
        toast === "receive-success"
          ? "receive"
          : toast === "transfer-success"
            ? "transfer"
            : toast === "usage-success"
              ? "usage"
              : toast === "product-created"
                ? "product-created"
                : toast === "product-updated"
                  ? "product-updated"
                  : undefined
      }
    />
  );
}
