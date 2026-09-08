"use client";

import { Icon } from "@/components/layout/icon";
import { deleteProduct } from "@/lib/actions/products";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

export type ProductListItem = {
  sku: string;
  name: string;
  unit: string;
  packSize: number;
  stockPpk: number;
  stockSri: number;
  reorderPoint: number;
  sourceNote: string | null;
  updatedAt: string;
};

export default function ProductListClient({
  products,
  successToast,
  canManage,
}: {
  products: ProductListItem[];
  successToast?: "receive" | "transfer" | "usage" | "product-created" | "product-updated";
  canManage: boolean;
}) {
  const router = useRouter();
  const [toast, setToast] = useState<{ tone: "success" | "error"; message: string } | null>(() => {
    if (!successToast) return null;
    const messages = {
      receive: "รับสินค้าเข้าเรียบร้อยแล้ว",
      transfer: "โอนสินค้าเสร็จสิ้น",
      usage: "ตัดใช้สินค้าจากศรีพัฒน์เรียบร้อยแล้ว",
      "product-created": "เพิ่มรายการสินค้าเรียบร้อยแล้ว",
      "product-updated": "แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว",
    };
    return { tone: "success", message: messages[successToast] };
  });
  const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(null);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("ALL");
  const [refreshPending, startRefreshTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const number = useMemo(() => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }), []);
  const date = useMemo(() => new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }), []);

  useEffect(() => {
    if (!successToast) return;

    window.history.replaceState(window.history.state, "", "/products");
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successToast]);

  const filtered = products.filter((product) => {
    const matchesSearch = `${product.sku} ${product.name}`.toLowerCase().includes(query.toLowerCase().trim());
    const matchesLocation = location === "ALL" || (location === "PPK" ? product.stockPpk > 0 : product.stockSri > 0);
    return matchesSearch && matchesLocation;
  });

  const totals = products.reduce(
    (result, product) => ({
      ppk: result.ppk + product.stockPpk,
      sri: result.sri + product.stockSri,
      low: result.low + (product.reorderPoint > 0 && product.stockSri <= product.reorderPoint ? 1 : 0),
    }),
    { ppk: 0, sri: 0, low: 0 },
  );

  function refresh() {
    startRefreshTransition(() => router.refresh());
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const sku = deleteTarget.sku;
    startDeleteTransition(async () => {
      const result = await deleteProduct(sku);
      setDeleteTarget(null);
      setToast({ tone: result.status, message: result.message });
      if (result.status === "success") router.refresh();
    });
  }

  return (
    <section className="product-page">
      {toast && (
        <div className={`toast products-toast toast-${toast.tone}`} role="status" aria-live="polite">
          <span aria-hidden="true">{toast.tone === "success" ? "✓" : "!"}</span>
          <strong>{toast.message}</strong>
          <button
            type="button"
            aria-label="ปิดข้อความแจ้งเตือน"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}
      <div className="content-heading">
        <div>
          <span className="eyebrow">INVENTORY MANAGEMENT</span>
          <h2>ภาพรวมสินค้า</h2>
          <p>ตรวจสอบยอดคงเหลือและจัดการข้อมูลสินค้าในระบบ</p>
        </div>
        <div className="product-heading-actions">
          {canManage && (
            <Link className="products-add-button" href="/products/new">
              <Icon path="M12 5v14M5 12h14" />
              <span>เพิ่มรายการสินค้า</span>
            </Link>
          )}
          <button className="refresh-button" type="button" onClick={refresh} disabled={refreshPending}>
            <Icon path="M20 6v5h-5M4 18v-5h5M6.1 9A7 7 0 0 1 18 6l2 5M4 13l2 5a7 7 0 0 0 11.9-3" />
            <span>{refreshPending ? "กำลังอัปเดต..." : "รีเฟรชข้อมูล"}</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <Stat tone="violet" label="รายการสินค้าทั้งหมด" value={number.format(products.length)} note="รายการในระบบ" path="M5 7 12 3l7 4-7 4-7-4Zm0 5 7 4 7-4M5 17l7 4 7-4" />
        <Stat tone="teal" label="คงเหลือพฤกพลัง" value={number.format(totals.ppk)} note="หน่วยคงเหลือ" path="M3 9h18M5 9v11h14V9M8 9V5h8v4M9 13h6" />
        <Stat tone="purple" label="คงเหลือศรีพัฒน์" value={number.format(totals.sri)} note="หน่วยคงเหลือ" path="M4 20h16M6 20V9l6-5 6 5v11M9 13h2m2 0h2m-6 4h2m2 0h2" />
        <Stat tone="amber" label="รายการถึงจุดเตือน" value={number.format(totals.low)} note="ควรตรวจสอบยอด" warning path="M12 3 2.8 20h18.4L12 3Zm0 6v5m0 3v.1" />
      </div>

      <article className="panel inventory-panel">
        <div className="panel-heading">
          <div><h2>รายการสินค้า</h2><p>ยอดปัจจุบันจาก Prisma Postgres</p></div>
          <span className="item-count">{number.format(filtered.length)} รายการ</span>
        </div>
        <div className="toolbar">
          <label className="search-field">
            <span className="sr-only">ค้นหาสินค้า</span>
            <Icon path="m21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อสินค้า หรือ SKU..." />
          </label>
          <label className="filter-field">
            <span>สถานที่จัดเก็บ</span>
            <select value={location} onChange={(event) => setLocation(event.target.value)}>
              <option value="ALL">ทั้งสอง Stock</option>
              <option value="PPK">พฤกพลัง</option>
              <option value="SRI">ศรีพัฒน์</option>
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>สินค้า</th><th>หน่วย</th><th className="right">บรรจุ/กล่อง</th><th className="right">พฤกพลัง</th><th className="right">ศรีพัฒน์</th><th className="right">จุดเตือน</th><th>สถานะ</th><th>อัปเดต</th>{canManage && <th className="right">จัดการ</th>}</tr></thead>
            <tbody>{filtered.map((product) => {
              const hasAlert = product.reorderPoint > 0 && product.stockSri <= product.reorderPoint;
              return (
                <tr key={product.sku}>
                  <td><div className="product-cell"><span className="product-mark">{product.name.charAt(0)}</span><div><strong>{product.name}</strong><span>SKU {product.sku}{product.sourceNote ? ` • ${product.sourceNote}` : ""}</span></div></div></td>
                  <td>{product.unit}</td>
                  <td className="right muted-number">{number.format(product.packSize)}</td>
                  <td className="right stock-number">{number.format(product.stockPpk)}</td>
                  <td className={`right stock-number ${hasAlert ? "danger-text" : ""}`}>{number.format(product.stockSri)}</td>
                  <td className="right muted-number">{number.format(product.reorderPoint)}</td>
                  <td><span className={`status-pill ${hasAlert ? "low" : "enough"}`}><i />{hasAlert ? "ควรตรวจสอบ" : "เพียงพอ"}</span></td>
                  <td><span className="updated">{date.format(new Date(product.updatedAt))}</span></td>
                  {canManage && (
                    <td>
                      <div className="product-manage-actions">
                        <Link href={`/products/${encodeURIComponent(product.sku)}/edit`} aria-label={`แก้ไข ${product.name}`} title="แก้ไข">
                          <Icon path="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
                        </Link>
                        <button type="button" onClick={() => setDeleteTarget(product)} aria-label={`ลบ ${product.name}`} title="ลบ">
                          <Icon path="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5m4-5v5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}</tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state">ไม่พบรายการที่ค้นหา</div>}
        </div>
      </article>
      {deleteTarget && (
        <div className="confirm-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !deletePending) setDeleteTarget(null);
        }}>
          <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title">
            <span className="confirm-icon" aria-hidden="true">
              <Icon path="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5m4-5v5" />
            </span>
            <h3 id="delete-product-title">ยืนยันการลบสินค้า</h3>
            <p>ต้องการลบ <strong>{deleteTarget.name}</strong> (SKU {deleteTarget.sku}) ออกจากรายการใช้งานหรือไม่</p>
            <div className="confirm-actions">
              <button className="cancel" type="button" disabled={deletePending} onClick={() => setDeleteTarget(null)}>ยกเลิก</button>
              <button className="danger" type="button" disabled={deletePending} onClick={confirmDelete}>{deletePending ? "กำลังลบ..." : "ยืนยันลบ"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ tone, label, value, note, path, warning = false }: { tone: string; label: string; value: string; note: string; path: string; warning?: boolean }) {
  return <article className={`stat-card ${warning ? "warning-card" : ""}`}><span className={`stat-icon ${tone}`}><Icon path={path} /></span><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article>;
}
