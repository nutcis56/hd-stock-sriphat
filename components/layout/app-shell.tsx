"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "./footer";
import { Header } from "./header";
import { Menu } from "./menu";

type AppShellProps = {
  children: ReactNode;
  user: {
    displayName: string;
    position: string | null;
    role: "ADMIN" | "USER";
  } | null;
};

export function AppShell({ children, user }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/login") return children;

  return (
    <div className="admin-shell">
      <Menu
        open={menuOpen}
        role={user?.role}
        onNavigate={() => setMenuOpen(false)}
      />
      {menuOpen && <button className="sidebar-overlay" type="button" aria-label="ปิดเมนู" onClick={() => setMenuOpen(false)} />}
      <div className="admin-main">
        <Header onMenuClick={() => setMenuOpen(true)} user={user} />
        <main className="admin-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
