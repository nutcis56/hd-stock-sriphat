import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "HD Stock Platform | Sriphat Hospital",
  description: "ระบบบริหารคลังเวชภัณฑ์คลินิกไตเทียม โรงพยาบาลศรีพัฒน์",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="th"
      className="h-full antialiased"
    >
      <body className="min-h-full">
        <AppShell
          user={
            session?.user
              ? {
                  displayName: session.user.name ?? session.user.username,
                  position: session.user.position,
                }
              : null
          }
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
