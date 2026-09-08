import Link from "next/link";
import TransactionToolbarClient from "@/components/transactions/transaction-toolbar-client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  currentBangkokMonth,
  parseTransactionDateRange,
  parseTransactionMonth,
} from "@/lib/transaction-date-range";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const transactionTypeLabel: Record<string, string> = {
  RECEIVE_PPK: "รับเข้าพฤกพลัง",
  RECEIVE_SRI: "รับเข้าศรีพัฒน์",
  TRANSFER: "โอนไปศรีพัฒน์",
  USE_SRI: "ตัดใช้ศรีพัฒน์",
  ADJUST: "ปรับยอด",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const query = await searchParams;
  const defaultRange = parseTransactionMonth(currentBangkokMonth())!;
  const selectedRange = parseTransactionDateRange(
    query.start ?? "",
    query.end ?? "",
  );
  const startValue = selectedRange ? query.start! : defaultRange.startValue;
  const endValue = selectedRange ? query.end! : defaultRange.endValue;
  const range = selectedRange ?? defaultRange;
  const requestedPage = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const where = {
    createdAt: { gte: range.start, lt: range.endExclusive },
  };
  const [total, transactions] = await prisma.$transaction([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      skip: (requestedPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        product: { select: { name: true, unit: true } },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (requestedPage > totalPages && total > 0) {
    redirect(
      `/transactions?start=${startValue}&end=${endValue}&page=${totalPages}`,
    );
  }

  const rangeDate = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok",
  });
  const rangeLabel = `${rangeDate.format(range.start)} – ${rangeDate.format(
    new Date(range.endExclusive.getTime() - 1),
  )}`;
  const date = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
  const number = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 });

  return (
    <section className="operation-page transaction-page">
      <div className="content-heading">
        <div>
          <span className="eyebrow">AUDIT LOG</span>
          <h2>ประวัติรายการ</h2>
          <p>ตรวจสอบ ส่งออก และจัดการประวัติการเคลื่อนไหวสินค้า</p>
        </div>
      </div>

      <TransactionToolbarClient
        appliedStart={startValue}
        appliedEnd={endValue}
        canDelete={session.user.username.toLowerCase() === "admin"}
      />

      <article className="panel transaction-list-panel">
        <div className="panel-heading">
          <div>
            <h2>Transaction Log — {rangeLabel}</h2>
            <p>แสดงครั้งละ {PAGE_SIZE} รายการ</p>
          </div>
          <span className="item-count">{number.format(total)} รายการ</span>
        </div>
        {transactions.length === 0 ? (
          <div className="empty-history">
            <h3>ไม่พบรายการในช่วงวันที่นี้</h3>
            <p>ลองปรับวันที่เริ่มต้นและวันที่สิ้นสุด แล้วค้นหาอีกครั้ง</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>วันเวลา</th>
                  <th>ประเภท</th>
                  <th>สินค้า</th>
                  <th className="right">จำนวน</th>
                  <th>จาก → ไป</th>
                  <th>ผู้ดำเนินการ</th>
                  <th>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{date.format(transaction.createdAt)}</td>
                    <td>
                      <span className={`transaction-type ${transaction.type.toLowerCase()}`}>
                        {transactionTypeLabel[transaction.type] ?? transaction.type}
                      </span>
                    </td>
                    <td>
                      <strong className="transaction-product-name">
                        {transaction.product.name}
                      </strong>
                      <small className="transaction-sku">SKU {transaction.productSku}</small>
                    </td>
                    <td className="right stock-number">
                      {number.format(Number(transaction.quantity))}{" "}
                      {transaction.product.unit}
                    </td>
                    <td>
                      {transaction.fromLocation ?? "—"} → {transaction.toLocation ?? "—"}
                    </td>
                    <td>
                      <strong className="transaction-actor">{transaction.actorName}</strong>
                      <small className="transaction-sku">@{transaction.actorUsername}</small>
                    </td>
                    <td>{transaction.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="transaction-pagination" aria-label="หน้าประวัติรายการ">
            <Link
              className={requestedPage <= 1 ? "disabled" : ""}
              href={
                requestedPage > 1
                  ? `/transactions?start=${startValue}&end=${endValue}&page=${requestedPage - 1}`
                  : "#"
              }
              aria-disabled={requestedPage <= 1}
            >
              ก่อนหน้า
            </Link>
            <span>
              หน้า {number.format(requestedPage)} จาก {number.format(totalPages)}
            </span>
            <Link
              className={requestedPage >= totalPages ? "disabled" : ""}
              href={
                requestedPage < totalPages
                  ? `/transactions?start=${startValue}&end=${endValue}&page=${requestedPage + 1}`
                  : "#"
              }
              aria-disabled={requestedPage >= totalPages}
            >
              ถัดไป
            </Link>
          </nav>
        )}
      </article>
    </section>
  );
}
