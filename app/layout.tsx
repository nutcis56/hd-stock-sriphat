import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "HD Stock Platform | Sriphat Hospital",
  description: "ระบบบริหารคลังเวชภัณฑ์คลินิกไตเทียม โรงพยาบาลศรีพัฒน์",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className="h-full antialiased"
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
