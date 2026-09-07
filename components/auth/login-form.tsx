"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      username: String(form.get("username") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });

    if (result?.error) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง หรือบัญชีถูกระงับชั่วคราว");
      setSubmitting(false);
      return;
    }

    router.replace("/products");
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label>
        <span>ชื่อผู้ใช้</span>
        <input name="username" type="text" autoComplete="username" required autoFocus />
      </label>
      <label>
        <span>รหัสผ่าน</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error && <p className="login-error" role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
