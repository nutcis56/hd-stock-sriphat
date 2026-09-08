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
  canDelete,
}: {
  appliedStart: string;
  appliedEnd: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [start, setStart] = useState(appliedStart);
  const [end, setEnd] = useState(appliedEnd);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isPending, startTransition] = useTransition();
  const rangeValid = Boolean(start && end && start <= end);
  const filterApplied =
    rangeValid && start === appliedStart && end === appliedEnd;
  const exportQuery = new URLSearchParams({
    start: appliedStart,
    end: appliedEnd,
  });

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function confirmDelete() {
    if (!rangeValid) return;
    startTransition(async () => {
      const result = await deleteTransactionsByRange(start, end);
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
          <label>
            <span>วันที่เริ่มต้น</span>
            <input
              type="date"
              name="start"
              value={start}
              required
              onChange={(event) => setStart(event.target.value)}
            />
          </label>
          <label>
            <span>วันที่สิ้นสุด</span>
            <input
              type="date"
              name="end"
              value={end}
              required
              onChange={(event) => setEnd(event.target.value)}
            />
          </label>
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
              ระบบจะลบ Transaction ตั้งแต่ <strong>{start}</strong> ถึง{" "}
              <strong>{end}</strong> การดำเนินการนี้ย้อนกลับไม่ได้
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
