"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, unstable_update } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateOwnProfileSchema } from "@/lib/validations/user";

export type ProfileActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateOwnProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user) {
    return { status: "error", message: "กรุณาลงชื่อเข้าใช้งานอีกครั้ง" };
  }

  const validation = updateOwnProfileSchema.safeParse({
    name: formData.get("name"),
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

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, isActive: true },
  });
  if (!currentUser?.isActive) {
    return { status: "error", message: "ไม่พบบัญชีผู้ใช้งานที่กำลังใช้งานอยู่" };
  }

  try {
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        displayName: validation.data.name,
        ...(validation.data.password
          ? {
              passwordHash: await hash(validation.data.password, 12),
              mustChangePassword: false,
              failedLoginCount: 0,
              lockedUntil: null,
            }
          : {}),
      },
    });
  } catch {
    return { status: "error", message: "แก้ไขโปรไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }

  try {
    await unstable_update({ user: { name: validation.data.name } });
  } catch {
    // The database is already updated; a later sign-in will refresh the session name.
  }

  revalidatePath("/profile/edit");
  redirect("/profile/edit?toast=updated");
}
