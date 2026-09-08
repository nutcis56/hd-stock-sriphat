"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StockLocation, TransactionType } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type ReceiveFormState = {
  status: "idle" | "error";
  message: string;
};

export async function receiveStock(
  _previousState: ReceiveFormState,
  formData: FormData,
): Promise<ReceiveFormState> {
  const session = await auth();
  if (!session?.user) {
    return { status: "error", message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  const productSku = String(formData.get("productSku") ?? "").trim();
  const toLocationValue = String(formData.get("toLocation") ?? "");
  const quantity = Number(formData.get("quantity"));
  const note = String(formData.get("note") ?? "").trim();

  if (
    !productSku ||
    (toLocationValue !== StockLocation.PPK && toLocationValue !== StockLocation.SRI)
  ) {
    return { status: "error", message: "กรุณาเลือกสินค้าและปลายทางรับเข้า" };
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { status: "error", message: "จำนวนรับเข้าต้องมากกว่า 0" };
  }

  const toLocation = toLocationValue as StockLocation;

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { sku: productSku, isActive: true },
        data:
          toLocation === StockLocation.PPK
            ? { stockPpk: { increment: quantity } }
            : { stockSri: { increment: quantity } },
        select: { stockPpk: true, stockSri: true },
      });

      await tx.transaction.create({
        data: {
          type:
            toLocation === StockLocation.PPK
              ? TransactionType.RECEIVE_PPK
              : TransactionType.RECEIVE_SRI,
          quantity,
          toLocation,
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
  } catch {
    return { status: "error", message: "บันทึกรับสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }

  revalidatePath("/products");
  revalidatePath("/receive");
  revalidatePath("/transactions");
  redirect("/products?toast=receive-success");
}
