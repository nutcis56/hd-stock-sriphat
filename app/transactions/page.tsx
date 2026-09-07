import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({ take: 50, orderBy: { createdAt: "desc" }, include: { product: { select: { name: true, unit: true } }, staff: { select: { name: true } } } });
  return <section className="operation-page"><div className="content-heading"><div><span className="eyebrow">AUDIT LOG</span><h2>ประวัติรายการ</h2><p>การเคลื่อนไหวสินค้า 50 รายการล่าสุด</p></div></div><article className="panel"><div className="panel-heading"><div><h2>Transaction Log</h2><p>ข้อมูลจาก Prisma Postgres</p></div><span className="item-count">{transactions.length} รายการ</span></div>{transactions.length === 0 ? <div className="empty-history"><h3>ยังไม่มีรายการใหม่</h3><p>รายการรับเข้า โอน หรือตัดใช้จะแสดงที่นี่</p></div> : <div className="table-scroll"><table><thead><tr><th>วันเวลา</th><th>ประเภท</th><th>สินค้า</th><th className="right">จำนวน</th><th>จาก → ไป</th><th>ผู้ดำเนินการ</th><th>หมายเหตุ</th></tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction.id}><td>{transaction.createdAt.toLocaleString("th-TH")}</td><td>{transaction.type}</td><td>{transaction.product.name}</td><td className="right stock-number">{Number(transaction.quantity).toLocaleString("th-TH")} {transaction.product.unit}</td><td>{transaction.fromLocation ?? "—"} → {transaction.toLocation ?? "—"}</td><td>{transaction.staff?.name ?? transaction.actorEmail ?? "—"}</td><td>{transaction.note ?? "—"}</td></tr>)}</tbody></table></div>}</article></section>;
}
