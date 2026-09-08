"use client";

import Link from "next/link";
import { Icon } from "@/components/layout/icon";

export default function ReceiveError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section className="receive-error-page" role="alert">
      <div className="receive-error-icon" aria-hidden="true">
        <Icon path="M12 9v4m0 4h.01M10.3 3.8 2.6 17.1A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.9L13.7 3.8a2 2 0 0 0-3.4 0Z" />
      </div>
      <h2>ไม่สามารถเปิดหน้ารับสินค้าได้</h2>
      <p>ระบบพบปัญหาชั่วคราว กรุณาลองใหม่อีกครั้ง</p>
      <div className="receive-error-actions">
        <button type="button" onClick={() => retry()}>ลองอีกครั้ง</button>
        <Link href="/products">กลับหน้ารายการสินค้า</Link>
      </div>
    </section>
  );
}
