"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const pageTitles: Record<string, string> = {
  "/products": "ภาพรวม Stock",
  "/receive": "รับสินค้าเข้า",
  "/transfer": "โอนไปศรีพัฒน์",
  "/usage": "ตัดใช้ศรีพัฒน์",
  "/calculator": "คำนวณจำนวนเบิก",
  "/transactions": "ประวัติรายการ",
  "/profile/edit": "แก้ไขโปรไฟล์",
};

type HeaderProps = {
  onMenuClick: () => void;
  user: {
    displayName: string;
    position: string | null;
  } | null;
};

export function Header({ onMenuClick, user }: HeaderProps) {
  const pathname = usePathname();
  const title = pathname.startsWith("/admin/users")
    ? "ผู้ใช้งานระบบ"
    : pathname.startsWith("/products")
      ? "ภาพรวม Stock"
    : pageTitles[pathname] ?? "HD Stock Platform";
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const displayName = user?.displayName || "ผู้ใช้งานระบบ";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  useEffect(() => {
    function closeUserMenu(event: PointerEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setUserMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeUserMenu);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", closeUserMenu);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ redirectTo: "/login" });
  }

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
          <span>ระบบบริหารคลังเวชภัณฑ์</span>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="admin-header-actions">
        <div className="database-status">
          <div>
            <strong></strong>
            <small></small>
          </div>
        </div>
        <div className="user-menu" ref={userMenuRef}>
          <button
            className="user-menu-trigger"
            type="button"
            aria-label={`เมนูผู้ใช้งาน ${displayName}`}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            onClick={() => setUserMenuOpen((open) => !open)}
          >
            <span className="user-avatar" aria-hidden="true">
              {initials || "HD"}
            </span>
          </button>

          {userMenuOpen && (
            <div className="user-dropdown" role="menu">
              <span className="user-dropdown-arrow" aria-hidden="true" />
              <div className="user-dropdown-profile">
                <strong>{displayName}</strong>
                <small>{user?.position || "ผู้ใช้งานระบบ"}</small>
              </div>
              <Link
                href="/profile/edit"
                role="menuitem"
                onClick={() => setUserMenuOpen(false)}
              >
                <Icon path="M15.232 5.232l3.536 3.536M4 20h4l10.768-10.768a2.5 2.5 0 0 0-3.536-3.536L4.464 16.464 4 20Z" />
                แก้ไขโปรไฟล์
              </Link>
              <button
                type="button"
                role="menuitem"
                disabled={signingOut}
                onClick={handleSignOut}
              >
                <Icon path="M12 2v10M18.36 5.64a9 9 0 1 1-12.73 0" />
                {signingOut ? "กำลังลงชื่อออก..." : "ลงชื่อออก"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
