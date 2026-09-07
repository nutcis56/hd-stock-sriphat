"use client";

import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const pageTitles: Record<string, string> = {
  "/products": "ภาพรวม Stock",
  "/receive": "รับสินค้าเข้า",
  "/transfer": "โอนไปศรีพัฒน์",
  "/usage": "ตัดใช้ศรีพัฒน์",
  "/calculator": "คำนวณจำนวนเบิก",
  "/transactions": "ประวัติรายการ",
};

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "HD Stock Platform";

  return (
    <header className="admin-header">
      <div className="admin-header-title">
        <button
          className="mobile-menu-button"
          type="button"
          onClick={onMenuClick}
          aria-label="เปิดเมนูหลัก"
        >
          <Icon path="M4 6h16M4 12h16M4 18h16" />
        </button>
        <div>
          <span></span>
          <h1></h1>
        </div>
      </div>

      <div className="admin-header-actions">
        <div className="database-status">
          <div>
            <strong></strong>
            <small></small>
          </div>
        </div>
        <div className="user-avatar" aria-label="ผู้ใช้งานระบบ">
          HD
        </div>
      </div>
    </header>
  );
}
