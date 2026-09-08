"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type CalculatorFormState = {
  status: "idle" | "success" | "error";
  message: string;
  reorderPoint: number | null;
  eventId: number;
};

export async function saveReorderPoint(
  _previousState: CalculatorFormState,
  formData: FormData,
): Promise<CalculatorFormState> {
  const session = await auth();
  if (!session?.user) {
    return {
      status: "error",
      message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
      reorderPoint: null,
      eventId: Date.now(),
    };
  }

  const productSku = String(formData.get("productSku") ?? "").trim();
  const weekly = Number(formData.get("weekly"));
  const weeks = Number(formData.get("weeks"));
  const safety = Number(formData.get("safety"));

  if (
    !productSku ||
    !Number.isFinite(weekly) ||
    weekly < 0 ||
    ![4, 6].includes(weeks) ||
    !Number.isFinite(safety) ||
    safety < 0
  ) {
    return {
      status: "error",
      message: "ข้อมูลสำหรับคำนวณไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
      reorderPoint: null,
      eventId: Date.now(),
    };
  }

  const base = weekly * weeks;
  const reorderPoint = Math.ceil(base + (base * safety) / 100);

  try {
    const updated = await prisma.product.updateMany({
      where: { sku: productSku, isActive: true },
      data: { reorderPoint },
    });

    if (updated.count !== 1) {
      return {
        status: "error",
        message: "ไม่พบสินค้า หรือสินค้าถูกปิดใช้งานแล้ว",
        reorderPoint: null,
        eventId: Date.now(),
      };
    }
  } catch {
    return {
      status: "error",
      message: "บันทึกจุดเตือนไม่สำเร็จ กรุณาลองอีกครั้ง",
      reorderPoint: null,
      eventId: Date.now(),
    };
  }

  revalidatePath("/products");
  revalidatePath("/calculator");

  return {
    status: "success",
    message: `บันทึกจุดเตือน ${reorderPoint} หน่วยเรียบร้อยแล้ว`,
    reorderPoint,
    eventId: Date.now(),
  };
}
