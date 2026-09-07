import dotenv from "dotenv";
import { hash } from "bcryptjs";

dotenv.config({ path: ".env.local" });

const products = [
  { sku: "3876", name: "Bibag 650G", unit: "ชิ้น", packSize: 16, stockPpk: 5312, stockSri: 448, sourceNote: "ศรีพัฒน์ 28 กล่อง × 16" },
  { sku: "3868", name: "น้ำยา K2/3.5", unit: "แกลลอน", packSize: 1, stockPpk: 470, stockSri: 30, sourceNote: "นับจริง 3 ก.ย. 69" },
  { sku: "3869", name: "น้ำยา K2/2.5", unit: "แกลลอน", packSize: 1, stockPpk: 500, stockSri: 22, sourceNote: "นับจริง 3 ก.ย. 69" },
  { sku: "3870", name: "น้ำยา K3/2.5", unit: "แกลลอน", packSize: 1, stockPpk: 960, stockSri: 105, sourceNote: "นับจริง 3 ก.ย. 69" },
  { sku: "3872", name: "น้ำยา K3/3.5", unit: "แกลลอน", packSize: 1, stockPpk: 460, stockSri: 33, sourceNote: "นับจริง 3 ก.ย. 69" },
  { sku: "3873", name: "น้ำยา K4/3.5", unit: "แกลลอน", packSize: 1, stockPpk: 120, stockSri: 25, sourceNote: "นับจริง 3 ก.ย. 69" },
  { sku: "3874", name: "น้ำยา K4/2.5", unit: "แกลลอน", packSize: 1, stockPpk: 440, stockSri: 63, sourceNote: "นับจริง 3 ก.ย. 69" },
  { sku: "3877", name: "Citrosteril", unit: "แกลลอน", packSize: 1, stockPpk: 29, stockSri: 5, sourceNote: "นับจริง 3 ก.ย. 69" },
  { sku: "3878", name: "Blood Line Online", unit: "ชุด", packSize: 20, stockPpk: 1837, stockSri: 180, sourceNote: "ศรีพัฒน์ 9 กล่อง × 20" },
  { sku: "3881", name: "Blood Line มาตรฐาน", unit: "ชุด", packSize: 24, stockPpk: 6680, stockSri: 360, sourceNote: "ศรีพัฒน์ 15 กล่อง × 24" },
  { sku: "NIPRO-FB210U", name: "NIPRO FB210U", unit: "ชิ้น", packSize: 24, stockPpk: 96, stockSri: 72, sourceNote: "ศรีพัฒน์ 3 กล่อง × 24" },
  { sku: "3879", name: "ตัวกรอง B16P", unit: "ชิ้น", packSize: 24, stockPpk: 888, stockSri: 72, sourceNote: "ศรีพัฒน์ 3 กล่อง × 24" },
  { sku: "3880", name: "ตัวกรอง B20H", unit: "ชิ้น", packSize: 24, stockPpk: 552, stockSri: 48, sourceNote: "ศรีพัฒน์ 2 กล่อง × 24" },
  { sku: "HDF100", name: "ตัวกรอง HDF100", unit: "ชิ้น", packSize: 1, stockPpk: 60, stockSri: 7, sourceNote: "พฤกพลังแก้เป็น 60 ตามคำยืนยัน" },
  { sku: "DIASAFE", name: "Diasafe", unit: "ชิ้น", packSize: 1, stockPpk: 0, stockSri: 24, sourceNote: "มีเฉพาะศรีพัฒน์" },
  { sku: "3885", name: "MDT Plus 4 Cold Sterilant", unit: "แกลลอน", packSize: 1, stockPpk: 58, stockSri: 3, sourceNote: "นับจริง 3 ก.ย. 69" },
  { sku: "3882", name: "AVF Needle 15G", unit: "ชิ้น", packSize: 50, stockPpk: 2750, stockSri: 150, sourceNote: "ศรีพัฒน์ 3 กล่อง × 50" },
  { sku: "3883", name: "AVF Needle 16G", unit: "ชิ้น", packSize: 50, stockPpk: 1900, stockSri: 550, sourceNote: "ศรีพัฒน์ 11 กล่อง × 50" },
  { sku: "3884", name: "AVF Needle 17G", unit: "ชิ้น", packSize: 50, stockPpk: 250, stockSri: 83, sourceNote: "ไม่มีในตารางนับล่าสุด จึงใช้ยอดจาก sheet รายการ" },
  { sku: "3887", name: "Set AVF", unit: "ชุด", packSize: 1, stockPpk: 3460, stockSri: 5, sourceNote: "นับจริง 3 ก.ย. 69" },
  { sku: "3888", name: "Set Permanent Catheter Dressing", unit: "ชุด", packSize: 1, stockPpk: 3455, stockSri: 11, sourceNote: "นับจริง 3 ก.ย. 69" },
  { sku: "SODIUM-BICARB", name: "Sodium Bicarbonate", unit: "แกลลอน", packSize: 1, stockPpk: 0, stockSri: 30, sourceNote: "ศรีพัฒน์ 28 + รับเข้า 2" },
] as const;

async function main() {
  const { default: prisma } = await import("../lib/prisma");

  const adminUsername = process.env.SEED_ADMIN_USERNAME?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    throw new Error("SEED_ADMIN_USERNAME and SEED_ADMIN_PASSWORD are required in .env.local");
  }

  if (adminPassword.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must contain at least 8 characters");
  }

  await prisma.$transaction(
    products.map((product) =>
      prisma.product.upsert({
        where: { sku: product.sku },
        create: {
          ...product,
          reorderPoint: 0,
          isActive: true,
        },
        update: {
          name: product.name,
          unit: product.unit,
          packSize: product.packSize,
          sourceNote: product.sourceNote,
          isActive: true,
        },
      }),
    ),
  );

  const total = await prisma.product.count();
  console.log(`Seeded ${products.length} products. Database now has ${total} products.`);

  const passwordHash = await hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { username: adminUsername },
    create: {
      username: adminUsername,
      passwordHash,
      displayName: process.env.SEED_ADMIN_DISPLAY_NAME?.trim() || "ผู้ดูแลระบบ",
      position: process.env.SEED_ADMIN_POSITION?.trim() || null,
      role: "ADMIN",
      isActive: true,
      mustChangePassword: true,
    },
    update: {
      displayName: process.env.SEED_ADMIN_DISPLAY_NAME?.trim() || "ผู้ดูแลระบบ",
      position: process.env.SEED_ADMIN_POSITION?.trim() || null,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Admin user is ready.");

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Database seed failed", error);
  process.exitCode = 1;
});
