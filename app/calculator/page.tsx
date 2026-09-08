import CalculatorClient, {
  type CalculatorProduct,
} from "@/components/stock/calculator-client";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CalculatorPage() {
  const records = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      sku: true,
      name: true,
      unit: true,
      packSize: true,
      stockSri: true,
      reorderPoint: true,
    },
    orderBy: [{ name: "asc" }, { sku: "asc" }],
  });
  const products: CalculatorProduct[] = records.map((product) => ({
    sku: product.sku,
    name: product.name,
    unit: product.unit,
    packSize: Number(product.packSize),
    stockSri: Number(product.stockSri),
    reorderPoint: Number(product.reorderPoint),
  }));

  return <CalculatorClient products={products} />;
}
