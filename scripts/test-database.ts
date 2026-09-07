import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const { default: prisma } = await import("../lib/prisma");

  const [products, staff, users, admins, transactions, stockTotals] = await prisma.$transaction([
    prisma.product.count(),
    prisma.staff.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.transaction.count(),
    prisma.product.aggregate({
      _sum: {
        stockPpk: true,
        stockSri: true,
      },
    }),
  ]);

  console.log("Database connection successful");
  console.log({
    products,
    staff,
    users,
    admins,
    transactions,
    stockPpk: stockTotals._sum.stockPpk?.toString() ?? "0",
    stockSri: stockTotals._sum.stockSri?.toString() ?? "0",
  });

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Database connection failed", error);
  process.exitCode = 1;
});
