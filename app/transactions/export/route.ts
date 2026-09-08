import ExcelJS from "exceljs";
import type { NextRequest } from "next/server";
import type { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseTransactionDateRange } from "@/lib/transaction-date-range";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const transactionTypeLabel: Record<string, string> = {
  RECEIVE_PPK: "รับเข้าพฤกพลัง",
  RECEIVE_SRI: "รับเข้าศรีพัฒน์",
  TRANSFER: "โอนไปศรีพัฒน์",
  USE_SRI: "ตัดใช้ศรีพัฒน์",
  ADJUST: "ปรับยอด",
};

type ExportRow = Prisma.TransactionGetPayload<{
  include: { product: { select: { name: true; unit: true } } };
}>;

async function loadTransactions(start: Date, endExclusive: Date) {
  const result: ExportRow[] = [];
  let cursor: string | undefined;

  while (true) {
    const batch = await prisma.transaction.findMany({
      where: { createdAt: { gte: start, lt: endExclusive } },
      take: 5000,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: {
        product: { select: { name: true, unit: true } },
      },
    });
    result.push(...batch);
    if (batch.length < 5000) break;
    cursor = batch.at(-1)?.id;
  }

  return result;
}

function formatBangkokDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
}

function exportValues(transaction: ExportRow) {
  return [
    transaction.id,
    formatBangkokDate(transaction.createdAt),
    transactionTypeLabel[transaction.type] ?? transaction.type,
    transaction.productSku,
    transaction.product.name,
    Number(transaction.quantity),
    transaction.product.unit,
    transaction.fromLocation ?? "",
    transaction.toLocation ?? "",
    transaction.actorUsername,
    transaction.actorName,
    transaction.stockPpkAfter === null ? "" : Number(transaction.stockPpkAfter),
    transaction.stockSriAfter === null ? "" : Number(transaction.stockSriAfter),
    transaction.note ?? "",
    transaction.receiptUrl ?? "",
  ];
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const format = request.nextUrl.searchParams.get("format");
  const startValue = request.nextUrl.searchParams.get("start") ?? "";
  const endValue = request.nextUrl.searchParams.get("end") ?? "";
  const range = parseTransactionDateRange(startValue, endValue);
  if (!range || (format !== "csv" && format !== "xlsx")) {
    return new Response("Invalid export parameters", { status: 400 });
  }

  const transactions = await loadTransactions(range.start, range.endExclusive);
  const headers = [
    "Transaction ID",
    "วันเวลา",
    "ประเภท",
    "SKU",
    "สินค้า",
    "จำนวน",
    "หน่วย",
    "จาก",
    "ไป",
    "Username",
    "ผู้ดำเนินการ",
    "ยอดพฤกพลังหลังรายการ",
    "ยอดศรีพัฒน์หลังรายการ",
    "หมายเหตุ",
    "หลักฐาน",
  ];
  const filename = `transactions_${startValue}_${endValue}`;

  if (format === "csv") {
    const rows = [headers, ...transactions.map(exportValues)];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "HD Stock Platform";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet("Transactions", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  worksheet.addRow(headers);
  transactions.forEach((transaction) => worksheet.addRow(exportValues(transaction)));
  worksheet.autoFilter = { from: "A1", to: "O1" };
  worksheet.columns = [
    { width: 28 }, { width: 24 }, { width: 19 }, { width: 16 }, { width: 32 },
    { width: 12 }, { width: 11 }, { width: 12 }, { width: 12 }, { width: 18 },
    { width: 24 }, { width: 22 }, { width: 22 }, { width: 38 }, { width: 38 },
  ];
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF522188" },
  };
  headerRow.alignment = { vertical: "middle" };
  headerRow.height = 24;
  worksheet.getColumn(6).numFmt = "0.00";
  worksheet.getColumn(12).numFmt = "0.00";
  worksheet.getColumn(13).numFmt = "0.00";

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
