"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  type ProfileActionState,
  updateOwnProfile,
} from "@/lib/actions/profile";
import { passwordSchema } from "@/lib/validations/user";

const initialState: ProfileActionState = { status: "idle", message: "" };

export default function ProfileFormClient({
  user,
  updated,
}: {
  user: { username: string; displayName: string };
  updated: boolean;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showToast, setShowToast] = useState(updated);
  const [state, formAction, pending] = useActionState(
    updateOwnProfile,
    initialState,
  );
  const passwordValid =
    password.length > 0 && passwordSchema.safeParse(password).success;
  const confirmValid =
    confirmPassword.length > 0 && passwordValid && confirmPassword === password;

  useEffect(() => {
    if (!showToast) return;
    const timer = window.setTimeout(() => setShowToast(false), 3500);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  return (
    <section className="user-form-page">
      <div className="content-heading">
        <div>
          <span className="eyebrow">MY PROFILE</span>
          <h2>แก้ไขโปรไฟล์</h2>
          <p>ปรับชื่อที่แสดงหรือเปลี่ยนรหัสผ่านสำหรับบัญชีของคุณ</p>
        </div>
      </div>

      <article className="panel user-form-panel">
        <div className="panel-heading">
          <div>
            <h2>ข้อมูลโปรไฟล์</h2>
            <p>ชื่อผู้ใช้ไม่สามารถแก้ไขได้</p>
          </div>
        </div>
        <form className="user-form-grid" action={formAction}>
          <FormField label="ชื่อผู้ใช้">
            <input
              className="control readonly-control"
              value={user.username}
              autoComplete="username"
              disabled
            />
          </FormField>

          <FormField label="ชื่อแสดง *" error={state.fieldErrors?.name?.[0]}>
            <input
              className="control"
              name="name"
              defaultValue={user.displayName}
              autoComplete="name"
              required
            />
          </FormField>

          <FormField
            label="รหัสผ่านใหม่"
            error={state.fieldErrors?.password?.[0]}
          >
            <div className="validated-control">
              <input
                className="control"
                name="password"
                type="password"
                value={password}
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
              />
              {passwordValid && <CorrectIcon />}
            </div>
            <small className={passwordValid ? "valid-hint" : "field-hint"}>
              {passwordValid
                ? "รูปแบบรหัสผ่านถูกต้อง"
                : !password
                  ? "เว้นว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน"
                  : "ตัวแรก A–Z, มี a–z และตัวเลข, อย่างน้อย 6 ตัว"}
            </small>
          </FormField>

          <FormField
            label="ยืนยันรหัสผ่านใหม่"
            error={state.fieldErrors?.confirm_password?.[0]}
          >
            <div className="validated-control">
              <input
                className="control"
                name="confirm_password"
                type="password"
                value={confirmPassword}
                autoComplete="new-password"
                required={password.length > 0}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              {confirmValid && <CorrectIcon />}
            </div>
            {confirmPassword && (
              <small className={confirmValid ? "valid-hint" : "invalid-hint"}>
                {confirmValid ? "รหัสผ่านตรงกัน" : "รหัสผ่านยังไม่ตรงกัน"}
              </small>
            )}
          </FormField>

          {state.status === "error" && (
            <p className="user-form-error" role="alert">
              {state.message}
            </p>
          )}

          <div className="user-form-actions">
            <Link href="/products">ยกเลิก</Link>
            <button type="submit" disabled={pending}>
              {pending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </article>

      {showToast && (
        <div className="toast toast-success" role="status">
          <span aria-hidden="true">✓</span>
          <strong>บันทึกโปรไฟล์เรียบร้อยแล้ว</strong>
          <button
            type="button"
            aria-label="ปิดข้อความ"
            onClick={() => setShowToast(false)}
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="user-form-field">
      <span>{label}</span>
      {children}
      {error && <small className="invalid-hint">{error}</small>}
    </label>
  );
}

function CorrectIcon() {
  return (
    <span className="correct-icon" aria-label="ข้อมูลถูกต้อง">
      ✓
    </span>
  );
}
