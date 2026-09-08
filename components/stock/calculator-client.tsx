"use client";

import {
  FormEvent,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { saveReorderPoint } from "@/lib/actions/calculator";

export type CalculatorProduct = {
  sku: string;
  name: string;
  unit: string;
  packSize: number;
  stockSri: number;
  reorderPoint: number;
};

type CalculationResult = {
  need: number;
  shortage: number;
  packs: number;
  order: number;
  reorderPoint: number;
};

const initialSaveState = {
  status: "idle" as const,
  message: "",
  reorderPoint: null,
  eventId: 0,
};

export default function CalculatorClient({
  products,
}: {
  products: CalculatorProduct[];
}) {
  const [selectedSku, setSelectedSku] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [weekly, setWeekly] = useState("12");
  const [weeks, setWeeks] = useState("4");
  const [safety, setSafety] = useState("10");
  const [saveState, saveAction, savePending] = useActionState(
    saveReorderPoint,
    initialSaveState,
  );
  const [dismissedEventId, setDismissedEventId] = useState(0);
  const number = useMemo(
    () => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }),
    [],
  );
  const selectedProduct = products.find(
    (product) => product.sku === selectedSku,
  );
  const hasAlert = Boolean(
    selectedProduct &&
      selectedProduct.reorderPoint > 0 &&
      selectedProduct.stockSri <= selectedProduct.reorderPoint,
  );
  const toastOpen =
    saveState.status !== "idle" && dismissedEventId !== saveState.eventId;

  useEffect(() => {
    if (saveState.status === "idle") return;
    const timer = window.setTimeout(
      () => setDismissedEventId(saveState.eventId),
      4000,
    );
    return () => window.clearTimeout(timer);
  }, [saveState]);

  function selectProduct(sku: string) {
    setSelectedSku(sku);
    setResult(null);
  }

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct) return;

    const weeklyValue = Math.max(0, Number(weekly) || 0);
    const weeksValue = Math.max(0, Number(weeks) || 0);
    const safetyValue = Math.max(0, Number(safety) || 0);
    const pack = Math.max(1, selectedProduct.packSize);
    const base = weeklyValue * weeksValue;
    const need = base + (base * safetyValue) / 100;
    const shortage = Math.max(0, need - selectedProduct.stockSri);
    const packs = Math.ceil(shortage / pack);

    setResult({
      need,
      shortage,
      packs,
      order: packs * pack,
      reorderPoint: Math.ceil(need),
    });
  }

  return (
    <section className="operation-page calculator-page">
      <div className="content-heading">
        <div>
          <span className="eyebrow">REQUISITION PLANNING</span>
          <h2>คำนวณจำนวนเบิก</h2>
          <p>วางแผนสำรองสำหรับ 4 หรือ 6 สัปดาห์จากยอดสินค้าปัจจุบัน</p>
        </div>
      </div>
      <div className="two-column calculator-layout">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>ข้อมูลสำหรับคำนวณ</h2>
              <p>ยอดคงเหลือและขนาดบรรจุดึงจากข้อมูลสินค้า</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={calculate}>
            <CalculatorProductCombobox
              products={products}
              selectedSku={selectedSku}
              onSelect={selectProduct}
            />
            <label className="form-field">
              <span>คงเหลือศรีพัฒน์ปัจจุบัน</span>
              <input
                className="control readonly-control"
                value={selectedProduct ? number.format(selectedProduct.stockSri) : "—"}
                readOnly
                aria-readonly="true"
              />
            </label>
            <label className="form-field">
              <span>จำนวนหน่วยต่อกล่อง</span>
              <input
                className="control readonly-control"
                value={selectedProduct ? number.format(selectedProduct.packSize) : "—"}
                readOnly
                aria-readonly="true"
              />
            </label>
            <label className="form-field">
              <span>ใช้เฉลี่ยต่อสัปดาห์</span>
              <input
                name="weekly"
                className="control"
                type="number"
                min="0"
                step="0.01"
                value={weekly}
                onChange={(event) => {
                  setWeekly(event.target.value);
                  setResult(null);
                }}
                required
              />
            </label>
            <label className="form-field">
              <span>ช่วงที่ต้องการครอบคลุม</span>
              <select
                name="weeks"
                className="control"
                value={weeks}
                onChange={(event) => {
                  setWeeks(event.target.value);
                  setResult(null);
                }}
              >
                <option value="4">1 เดือน (4 สัปดาห์)</option>
                <option value="6">45 วัน (6 สัปดาห์)</option>
              </select>
            </label>
            <label className="form-field wide">
              <span>Safety stock (%)</span>
              <input
                name="safety"
                className="control"
                type="number"
                min="0"
                step="0.01"
                value={safety}
                onChange={(event) => {
                  setSafety(event.target.value);
                  setResult(null);
                }}
                required
              />
            </label>
            <button
              className="submit-button purple"
              type="submit"
              disabled={!selectedProduct}
            >
              {selectedProduct
                ? "คำนวณจำนวนที่ควรเบิก"
                : "กรุณาเลือกสินค้าก่อนคำนวณ"}
            </button>
          </form>
        </article>

        <article className="panel info-panel calculator-result-panel">
          <div className="panel-heading">
            <div>
              <h2>ผลการคำนวณ</h2>
              <p>สถานะสินค้าใช้ประกอบการพิจารณาและไม่เปลี่ยนสูตรคำนวณ</p>
            </div>
          </div>
          <div className="info-content">
            {selectedProduct ? (
              <div className="calculator-product-summary">
                <div>
                  <strong>{selectedProduct.name}</strong>
                  <span>
                    SKU {selectedProduct.sku} • {selectedProduct.unit}
                  </span>
                </div>
                <span className={`status-pill ${hasAlert ? "low" : "enough"}`}>
                  <i />
                  {hasAlert ? "ควรตรวจสอบ" : "เพียงพอ"}
                </span>
                <dl>
                  <div>
                    <dt>คงเหลือศรีพัฒน์</dt>
                    <dd>{number.format(selectedProduct.stockSri)}</dd>
                  </div>
                  <div>
                    <dt>จุดเตือน</dt>
                    <dd>{number.format(selectedProduct.reorderPoint)}</dd>
                  </div>
                  <div>
                    <dt>บรรจุ/กล่อง</dt>
                    <dd>{number.format(selectedProduct.packSize)}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="calculator-empty-product">
                เลือกสินค้าเพื่อดูยอดคงเหลือและสถานะปัจจุบัน
              </div>
            )}

            <div className="result-grid">
              <div>
                <span>ต้องใช้ตามช่วง</span>
                <strong>{result ? number.format(result.need) : "—"}</strong>
                <small>หน่วย</small>
              </div>
              <div>
                <span>ขาด / ควรเบิก</span>
                <strong>{result ? number.format(result.shortage) : "—"}</strong>
                <small>หน่วย</small>
              </div>
              <div className="result-highlight">
                <span>สั่งเต็มกล่อง</span>
                <strong>{result ? number.format(result.packs) : "—"}</strong>
                <small>
                  {result ? `= ${number.format(result.order)} หน่วย` : "กล่อง"}
                </small>
              </div>
            </div>
            <form className="calculator-save-form" action={saveAction}>
              <input type="hidden" name="productSku" value={selectedSku} />
              <input type="hidden" name="weekly" value={weekly} />
              <input type="hidden" name="weeks" value={weeks} />
              <input type="hidden" name="safety" value={safety} />
              <div>
                <span>จุดเตือนที่แนะนำ</span>
                <strong>
                  {result ? `${number.format(result.reorderPoint)} หน่วย` : "—"}
                </strong>
              </div>
              <button
                type="submit"
                disabled={!result || savePending}
              >
                {savePending ? "กำลังบันทึก..." : "บันทึกจุดเตือนสินค้า"}
              </button>
            </form>
            {saveState.status === "error" && (
              <p className="form-message error" role="alert">
                {saveState.message}
              </p>
            )}
            <p className="formula">
              จำนวนที่ต้องมี = การใช้ต่อสัปดาห์ × ช่วงเวลา + Safety stock
              จากนั้นหักยอดศรีพัฒน์และปัดขึ้นเป็นกล่องเต็ม
            </p>
          </div>
        </article>
      </div>
      {toastOpen && (
        <div
          className={`toast ${
            saveState.status === "success" ? "toast-success" : "toast-error"
          }`}
          role={saveState.status === "success" ? "status" : "alert"}
          aria-live={saveState.status === "success" ? "polite" : "assertive"}
        >
          <span aria-hidden="true">
            {saveState.status === "success" ? "✓" : "!"}
          </span>
          <div>
            <strong>
              {saveState.status === "success"
                ? "บันทึกจุดเตือนเรียบร้อยแล้ว"
                : "บันทึกไม่สำเร็จ"}
            </strong>
            <small>{saveState.message}</small>
          </div>
          <button
            type="button"
            aria-label="ปิดข้อความแจ้งเตือน"
            onClick={() => setDismissedEventId(saveState.eventId)}
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}

function CalculatorProductCombobox({
  products,
  selectedSku,
  onSelect,
}: {
  products: CalculatorProduct[];
  selectedSku: string;
  onSelect: (sku: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
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

  function selectProduct(product: CalculatorProduct) {
    onSelect(product.sku);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="form-field wide product-combobox" ref={comboboxRef}>
      <label htmlFor="calculator-product-trigger">สินค้า</label>
      <div className="combobox-control">
        <button
          id="calculator-product-trigger"
          className="control combobox-trigger"
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="calculator-product-options"
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
      {open && (
        <div
          className="combobox-options"
          id="calculator-product-options"
          role="listbox"
        >
          <div className="combobox-search">
            <label className="sr-only" htmlFor="calculator-product-search">
              ค้นหาสินค้า
            </label>
            <input
              id="calculator-product-search"
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
                  {product.sku} • {product.unit} • ศรีพัฒน์ {product.stockSri}
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
