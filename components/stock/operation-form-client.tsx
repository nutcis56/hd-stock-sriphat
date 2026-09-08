"use client";

import {
  FormEvent,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { receiveStock } from "@/lib/actions/receive";

type ProductOption = { sku: string; name: string; unit: string };
type Mode = "receive" | "transfer" | "usage";
type ReceiveFormState = {
  status: "idle" | "error";
  message: string;
};

const initialReceiveFormState: ReceiveFormState = {
  status: "idle",
  message: "",
};

const content = {
  receive: {
    title: "",
    subtitle: "",
    quantity: "จำนวนที่รับ (หน่วยหลัก)",
    staff: "ผู้รับ / ผู้บันทึก",
    action: "บันทึกรับสินค้า",
    tone: "purple",
  },
  transfer: {
    title: "โอนสินค้าไปศรีพัฒน์",
    subtitle: "พฤกพลัง → ศรีพัฒน์",
    quantity: "จำนวนที่ขน (หน่วยหลัก)",
    staff: "ผู้ดำเนินการ",
    action: "ยืนยันโอนระหว่าง Stock",
    tone: "purple",
  },
  usage: {
    title: "ตัดใช้จาก Stock ศรีพัฒน์",
    subtitle: "บันทึกการเบิกใช้ภายในหน่วยงาน",
    quantity: "จำนวนที่ใช้ (หน่วยหลัก)",
    staff: "ผู้บันทึก",
    action: "ยืนยันตัดใช้จากศรีพัฒน์",
    tone: "red",
  },
} as const;

export default function OperationFormClient({
  mode,
  products,
  actor,
}: {
  mode: Mode;
  products: ProductOption[];
  actor?: {
    id: string;
    username: string;
    displayName: string;
    position: string | null;
  };
}) {
  const [saved, setSaved] = useState(false);
  const [receiveState, receiveAction, receivePending] = useActionState(
    receiveStock,
    initialReceiveFormState,
  );
  const labels = content[mode];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }

  const error = mode === "receive" && receiveState.status === "error";

  return (
    <section className="operation-page">
      <div className="content-heading">
        <div>
          <span className="eyebrow">STOCK OPERATION</span>
          <h2>{labels.title}</h2>
          <p>{labels.subtitle}</p>
        </div>
      </div>
      <div className={mode === "receive" ? "receive-form-layout" : undefined}>
      <article className={`panel form-panel operation-form-panel ${mode}-form-panel`}>
        <div className="panel-heading">
          <div>
            <h2>รับสินค้าเข้า Stock</h2>
          </div>
        </div>
        <form
          className="form-grid"
          action={mode === "receive" ? receiveAction : undefined}
          onSubmit={mode === "receive" ? undefined : submit}
        >
          {mode === "receive" ? (
            <ProductCombobox products={products} />
          ) : (
            <label className="form-field wide">
              <span>สินค้า</span>
              <select
                className="control"
                name="productSku"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  — เลือกสินค้า —
                </option>
                {products.map((product) => (
                  <option key={product.sku} value={product.sku}>
                    {product.name} ({product.unit})
                  </option>
                ))}
              </select>
            </label>
          )}
          {mode === "receive" && (
            <label className="form-field">
              <span>ปลายทางรับเข้า</span>
              <select className="control" name="toLocation">
                <option value="PPK">พฤกพลัง</option>
                <option value="SRI">ศรีพัฒน์</option>
              </select>
            </label>
          )}
          <label className="form-field">
            <span>{labels.quantity}</span>
            <input
              className="control"
              type="number"
              name="quantity"
              min="0.01"
              step="0.01"
              required
              placeholder="0"
            />
          </label>
          <label className="form-field">
            <span>{labels.staff}</span>
            {mode === "receive" ? (
              <>
                <input
                  className="control readonly-control"
                  value={
                    actor
                      ? `${actor.position || "ผู้ใช้งานระบบ"} • ${actor.displayName}`
                      : ""
                  }
                  readOnly
                  aria-readonly="true"
                />
                {actor && (
                  <>
                    <input type="hidden" name="actorUserId" value={actor.id} />
                    <input
                      type="hidden"
                      name="actorUsername"
                      value={actor.username}
                    />
                  </>
                )}
              </>
            ) : (
              <input
                className="control"
                required
                placeholder="ชื่อผู้ดำเนินการ"
              />
            )}
          </label>
          <label className="form-field wide">
            <span>เลขที่ใบส่งของ / หมายเหตุ</span>
            <textarea
              className="control"
              name="note"
              rows={4}
              placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
            />
          </label>
          {error && (
            <p className="form-message error" role="alert">
              {receiveState.message}
            </p>
          )}
          <button
            className={`submit-button ${labels.tone}`}
            type="submit"
            disabled={receivePending}
          >
            {receivePending ? "กำลังบันทึก..." : labels.action}
          </button>
        </form>
      </article>
      {mode === "receive" && (
        <aside className="panel receive-guidance-card">
          <h2>หลักการทำงาน</h2>
          <p>
            สินค้าทั่วไปรับเข้าที่พฤกพลัง ส่วน Diasafe รับตรงเข้าศรีพัฒน์
            ตามโครงสร้าง Stock ที่กำหนด พร้อมบันทึกผู้รับ เวลา
            และรายละเอียดรายการลงใน Transaction Log
          </p>
          <small>
            
          </small>
        </aside>
      )}
      </div>
      {saved && (
        <div className="toast">
          <span>✓</span>
          ตรวจสอบฟอร์มเรียบร้อยแล้ว
        </div>
      )}
      {error && (
        <div className="toast toast-error" role="alert" aria-live="assertive">
          <span aria-hidden="true">!</span>
          <div>
            <strong>บันทึกไม่สำเร็จ</strong>
            <small>{receiveState.message}</small>
          </div>
        </div>
      )}
    </section>
  );
}

function ProductCombobox({ products }: { products: ProductOption[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSku, setSelectedSku] = useState("");
  const comboboxRef = useRef<HTMLDivElement>(null);
  const selectedProduct = products.find(
    (product) => product.sku === selectedSku,
  );
  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("th");
    if (!keyword) return products;
    return products.filter((product) =>
      `${product.sku} ${product.name} ${product.unit}`
        .toLocaleLowerCase("th")
        .includes(keyword),
    );
  }, [products, search]);

  useEffect(() => {
    function closeDropdown(event: PointerEvent) {
      if (!comboboxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeDropdown);
    return () => document.removeEventListener("pointerdown", closeDropdown);
  }, []);

  function selectProduct(product: ProductOption) {
    setSelectedSku(product.sku);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="form-field wide product-combobox" ref={comboboxRef}>
      <label htmlFor="receive-product-trigger">สินค้า</label>
      <div className="combobox-control">
        <button
          id="receive-product-trigger"
          className="control combobox-trigger"
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="receive-product-options"
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "ArrowDown") setOpen(true);
          }}
        >
          <span className={selectedProduct ? "" : "placeholder"}>
            {selectedProduct
              ? `${selectedProduct.name} (${selectedProduct.unit})`
              : "— เลือกสินค้า —"}
          </span>
        </button>
        <span aria-hidden="true">⌄</span>
      </div>
      <input type="hidden" name="productSku" value={selectedSku} />
      {open && (
        <div
          className="combobox-options"
          id="receive-product-options"
          role="listbox"
        >
          <div className="combobox-search">
            <label className="sr-only" htmlFor="receive-product-search">
              ค้นหาสินค้า
            </label>
            <input
              id="receive-product-search"
              type="search"
              value={search}
              placeholder="ค้นหาชื่อสินค้า หรือ SKU"
              autoComplete="off"
              autoFocus
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
              }}
            />
          </div>
          {filteredProducts.length ? (
            filteredProducts.map((product) => (
              <button
                key={product.sku}
                type="button"
                role="option"
                aria-selected={selectedSku === product.sku}
                onClick={() => selectProduct(product)}
              >
                <strong>{product.name}</strong>
                <small>
                  {product.sku} • {product.unit}
                </small>
              </button>
            ))
          ) : (
            <p>ไม่พบสินค้าที่ค้นหา</p>
          )}
        </div>
      )}
    </div>
  );
}
