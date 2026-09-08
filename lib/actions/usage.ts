"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StockLocation, TransactionType } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type UsageFormState = {
  status: "idle" | "error";
  message: string;
};

export async function useStock(
  _previousState: UsageFormState,
  formData: FormData,
): Promise<UsageFormState> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const productSku = String(formData.get("productSku") ?? "").trim();
  const quantity = Number(formData.get("quantity"));
  const note = String(formData.get("note") ?? "").trim();

  if (!productSku || !Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Invalid usage data");
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.product.updateMany({
      where: {
        sku: productSku,
        isActive: true,
        stockSri: { gte: quantity },
      },
      data: { stockSri: { decrement: quantity } },
    });

    if (updated.count !== 1) {
      throw new Error("Insufficient stock or product not found");
    }

    const product = await tx.product.findUniqueOrThrow({
      where: { sku: productSku },
      select: { stockPpk: true, stockSri: true },
    });

    await tx.transaction.create({
      data: {
        type: TransactionType.USE_SRI,
        quantity,
        fromLocation: StockLocation.SRI,
        note: note || null,
        actorUserId: session.user.id,
        actorUsername: session.user.username,
        actorName: session.user.name ?? session.user.username,
        stockPpkAfter: product.stockPpk,
        stockSriAfter: product.stockSri,
        productSku,
      },
    });
  });

  revalidatePath("/products");
  revalidatePath("/usage");
  revalidatePath("/transactions");
  redirect("/products?toast=usage-success");
}
