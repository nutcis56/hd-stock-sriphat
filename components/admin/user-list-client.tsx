"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Icon } from "@/components/layout/icon";
import { deleteUser } from "@/lib/actions/users";

export type UserListItem = {
  id: string;
  username: string;
  displayName: string;
  position: string | null;
  role: "ADMIN" | "USER";
  lastLoginAt: string | null;
};

type ToastState = {
  tone: "success" | "error";
  title: string;
  message: string;
} | null;

export default function UserListClient({
  users,
  currentUserId,
  successToast,
}: {
  users: UserListItem[];
  currentUserId: string;
  successToast?: "created" | "updated";
}) {
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [toast, setToast] = useState<ToastState>(
    successToast
      ? {
          tone: "success",
          title: "บันทึกข้อมูลเรียบร้อยแล้ว",
          message:
            successToast === "created"
              ? "เพิ่มผู้ใช้งานเข้าสู่ระบบแล้ว"
              : "แก้ไขข้อมูลผู้ใช้งานแล้ว",
        }
      : null,
  );
  const [isPending, startTransition] = useTransition();
  const date = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [],
  );

  useEffect(() => {
    if (!toast) return;
    if (successToast) {
      window.history.replaceState(window.history.state, "", "/admin/users");
    }
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast, successToast]);

  function confirmDelete() {
    if (!selectedUser) return;
    const userId = selectedUser.id;
    startTransition(async () => {
      const result = await deleteUser(userId);
      setSelectedUser(null);
      setToast({
        tone: result.status,
        title:
          result.status === "success"
            ? "ลบผู้ใช้งานเรียบร้อยแล้ว"
            : "ไม่สามารถลบผู้ใช้งานได้",
        message: result.message,
      });
    });
  }

  return (
    <section className="users-page">
      <div className="content-heading users-heading">
        <div>
          <span className="eyebrow">USER MANAGEMENT</span>
          <h2>ผู้ใช้งานระบบ</h2>
          <p>จัดการบัญชี ตำแหน่ง และสิทธิ์เข้าใช้งาน</p>
        </div>
        <Link className="users-add-button" href="/admin/users/new">
          <Icon path="M12 5v14M5 12h14" />
          เพิ่มผู้ใช้งาน
        </Link>
      </div>

      <article className="panel users-panel">
        <div className="panel-heading">
          <div>
            <h2>รายชื่อผู้ใช้งาน</h2>
            <p>ผู้ใช้งานทั้งหมด {users.length} คน</p>
          </div>
        </div>
        <div className="table-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>ตำแหน่ง</th>
                <th>บทบาท</th>
                <th>เข้าใช้งานล่าสุด</th>
                <th className="right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-list-name">
                      <span>{user.displayName.charAt(0).toUpperCase()}</span>
                      <div>
                        <strong>{user.displayName}</strong>
                        <small>@{user.username}</small>
                      </div>
                    </div>
                  </td>
                  <td>{user.position || "—"}</td>
                  <td>
                    <span className={`user-role ${user.role.toLowerCase()}`}>
                      {user.role === "ADMIN" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                    </span>
                  </td>
                  <td>
                    {user.lastLoginAt
                      ? date.format(new Date(user.lastLoginAt))
                      : "ยังไม่เคยเข้าใช้งาน"}
                  </td>
                  <td>
                    <div className="user-manage-actions">
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        aria-label={`แก้ไข ${user.displayName}`}
                        title="แก้ไข"
                      >
                        <Icon path="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />
                      </Link>
                      <button
                        type="button"
                        aria-label={`ลบ ${user.displayName}`}
                        title={
                          user.id === currentUserId
                            ? "ไม่สามารถลบบัญชีที่กำลังใช้งาน"
                            : "ลบ"
                        }
                        disabled={user.id === currentUserId}
                        onClick={() => setSelectedUser(user)}
                      >
                        <Icon path="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {selectedUser && (
        <div className="confirm-overlay" role="presentation">
          <div
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            aria-describedby="delete-user-description"
          >
            <span className="confirm-icon" aria-hidden="true">
              <Icon path="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />
            </span>
            <h3 id="delete-user-title">ยืนยันการลบผู้ใช้งาน</h3>
            <p id="delete-user-description">
              ต้องการลบ <strong>{selectedUser.displayName}</strong> (@
              {selectedUser.username}) ออกจากระบบใช่หรือไม่
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="cancel"
                disabled={isPending}
                onClick={() => setSelectedUser(null)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="danger"
                disabled={isPending}
                onClick={confirmDelete}
              >
                {isPending ? "กำลังลบ..." : "ยืนยันลบ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`toast ${
            toast.tone === "success" ? "toast-success" : "toast-error"
          } users-toast`}
          role={toast.tone === "success" ? "status" : "alert"}
          aria-live={toast.tone === "success" ? "polite" : "assertive"}
        >
          <span aria-hidden="true">{toast.tone === "success" ? "✓" : "!"}</span>
          <div>
            <strong>{toast.title}</strong>
            <small>{toast.message}</small>
          </div>
          <button type="button" aria-label="ปิดข้อความ" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}
    </section>
  );
}
