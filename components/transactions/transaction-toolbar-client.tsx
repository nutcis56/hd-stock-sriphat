"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/layout/icon";
import { deleteTransactionsByRange } from "@/lib/actions/transactions";

type Feedback = {
  tone: "success" | "error";
  message: string;
} | null;

export default function TransactionToolbarClient({
  appliedStart,
  appliedEnd,
  appliedPeriod,
  appliedMonth,
  appliedYear,
  appliedQuery,
  appliedType,
  canDelete,
}: {
  appliedStart: string;
  appliedEnd: string;
  appliedPeriod: string;
  appliedMonth: string;
  appliedYear: string;
  appliedQuery: string;
  appliedType: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [start, setStart] = useState(appliedStart);
  const [end, setEnd] = useState(appliedEnd);
  const [period, setPeriod] = useState(appliedPeriod);
  const [month, setMonth] = useState(appliedMonth);
  const [year, setYear] = useState(appliedYear);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();
  const monthStart = month ? `${month}-01` : "";
  const monthEnd = month
    ? `${month}-${String(new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate()).padStart(2, "0")}`
    : "";
  const yearStart = year ? `${year}-01-01` : "";
  const yearEnd = year ? `${year}-12-31` : "";
  const selectedStart = period === "custom" ? start : period === "year" ? yearStart : monthStart;
  const selectedEnd = period === "custom" ? end : period === "year" ? yearEnd : monthEnd;
  const rangeValid = Boolean(selectedStart && selectedEnd && selectedStart <= selectedEnd);
  const filterApplied = rangeValid && selectedStart === appliedStart && selectedEnd === appliedEnd;
  const exportQuery = new URLSearchParams({
    start: appliedStart,
    end: appliedEnd,
    ...(appliedQuery ? { query: appliedQuery } : {}),
    ...(appliedType ? { type: appliedType } : {}),
  });

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function confirmDelete() {
    if (!rangeValid) return;
    startTransition(async () => {
      const result = await deleteTransactionsByRange(selectedStart, selectedEnd);
      setConfirmOpen(false);
      setFeedback({ tone: result.status, message: result.message });
      if (result.status === "success") router.refresh();
    });
  }

  return (
    <>
      <div className="transaction-tools-grid">
        <form
          className="panel transaction-range-tools"
          method="get"
          action="/transactions"
        >
          <div className="transaction-range-heading">
            <strong>ค้นหา ส่งออก และจัดการข้อมูล</strong>
            <span>
              เลือกช่วงวันที่แล้วกดแสดงรายการก่อนส่งออกหรือลบข้อมูล
            </span>
          </div>
          <label className="transaction-text-filter">
            <span className="sr-only">ค้นหาสินค้า</span>
            <input type="search" name="query" defaultValue={appliedQuery} placeholder="ค้นหาชื่อสินค้า หรือ SKU..." />
          </label>
          <label>
            <span>ประเภท</span>
            <select name="type" defaultValue={appliedType}>
              <option value="">ทุกประเภท</option>
              <option value="RECEIVE_PPK">รับเข้าพฤกพลัง</option>
              <option value="RECEIVE_SRI">รับเข้าศรีพัฒน์</option>
              <option value="TRANSFER">โอนไปศรีพัฒน์</option>
              <option value="USE_SRI">ตัดใช้ศรีพัฒน์</option>
              <option value="ADJUST">ปรับยอด</option>
            </select>
          </label>
          <label>
            <span>ช่วงเวลา</span>
            <select name="period" value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="month">รายเดือน</option>
              <option value="year">รายปี</option>
              <option value="custom">กำหนดช่วงเอง</option>
            </select>
          </label>
          {period === "month" && (
            <label>
              <span>เดือน</span>
              <input type="month" name="month" value={month} required onChange={(event) => setMonth(event.target.value)} />
            </label>
          )}
          {period === "year" && (
            <label>
              <span>ปี</span>
              <input type="number" name="year" min="2000" max="9998" value={year} required onChange={(event) => setYear(event.target.value)} />
            </label>
          )}
          {period === "custom" && (
            <>
              <label>
                <span>วันที่เริ่มต้น</span>
                <input type="date" name="start" value={start} required onChange={(event) => setStart(event.target.value)} />
              </label>
              <label>
                <span>วันที่สิ้นสุด</span>
                <input type="date" name="end" value={end} required onChange={(event) => setEnd(event.target.value)} />
              </label>
            </>
          )}
          <button
            type="submit"
            className="transaction-search-button"
            disabled={!rangeValid}
          >
            <Icon path="m21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
            แสดงรายการ
          </button>
          <div className="transaction-export-actions">
            <a
              className={!filterApplied ? "disabled" : ""}
              href={filterApplied ? `/transactions/export?format=xlsx&${exportQuery}` : undefined}
              download
            >
              <Icon path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M8 13h8M8 17h8" />
              Excel
            </a>
            <a
              className={!filterApplied ? "disabled" : ""}
              href={filterApplied ? `/transactions/export?format=csv&${exportQuery}` : undefined}
              download
            >
              <Icon path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M8 13h8M8 17h8" />
              CSV
            </a>
            {canDelete && (
              <button
                type="button"
                className="transaction-delete-button"
                disabled={!filterApplied}
                onClick={() => setConfirmOpen(true)}
              >
                <Icon path="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />
                ลบ
              </button>
            )}
          </div>
          {!filterApplied && rangeValid && (
            <small className="transaction-filter-notice">
              วันที่มีการเปลี่ยนแปลง กรุณากด “แสดงรายการ” ก่อน
            </small>
          )}
        </form>
      </div>

      {confirmOpen && (
        <div className="confirm-overlay" role="presentation">
          <div
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-transactions-title"
            aria-describedby="delete-transactions-description"
          >
            <span className="confirm-icon" aria-hidden="true">
              <Icon path="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />
            </span>
            <h3 id="delete-transactions-title">ยืนยันลบประวัติรายการ</h3>
            <p id="delete-transactions-description">
              ระบบจะลบ Transaction ตั้งแต่ <strong>{selectedStart}</strong> ถึง{" "}
              <strong>{selectedEnd}</strong> การดำเนินการนี้ย้อนกลับไม่ได้
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="cancel"
                disabled={isPending}
                onClick={() => setConfirmOpen(false)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="danger"
                disabled={isPending}
                onClick={confirmDelete}
              >
                {isPending ? "กำลังลบ..." : "ยืนยันลบ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={`toast ${feedback.tone === "success" ? "toast-success" : "toast-error"} transaction-toast`}
          role={feedback.tone === "success" ? "status" : "alert"}
        >
          <span aria-hidden="true">{feedback.tone === "success" ? "✓" : "!"}</span>
          <strong>{feedback.message}</strong>
          <button type="button" aria-label="ปิดข้อความ" onClick={() => setFeedback(null)}>
            ×
          </button>
        </div>
      )}
    </>
  );
}
