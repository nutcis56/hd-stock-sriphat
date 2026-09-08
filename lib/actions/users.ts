"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  createUserSchema,
  updateUserSchema,
} from "@/lib/validations/user";

type UserActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

type DeleteUserResult = {
  status: "success" | "error";
  message: string;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session.user;
}

function isPrismaErrorWithCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

export async function createUser(
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const admin = await requireAdmin();
  if (!admin) {
    return { status: "error", message: "คุณไม่มีสิทธิ์เพิ่มผู้ใช้งาน" };
  }

  const validation = createUserSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    name: formData.get("name"),
    position: formData.get("position"),
    role: formData.get("role"),
  });

  if (!validation.success) {
    return {
      status: "error",
      message: "กรุณาตรวจสอบข้อมูลที่กรอก",
      fieldErrors: z.flattenError(validation.error).fieldErrors,
    };
  }

  const username = validation.data.username.toLowerCase();
  const duplicate = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (duplicate) {
    return {
      status: "error",
      message: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว",
      fieldErrors: { username: ["กรุณาใช้ชื่อผู้ใช้อื่น"] },
    };
  }

  try {
    await prisma.user.create({
      data: {
        username,
        passwordHash: await hash(validation.data.password, 12),
        displayName: validation.data.name,
        position: validation.data.position,
        role: validation.data.role,
        isActive: true,
        mustChangePassword: true,
      },
    });
  } catch (error) {
    if (isPrismaErrorWithCode(error, "P2002")) {
      return {
        status: "error",
        message: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว",
        fieldErrors: { username: ["กรุณาใช้ชื่อผู้ใช้อื่น"] },
      };
    }
    return { status: "error", message: "เพิ่มผู้ใช้งานไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?toast=created");
}

export async function updateUser(
  userId: string,
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const admin = await requireAdmin();
  if (!admin) {
    return { status: "error", message: "คุณไม่มีสิทธิ์แก้ไขผู้ใช้งาน" };
  }

  const validation = updateUserSchema.safeParse({
    name: formData.get("name"),
    position: formData.get("position"),
    role: formData.get("role"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });
  if (!validation.success) {
    return {
      status: "error",
      message: "กรุณาตรวจสอบข้อมูลที่กรอก",
      fieldErrors: z.flattenError(validation.error).fieldErrors,
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) return { status: "error", message: "ไม่พบผู้ใช้งานที่ต้องการแก้ไข" };

  if (admin.id === userId && validation.data.role !== "ADMIN") {
    return { status: "error", message: "ไม่สามารถเปลี่ยนบทบาทบัญชีที่กำลังใช้งานอยู่ได้" };
  }

  if (target.role === "ADMIN" && validation.data.role === "USER") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (adminCount <= 1) {
      return { status: "error", message: "ระบบต้องมีผู้ดูแลอย่างน้อย 1 คน" };
    }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: validation.data.name,
        position: validation.data.position,
        role: validation.data.role,
        ...(validation.data.password
          ? {
              passwordHash: await hash(validation.data.password, 12),
              failedLoginCount: 0,
              lockedUntil: null,
            }
          : {}),
      },
    });
  } catch {
    return { status: "error", message: "แก้ไขผู้ใช้งานไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}/edit`);
  redirect("/admin/users?toast=updated");
}

export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  const admin = await requireAdmin();
  if (!admin) return { status: "error", message: "คุณไม่มีสิทธิ์ลบผู้ใช้งาน" };
  if (admin.id === userId) {
    return { status: "error", message: "ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้" };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) return { status: "error", message: "ไม่พบผู้ใช้งานนี้ในระบบ" };

  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (adminCount <= 1) {
      return { status: "error", message: "ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้" };
    }
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (error) {
    if (isPrismaErrorWithCode(error, "P2003")) {
      return {
        status: "error",
        message: "ผู้ใช้งานมีประวัติรายการ จึงไม่สามารถลบออกจากฐานข้อมูลได้",
      };
    }
    return { status: "error", message: "ลบผู้ใช้งานไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }

  revalidatePath("/admin/users");
  return { status: "success", message: "ลบผู้ใช้งานเรียบร้อยแล้ว" };
}
