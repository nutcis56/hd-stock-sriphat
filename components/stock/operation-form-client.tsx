"use client";

import { FormEvent, useState } from "react";

type ProductOption = { sku: string; name: string; unit: string };
type Mode = "receive" | "transfer" | "usage";

const content = {
  receive: { title: "รับสินค้าเข้า Stock", subtitle: "บันทึกสินค้าและหลักฐานการรับเข้า", quantity: "จำนวนที่รับ (หน่วยหลัก)", staff: "ผู้รับ / ผู้บันทึก", action: "บันทึกรับสินค้า", tone: "green" },
  transfer: { title: "โอนสินค้าไปศรีพัฒน์", subtitle: "พฤกพลัง → ศรีพัฒน์", quantity: "จำนวนที่ขน (หน่วยหลัก)", staff: "ผู้ดำเนินการ", action: "ยืนยันโอนระหว่าง Stock", tone: "purple" },
  usage: { title: "ตัดใช้จาก Stock ศรีพัฒน์", subtitle: "บันทึกการเบิกใช้ภายในหน่วยงาน", quantity: "จำนวนที่ใช้ (หน่วยหลัก)", staff: "ผู้บันทึก", action: "ยืนยันตัดใช้จากศรีพัฒน์", tone: "red" },
} as const;

export default function OperationFormClient({ mode, products }: { mode: Mode; products: ProductOption[] }) {
  const [saved, setSaved] = useState(false);
  const labels = content[mode];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section className="operation-page">
      <div className="content-heading"><div><span className="eyebrow">STOCK OPERATION</span><h2>{labels.title}</h2><p>{labels.subtitle}</p></div></div>
      <article className="panel form-panel operation-form-panel">
        <div className="panel-heading"><div><h2>รายละเอียดรายการ</h2><p>กรอกข้อมูลให้ครบก่อนยืนยัน</p></div></div>
        <form className="form-grid" onSubmit={submit}>
          <label className="form-field wide"><span>สินค้า</span><select className="control" required defaultValue=""><option value="" disabled>— เลือกสินค้า —</option>{products.map((product) => <option key={product.sku} value={product.sku}>{product.name} ({product.unit})</option>)}</select></label>
          {mode === "receive" && <label className="form-field"><span>ปลายทางรับเข้า</span><select className="control"><option value="PPK">พฤกพลัง</option><option value="SRI">ศรีพัฒน์</option></select></label>}
          <label className="form-field"><span>{labels.quantity}</span><input className="control" type="number" min="0.01" step="0.01" required placeholder="0" /></label>
          <label className="form-field"><span>{labels.staff}</span><input className="control" required placeholder="ชื่อผู้ดำเนินการ" /></label>
          <label className="form-field wide"><span>หมายเหตุ</span><textarea className="control" rows={4} placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" /></label>
          <button className={`submit-button ${labels.tone}`} type="submit">{labels.action}</button>
        </form>
      </article>
      {saved && <div className="toast"><span>✓</span>ตรวจสอบฟอร์มเรียบร้อยแล้ว — ขั้นตอนบันทึกฐานข้อมูลจะเชื่อมต่อในลำดับถัดไป</div>}
    </section>
  );
}
