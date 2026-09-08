"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const menuItems = [
  { href: "/products", label: "ภาพรวม Stock", path: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
  { href: "/receive", label: "รับสินค้าเข้า", path: "M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" },
  { href: "/transfer", label: "โอนไปศรีพัฒน์", path: "M5 8h12m0 0-3-3m3 3-3 3M19 16H7m0 0 3-3m-3 3 3 3" },
  { href: "/usage", label: "ตัดใช้ศรีพัฒน์", path: "M7 7h10l-1 13H8L7 7Zm-2 0h14M9 7V4h6v3" },
  { href: "/calculator", label: "คำนวณจำนวนเบิก", path: "M6 3h12v18H6zM9 7h6M9 12h1m4 0h1m-6 4h1m4 0h1" },
  { href: "/transactions", label: "ประวัติรายการ", path: "M4 12a8 8 0 1 0 2.3-5.7L4 8.5M4 4v4.5h4.5M12 8v5l3 2" },
  { href: "/admin/users", label: "ผู้ใช้งานระบบ", path: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
];

export function Menu({
  open,
  role,
  onNavigate,
}: {
  open: boolean;
  role?: "ADMIN" | "USER";
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
      <div className="sidebar-brand">
        <Image src="/sriphat-logo.png" alt="Sriphat Hospital CMU" width={367} height={175} priority />
        <div>
          <strong>HD Stock</strong>
          <span>Inventory Platform</span>
        </div>
      </div>

      <div className="sidebar-section-label">ระบบคลังสินค้า</div>
      <nav className="sidebar-menu" aria-label="เมนูหลัก">
        {menuItems.filter((item) => item.href !== "/admin/users" || role === "ADMIN").map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
            >
              <Icon path={item.path} />
              <span>{item.label}</span>
              {active && <i />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-version">VERSION 1.0.0</div>
      </div>
    </aside>
  );
}
