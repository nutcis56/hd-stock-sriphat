import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(5, "ชื่อผู้ใช้ต้องมีอย่างน้อย 5 ตัวอักษร")
  .regex(
    /^[A-Za-z0-9._-]+$/,
    "ชื่อผู้ใช้ใช้ได้เฉพาะอักษรอังกฤษ ตัวเลข จุด ขีดกลาง และขีดล่าง",
  );

export const passwordSchema = z
  .string()
  .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
  .regex(/^[A-Z]/, "ตัวแรกของรหัสผ่านต้องเป็นอักษรอังกฤษพิมพ์ใหญ่")
  .regex(/[a-z]/, "รหัสผ่านต้องมีอักษรอังกฤษพิมพ์เล็กอย่างน้อย 1 ตัว")
  .regex(/[0-9]/, "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว")
  .regex(/^[A-Za-z0-9]+$/, "รหัสผ่านใช้ได้เฉพาะอักษรอังกฤษและตัวเลข");

const profileFields = {
  name: z.string().trim().min(1, "กรุณากรอกชื่อผู้ใช้งาน"),
  position: z.enum(["RN", "PN"], "กรุณาเลือกตำแหน่ง"),
  role: z.enum(["ADMIN", "USER"], "กรุณาเลือกบทบาท"),
};

export const createUserSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirm_password: z.string(),
    ...profileFields,
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "ยืนยันรหัสผ่านไม่ตรงกับรหัสผ่าน",
  });

export const updateUserSchema = z
  .object({
    name: profileFields.name,
    position: profileFields.position,
    role: profileFields.role,
    password: z.union([z.literal(""), passwordSchema]),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "ยืนยันรหัสผ่านไม่ตรงกับรหัสผ่าน",
  });

export const updateOwnProfileSchema = z
  .object({
    name: profileFields.name,
    password: z.union([z.literal(""), passwordSchema]),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "ยืนยันรหัสผ่านไม่ตรงกับรหัสผ่าน",
  });
