"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { createUser, updateUser } from "@/lib/actions/users";
import {
  passwordSchema,
  usernameSchema,
} from "@/lib/validations/user";

type UserFormState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

type EditableUser = {
  id: string;
  username: string;
  displayName: string;
  position: "RN" | "PN";
  role: "ADMIN" | "USER";
};

const initialState: UserFormState = { status: "idle", message: "" };

export default function UserFormClient({
  mode,
  user,
}: {
  mode: "create" | "edit";
  user?: EditableUser;
}) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const submitAction = useMemo(
    () =>
      mode === "create" || !user
        ? createUser
        : updateUser.bind(null, user.id),
    [mode, user],
  );
  const [state, formAction, pending] = useActionState(
    submitAction,
    initialState,
  );
  const usernameValid = username.length > 0 && usernameSchema.safeParse(username).success;
  const passwordValid =
    password.length > 0 && passwordSchema.safeParse(password).success;
  const confirmValid =
    confirmPassword.length > 0 && passwordValid && confirmPassword === password;

  return (
    <section className="user-form-page">
      <div className="content-heading">
        <div>
          <span className="eyebrow">USER MANAGEMENT</span>
          <h2>{mode === "create" ? "เพิ่มผู้ใช้งาน" : "แก้ไขผู้ใช้งาน"}</h2>
          <p>
            {mode === "create"
              ? "สร้างบัญชีใหม่สำหรับเข้าใช้งานระบบ"
              : `ปรับปรุงข้อมูลบัญชี @${user?.username}`}
          </p>
        </div>
      </div>
      <article className="panel user-form-panel">
        <div className="panel-heading">
          <div>
            <h2>ข้อมูลผู้ใช้งาน</h2>
            <p>ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก</p>
          </div>
        </div>
        <form className="user-form-grid" action={formAction}>
          <FormField label="ชื่อผู้ใช้ *" error={state.fieldErrors?.username?.[0]}>
            <div className="validated-control">
              <input
                className={`control ${mode === "edit" ? "readonly-control" : ""}`}
                name="username"
                value={username}
                minLength={5}
                autoComplete="username"
                readOnly={mode === "edit"}
                required
                onChange={(event) => setUsername(event.target.value)}
              />
              {mode === "create" && usernameValid && <CorrectIcon />}
            </div>
            {mode === "create" && (
              <small className={usernameValid ? "valid-hint" : "field-hint"}>
                {usernameValid ? "รูปแบบชื่อผู้ใช้ถูกต้อง" : "อย่างน้อย 5 ตัวอักษร"}
              </small>
            )}
          </FormField>

          <FormField label="ชื่อที่แสดง *" error={state.fieldErrors?.name?.[0]}>
            <input
              className="control"
              name="name"
              defaultValue={user?.displayName ?? ""}
              autoComplete="name"
              required
            />
          </FormField>

          <FormField label="ตำแหน่ง *" error={state.fieldErrors?.position?.[0]}>
            <select
              className="control"
              name="position"
              defaultValue={user?.position ?? "RN"}
            >
              <option value="RN">RN</option>
              <option value="PN">PN</option>
            </select>
          </FormField>

          <FormField label="บทบาท *" error={state.fieldErrors?.role?.[0]}>
            <select
              className="control"
              name="role"
              defaultValue={user?.role ?? "USER"}
            >
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </FormField>

          <FormField
            label={mode === "create" ? "รหัสผ่าน *" : "รหัสผ่านใหม่"}
            error={state.fieldErrors?.password?.[0]}
          >
            <div className="validated-control">
              <input
                className="control"
                name="password"
                type="password"
                value={password}
                autoComplete="new-password"
                required={mode === "create"}
                onChange={(event) => setPassword(event.target.value)}
              />
              {passwordValid && <CorrectIcon />}
            </div>
            <small className={passwordValid ? "valid-hint" : "field-hint"}>
              {passwordValid
                ? "รูปแบบรหัสผ่านถูกต้อง"
                : mode === "edit" && !password
                  ? "เว้นว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน"
                  : "ตัวแรก A–Z, มี a–z และตัวเลข, อย่างน้อย 6 ตัว"}
            </small>
          </FormField>

          <FormField
            label={mode === "create" ? "ยืนยันรหัสผ่าน *" : "ยืนยันรหัสผ่านใหม่"}
            error={state.fieldErrors?.confirm_password?.[0]}
          >
            <div className="validated-control">
              <input
                className="control"
                name="confirm_password"
                type="password"
                value={confirmPassword}
                autoComplete="new-password"
                required={mode === "create" || password.length > 0}
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
            <Link href="/admin/users">ยกเลิก</Link>
            <button type="submit" disabled={pending}>
              {pending
                ? "กำลังบันทึก..."
                : mode === "create"
                  ? "เพิ่มผู้ใช้งาน"
                  : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </article>
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
