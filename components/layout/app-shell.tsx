"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "./footer";
import { Header } from "./header";
import { Menu } from "./menu";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/login") return children;

  return (
    <div className="admin-shell">
      <Menu open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && <button className="sidebar-overlay" type="button" aria-label="ปิดเมนู" onClick={() => setMenuOpen(false)} />}
      <div className="admin-main">
        <Header onMenuClick={() => setMenuOpen(true)} />
        <main className="admin-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
