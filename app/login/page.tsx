import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/products");

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <Image
            className="login-logo"
            src="/sriphat-logo-transparent.png"
            alt="Sriphat Hospital CMU"
            width={210}
            height={100}
            priority
          />
          <span>HD STOCK PLATFORM</span>
          <h1>เข้าสู่ระบบ</h1>
          <p>คลินิกไตเทียม โรงพยาบาลศรีพัฒน์</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
