import { z } from "zod";

export const productSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, "กรุณากรอกรหัสสินค้า")
    .max(80, "รหัสสินค้าต้องไม่เกิน 80 ตัวอักษร"),
  name: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อสินค้า")
    .max(200, "ชื่อสินค้าต้องไม่เกิน 200 ตัวอักษร"),
  sourceNote: z.string().trim().max(1000, "รายละเอียดต้องไม่เกิน 1,000 ตัวอักษร"),
  unit: z
    .string()
    .trim()
    .refine(
      (unit) => ["ชิ้น", "แกลลอน", "ชุด"].includes(unit),
      "กรุณาเลือกหน่วยสินค้า",
    ),
  packSize: z.coerce
    .number<number>()
    .finite("จำนวนบรรจุต้องเป็นตัวเลข")
    .positive("จำนวนบรรจุต้องมากกว่า 0"),
  stockPpk: z.coerce
    .number<number>()
    .finite("ยอดพฤกพลังต้องเป็นตัวเลข")
    .nonnegative("ยอดพฤกพลังต้องไม่ติดลบ"),
  stockSri: z.coerce
    .number<number>()
    .finite("ยอดศรีพัฒน์ต้องเป็นตัวเลข")
    .nonnegative("ยอดศรีพัฒน์ต้องไม่ติดลบ"),
});
