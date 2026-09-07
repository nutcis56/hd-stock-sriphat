-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('RN', 'PN', 'ADMIN', 'OTHER');

-- CreateEnum
CREATE TYPE "StockLocation" AS ENUM ('PPK', 'SRI', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RECEIVE_PPK', 'RECEIVE_SRI', 'TRANSFER', 'USE_SRI', 'ADJUST');

-- CreateTable
CREATE TABLE "Product" (
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "packSize" DECIMAL(14,2) NOT NULL DEFAULT 1,
    "stockPpk" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "stockSri" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "reorderPoint" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sourceNote" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("sku")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'OTHER',
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" DECIMAL(14,2) NOT NULL,
    "fromLocation" "StockLocation",
    "toLocation" "StockLocation",
    "note" TEXT,
    "receiptUrl" TEXT,
    "actorEmail" TEXT,
    "stockPpkAfter" DECIMAL(14,2),
    "stockSriAfter" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productSku" TEXT NOT NULL,
    "staffId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "Staff_name_idx" ON "Staff"("name");

-- CreateIndex
CREATE INDEX "Staff_isActive_idx" ON "Staff"("isActive");

-- CreateIndex
CREATE INDEX "Transaction_productSku_createdAt_idx" ON "Transaction"("productSku", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_staffId_createdAt_idx" ON "Transaction"("staffId", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_type_createdAt_idx" ON "Transaction"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_productSku_fkey" FOREIGN KEY ("productSku") REFERENCES "Product"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
