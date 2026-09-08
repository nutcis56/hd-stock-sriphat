"use client";

import Link from "next/link";
import { useActionState, useMemo } from "react";
import { createProduct, updateProduct } from "@/lib/actions/products";

type ProductFormState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type EditableProduct = {
  sku: string;
  name: string;
  sourceNote: string | null;
  unit: string;
  packSize: number;
  stockPpk: number;
  stockSri: number;
};

const initialState: ProductFormState = { status: "idle", message: "" };

export default function ProductFormClient({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: EditableProduct;
}) {
  const submitAction = useMemo(
    () =>
      mode === "create" || !product
        ? createProduct
        : updateProduct.bind(null, product.sku),
    [mode, product],
  );
  const [state, formAction, pending] = useActionState(
    submitAction,
    initialState,
  );

  return (
    <section className="product-form-page">
      <div className="content-heading">
        <div>
          <span className="eyebrow">PRODUCT MANAGEMENT</span>
          <h2>{mode === "create" ? "เพิ่มรายการสินค้า" : "แก้ไขสินค้า"}</h2>
          <p>
            {mode === "create"
              ? "สร้างสินค้าใหม่และกำหนดยอด Stock เริ่มต้น"
              : `ปรับปรุงข้อมูล ${product?.name}`}
          </p>
        </div>
      </div>
      <article className="panel product-form-panel">
        <div className="panel-heading">
          <div>
            <h2>ข้อมูลสินค้า</h2>
            <p>ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก</p>
          </div>
        </div>
        <form className="product-form-grid" action={formAction}>
          <ProductField label="รหัสสินค้า (SKU) *" error={state.fieldErrors?.sku?.[0]}>
            <input
              className="control"
              name="sku"
              defaultValue={product?.sku ?? ""}
              maxLength={80}
              autoComplete="off"
              required
            />
          </ProductField>
          <ProductField label="ชื่อสินค้า *" error={state.fieldErrors?.name?.[0]}>
            <input
              className="control"
              name="name"
              defaultValue={product?.name ?? ""}
              maxLength={200}
              required
            />
          </ProductField>
          <ProductField label="หน่วย *" error={state.fieldErrors?.unit?.[0]}>
            <select
              className="control"
              name="unit"
              defaultValue={product?.unit ?? ""}
              required
            >
              <option value="" disabled>— เลือกหน่วย —</option>
              <option value="ชิ้น">ชิ้น</option>
              <option value="แกลลอน">แกลลอน</option>
              <option value="ชุด">ชุด</option>
            </select>
          </ProductField>
          <ProductField
            label="บรรจุ/กล่อง *"
            error={state.fieldErrors?.packSize?.[0]}
          >
            <input
              className="control"
              name="packSize"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={product?.packSize ?? 1}
              required
            />
          </ProductField>
          <ProductField
            label="ยอดพฤกพลัง *"
            error={state.fieldErrors?.stockPpk?.[0]}
          >
            <input
              className="control"
              name="stockPpk"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.stockPpk ?? 0}
              required
            />
          </ProductField>
          <ProductField
            label="ยอดศรีพัฒน์ *"
            error={state.fieldErrors?.stockSri?.[0]}
          >
            <input
              className="control"
              name="stockSri"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.stockSri ?? 0}
              required
            />
          </ProductField>
          <ProductField
            wide
            label="รายละเอียด"
            error={state.fieldErrors?.sourceNote?.[0]}
          >
            <textarea
              className="control"
              name="sourceNote"
              rows={4}
              maxLength={1000}
              defaultValue={product?.sourceNote ?? ""}
              placeholder="รายละเอียดหรือหมายเหตุของสินค้า (ถ้ามี)"
            />
          </ProductField>

          {state.status === "error" && (
            <p className="product-form-error" role="alert">
              {state.message}
            </p>
          )}
          <div className="product-form-actions">
            <Link href="/products">ยกเลิก</Link>
            <button type="submit" disabled={pending}>
              {pending
                ? "กำลังบันทึก..."
                : mode === "create"
                  ? "เพิ่มรายการสินค้า"
                  : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

function ProductField({
  label,
  error,
  wide = false,
  children,
}: {
  label: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`product-form-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
