"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";

type ProductActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

type DeleteProductResult = {
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

function formValues(formData: FormData) {
  return {
    sku: formData.get("sku"),
    name: formData.get("name"),
    sourceNote: formData.get("sourceNote"),
    unit: formData.get("unit"),
    packSize: formData.get("packSize"),
    stockPpk: formData.get("stockPpk"),
    stockSri: formData.get("stockSri"),
  };
}

async function skuExists(sku: string, exceptSku?: string) {
  return prisma.product.findFirst({
    where: {
      sku: { equals: sku, mode: "insensitive" },
      ...(exceptSku ? { NOT: { sku: exceptSku } } : {}),
    },
    select: { sku: true },
  });
}

function revalidateProductPages() {
  revalidatePath("/products");
  revalidatePath("/receive");
  revalidatePath("/transfer");
  revalidatePath("/usage");
  revalidatePath("/calculator");
  revalidatePath("/transactions");
}

export async function createProduct(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const admin = await requireAdmin();
  if (!admin) return { status: "error", message: "คุณไม่มีสิทธิ์เพิ่มสินค้า" };

  const validation = productSchema.safeParse(formValues(formData));
  if (!validation.success) {
    return {
      status: "error",
      message: "กรุณาตรวจสอบข้อมูลที่กรอก",
      fieldErrors: z.flattenError(validation.error).fieldErrors,
    };
  }

  if (await skuExists(validation.data.sku)) {
    return {
      status: "error",
      message: "รหัสสินค้านี้มีอยู่ในระบบแล้ว",
      fieldErrors: { sku: ["กรุณาใช้รหัสสินค้าอื่น"] },
    };
  }

  try {
    await prisma.product.create({
      data: {
        sku: validation.data.sku,
        name: validation.data.name,
        sourceNote: validation.data.sourceNote || null,
        unit: validation.data.unit,
        packSize: validation.data.packSize,
        stockPpk: validation.data.stockPpk,
        stockSri: validation.data.stockSri,
        isActive: true,
      },
    });
  } catch (error) {
    if (isPrismaErrorWithCode(error, "P2002")) {
      return {
        status: "error",
        message: "รหัสสินค้านี้มีอยู่ในระบบแล้ว",
        fieldErrors: { sku: ["กรุณาใช้รหัสสินค้าอื่น"] },
      };
    }
    return { status: "error", message: "เพิ่มสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }

  revalidateProductPages();
  redirect("/products?toast=product-created");
}

export async function updateProduct(
  originalSku: string,
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const admin = await requireAdmin();
  if (!admin) return { status: "error", message: "คุณไม่มีสิทธิ์แก้ไขสินค้า" };

  const validation = productSchema.safeParse(formValues(formData));
  if (!validation.success) {
    return {
      status: "error",
      message: "กรุณาตรวจสอบข้อมูลที่กรอก",
      fieldErrors: z.flattenError(validation.error).fieldErrors,
    };
  }

  const target = await prisma.product.findUnique({
    where: { sku: originalSku },
    select: { sku: true, isActive: true },
  });
  if (!target?.isActive) return { status: "error", message: "ไม่พบสินค้าที่ต้องการแก้ไข" };

  if (await skuExists(validation.data.sku, originalSku)) {
    return {
      status: "error",
      message: "รหัสสินค้านี้มีอยู่ในระบบแล้ว",
      fieldErrors: { sku: ["กรุณาใช้รหัสสินค้าอื่น"] },
    };
  }

  try {
    await prisma.product.update({
      where: { sku: originalSku },
      data: {
        sku: validation.data.sku,
        name: validation.data.name,
        sourceNote: validation.data.sourceNote || null,
        unit: validation.data.unit,
        packSize: validation.data.packSize,
        stockPpk: validation.data.stockPpk,
        stockSri: validation.data.stockSri,
      },
    });
  } catch (error) {
    if (isPrismaErrorWithCode(error, "P2002")) {
      return {
        status: "error",
        message: "รหัสสินค้านี้มีอยู่ในระบบแล้ว",
        fieldErrors: { sku: ["กรุณาใช้รหัสสินค้าอื่น"] },
      };
    }
    return { status: "error", message: "แก้ไขสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }

  revalidateProductPages();
  redirect("/products?toast=product-updated");
}

export async function deleteProduct(sku: string): Promise<DeleteProductResult> {
  const admin = await requireAdmin();
  if (!admin) return { status: "error", message: "คุณไม่มีสิทธิ์ลบสินค้า" };

  try {
    const result = await prisma.product.updateMany({
      where: { sku, isActive: true },
      data: { isActive: false },
    });
    if (result.count !== 1) {
      return { status: "error", message: "ไม่พบสินค้า หรือสินค้าถูกลบแล้ว" };
    }
  } catch {
    return { status: "error", message: "ลบสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }

  revalidateProductPages();
  return { status: "success", message: "ลบสินค้าออกจากรายการเรียบร้อยแล้ว" };
}
