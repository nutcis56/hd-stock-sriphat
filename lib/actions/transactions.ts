"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseTransactionDateRange } from "@/lib/transaction-date-range";

type DeleteTransactionsResult = {
  status: "success" | "error";
  message: string;
  deletedCount?: number;
};

export async function deleteTransactionsByRange(
  startValue: string,
  endValue: string,
): Promise<DeleteTransactionsResult> {
  const session = await auth();
  if (!session?.user || session.user.username.toLowerCase() !== "admin") {
    return { status: "error", message: "เฉพาะบัญชี admin เท่านั้นที่ลบรายการได้" };
  }

  const range = parseTransactionDateRange(startValue, endValue);
  if (!range) {
    return { status: "error", message: "ช่วงวันที่ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" };
  }

  try {
    const result = await prisma.transaction.deleteMany({
      where: {
        createdAt: { gte: range.start, lt: range.endExclusive },
      },
    });
    revalidatePath("/transactions");
    return {
      status: "success",
      message: `ลบประวัติรายการ ${result.count.toLocaleString("th-TH")} รายการแล้ว`,
      deletedCount: result.count,
    };
  } catch {
    return { status: "error", message: "ลบประวัติรายการไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
}
