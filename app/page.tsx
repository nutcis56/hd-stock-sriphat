"use client";

import Image from "next/image";
import { FormEvent, ReactNode, useMemo, useState } from "react";

type Tab = "dashboard" | "receive" | "transfer" | "use" | "calculator" | "history";
type Product = { sku: string; name: string; unit: string; pack: number; ppk: number; sri: number; min: number; updated: string };

const products: Product[] = [
  { sku: "3876", name: "Bibag 650G", unit: "ชิ้น", pack: 16, ppk: 5312, sri: 448, min: 1008, updated: "3 ก.ย. 69" },
  { sku: "3868", name: "น้ำยา K2/3.5", unit: "แกลลอน", pack: 1, ppk: 470, sri: 30, min: 84, updated: "3 ก.ย. 69" },
  { sku: "3869", name: "น้ำยา K2/2.5", unit: "แกลลอน", pack: 1, ppk: 500, sri: 22, min: 126, updated: "3 ก.ย. 69" },
  { sku: "3870", name: "น้ำยา K3/2.5", unit: "แกลลอน", pack: 1, ppk: 960, sri: 105, min: 144, updated: "3 ก.ย. 69" },
  { sku: "3872", name: "น้ำยา K3/3.5", unit: "แกลลอน", pack: 1, ppk: 460, sri: 33, min: 48, updated: "3 ก.ย. 69" },
  { sku: "3873", name: "น้ำยา K4/3.5", unit: "แกลลอน", pack: 1, ppk: 120, sri: 25, min: 1, updated: "3 ก.ย. 69" },
  { sku: "3874", name: "น้ำยา K4/2.5", unit: "แกลลอน", pack: 1, ppk: 440, sri: 63, min: 36, updated: "3 ก.ย. 69" },
  { sku: "3877", name: "Citrosteril", unit: "แกลลอน", pack: 1, ppk: 29, sri: 5, min: 5, updated: "3 ก.ย. 69" },
  { sku: "3878", name: "Blood Line Online", unit: "ชุด", pack: 20, ppk: 1837, sri: 180, min: 168, updated: "3 ก.ย. 69" },
  { sku: "3881", name: "Blood Line มาตรฐาน", unit: "ชุด", pack: 24, ppk: 6680, sri: 360, min: 336, updated: "3 ก.ย. 69" },
  { sku: "NIPRO-FB210U", name: "NIPRO FB210U", unit: "ชิ้น", pack: 24, ppk: 96, sri: 72, min: 1, updated: "3 ก.ย. 69" },
  { sku: "DIASAFE", name: "Diasafe", unit: "ชิ้น", pack: 1, ppk: 0, sri: 24, min: 1, updated: "3 ก.ย. 69" },
];

function Icon({ path }: { path: string }) { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={path} /></svg> }

const navItems: { id: Tab; label: string; path: string }[] = [
  { id: "dashboard", label: "ภาพรวม Stock", path: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
  { id: "receive", label: "รับสินค้าเข้า", path: "M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" },
  { id: "transfer", label: "โอนไปศรีพัฒน์", path: "M5 8h12m0 0-3-3m3 3-3 3M19 16H7m0 0 3-3m-3 3 3 3" },
  { id: "use", label: "ตัดใช้ศรีพัฒน์", path: "M7 7h10l-1 13H8L7 7Zm-2 0h14M9 7V4h6v3" },
  { id: "calculator", label: "คำนวณเบิก 4/6 สัปดาห์", path: "M6 3h12v18H6zM9 7h6M9 12h1m4 0h1m-6 4h1m4 0h1" },
  { id: "history", label: "ประวัติ", path: "M4 12a8 8 0 1 0 2.3-5.7L4 8.5M4 4v4.5h4.5M12 8v5l3 2" },
];

function ProductSelect() { return <select className="control" defaultValue=""><option value="" disabled>— เลือกสินค้า —</option>{products.map((p) => <option key={p.sku} value={p.sku}>{p.name} ({p.unit})</option>)}</select> }
function StaffSelect() { return <select className="control" defaultValue=""><option value="" disabled>— เลือกผู้บันทึก —</option><option>RN • พัชรนทร์</option><option>RN • เนตรชนก</option><option>RN • จิราวรรณ</option><option>PN • เรืองรอง</option></select> }

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("ALL");
  const [toast, setToast] = useState("");
  const [calc, setCalc] = useState({ need: 0, shortage: 0, packs: 0, order: 0, ready: false });
  const number = useMemo(() => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }), []);
  const filtered = products.filter((p) => `${p.sku} ${p.name}`.toLowerCase().includes(query.toLowerCase().trim()) && (location === "ALL" || (location === "PPK" ? p.ppk > 0 : p.sri > 0)));
  const stats = { products: products.length, ppk: products.reduce((s, p) => s + p.ppk, 0), sri: products.reduce((s, p) => s + p.sri, 0), low: products.filter((p) => p.sri <= p.min).length };

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 3000) }
  function submitDemo(event: FormEvent<HTMLFormElement>, message: string) { event.preventDefault(); notify(message) }
  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const current = Number(data.get("current")), weekly = Number(data.get("weekly")), weeks = Number(data.get("weeks")), safety = Number(data.get("safety")), pack = Math.max(1, Number(data.get("pack")));
    const base = weekly * weeks, need = base + base * safety / 100, shortage = Math.max(0, need - current), packs = Math.ceil(shortage / pack);
    setCalc({ need, shortage, packs, order: packs * pack, ready: true });
  }

  return <div className="app-shell">
    <header className="topbar"><div className="topbar-inner">
      <div className="brand"><Image src="/sriphat-logo.png" alt="Sriphat Hospital CMU" width={367} height={175} priority /><div className="brand-copy"><strong>HD Stock Platform</strong><span>คลินิกไตเทียม • ระบบคลังเวชภัณฑ์กลาง</span></div></div>
      <div className="connection"><div><span className="live-dot" />เชื่อมต่อฐานข้อมูลกลาง</div><span>อัปเดตล่าสุด วันนี้ 10:42 น.</span></div>
    </div></header>

    <main className="page-wrap">
      <div className="page-heading"><div><span className="eyebrow">INVENTORY MANAGEMENT</span><h1>คลังเวชภัณฑ์ไตเทียม</h1><p>ติดตาม รับเข้า และเคลื่อนย้ายสินค้าในทุกจุดจัดเก็บ</p></div><button className="refresh-button" onClick={() => notify("อัปเดตข้อมูลล่าสุดแล้ว")}><Icon path="M20 6v5h-5M4 18v-5h5M6.1 9A7 7 0 0 1 18 6l2 5M4 13l2 5a7 7 0 0 0 11.9-3" /><span>รีเฟรชข้อมูล</span></button></div>
      <nav className="tab-nav" aria-label="เมนูระบบสต็อก">{navItems.map((item) => <button key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)}><Icon path={item.path} /><span>{item.label}</span></button>)}</nav>

      {activeTab === "dashboard" && <section className="tab-content">
        <div className="stats-grid">
          <Stat tone="violet" label="รายการสินค้าทั้งหมด" value={stats.products.toString()} note="รายการในระบบ" path="M5 7 12 3l7 4-7 4-7-4Zm0 5 7 4 7-4M5 17l7 4 7-4" />
          <Stat tone="teal" label="คงเหลือพฤกพลัง" value={number.format(stats.ppk)} note="หน่วยคงเหลือ" path="M3 9h18M5 9v11h14V9M8 9V5h8v4M9 13h6" />
          <Stat tone="purple" label="คงเหลือศรีพัฒน์" value={number.format(stats.sri)} note="หน่วยคงเหลือ" path="M4 20h16M6 20V9l6-5 6 5v11M9 13h2m2 0h2m-6 4h2m2 0h2" />
          <Stat tone="amber" label="รายการถึงจุดเตือน" value={stats.low.toString()} note="ควรตรวจสอบยอด" warning path="M12 3 2.8 20h18.4L12 3Zm0 6v5m0 3v.1" />
        </div>
        <article className="panel inventory-panel">
          <div className="panel-heading"><div><h2>รายการสินค้า</h2><p>ข้อมูลคงเหลือแยกตามจุดจัดเก็บ</p></div><span className="item-count">{filtered.length} รายการ</span></div>
          <div className="toolbar"><label className="search-field"><span className="sr-only">ค้นหาสินค้า</span><Icon path="m21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาชื่อสินค้า หรือ SKU..." /></label><label className="filter-field"><span>สถานที่จัดเก็บ</span><select value={location} onChange={(e) => setLocation(e.target.value)}><option value="ALL">ทั้งสอง Stock</option><option value="PPK">พฤกพลัง</option><option value="SRI">ศรีพัฒน์</option></select></label></div>
          <div className="table-scroll"><table><thead><tr><th>สินค้า</th><th>หน่วย</th><th className="right">บรรจุ/กล่อง</th><th className="right">พฤกพลัง</th><th className="right">ศรีพัฒน์</th><th className="right">จุดเตือน</th><th>สถานะ</th><th>อัปเดต</th></tr></thead><tbody>{filtered.map((p) => { const low = p.sri <= p.min; return <tr key={p.sku}><td><div className="product-cell"><span className="product-mark">{p.name.charAt(0)}</span><div><strong>{p.name}</strong><span>SKU {p.sku}</span></div></div></td><td>{p.unit}</td><td className="right muted-number">{p.pack}</td><td className="right stock-number">{number.format(p.ppk)}</td><td className={`right stock-number ${low ? "danger-text" : ""}`}>{number.format(p.sri)}</td><td className="right muted-number">{number.format(p.min)}</td><td><span className={`status-pill ${low ? "low" : "enough"}`}><i />{low ? "ควรตรวจสอบ" : "เพียงพอ"}</span></td><td><span className="updated">{p.updated}</span></td></tr> })}</tbody></table>{filtered.length === 0 && <div className="empty-state">ไม่พบรายการที่ค้นหา</div>}</div>
        </article>
      </section>}

      {activeTab === "receive" && <section className="two-column tab-content"><FormPanel title="รับสินค้าเข้า Stock" subtitle="บันทึกสินค้าและหลักฐานการรับเข้า" onSubmit={(e) => submitDemo(e, "บันทึกรับสินค้าเรียบร้อยแล้ว")} action="บันทึกรับสินค้า" tone="green"><Field label="สินค้า" wide><ProductSelect /></Field><Field label="ปลายทางรับเข้า"><select className="control"><option>พฤกพลัง</option><option>ศรีพัฒน์ (Diasafe เท่านั้น)</option></select></Field><Field label="จำนวน (หน่วยหลัก)"><input className="control" type="number" min="0.01" placeholder="0" /></Field><Field label="ผู้รับ / ผู้บันทึก"><StaffSelect /></Field><Field label="เลขที่ใบส่งของ / หมายเหตุ" wide><textarea className="control" rows={3} placeholder="ระบุรายละเอียดเพิ่มเติม" /></Field><Field label="ภาพใบเสร็จหรือใบส่งของ" wide><label className="upload-box"><Icon path="M12 16V4m0 0L8 8m4-4 4 4M5 14v5h14v-5" /><strong>คลิกเพื่อเลือกภาพหลักฐาน</strong><span>PNG, JPG หรือ WEBP ขนาดไม่เกิน 5 MB</span><input type="file" accept="image/png,image/jpeg,image/webp" /></label></Field></FormPanel><InfoPanel title="หลักการทำงาน"><div className="info-illustration green-bg"><Icon path="M4 20h16M6 20V9l6-5 6 5v11M9 13h2m2 0h2m-6 4h2m2 0h2" /></div><h3>รับเข้าสินค้าอย่างเป็นระบบ</h3><p>สินค้าทั่วไปรับเข้าที่พฤกพลัง ส่วน Diasafe รับตรงเข้าศรีพัฒน์ตามโครงสร้าง Stock ที่กำหนด</p><InfoNote>ระบบบันทึกผู้รับ เวลา และลิงก์หลักฐานทุกครั้ง</InfoNote></InfoPanel></section>}

      {activeTab === "transfer" && <section className="two-column tab-content"><FormPanel title="โอนสินค้าไปศรีพัฒน์" subtitle="พฤกพลัง → ศรีพัฒน์" onSubmit={(e) => submitDemo(e, "บันทึกการโอนสินค้าเรียบร้อยแล้ว")} action="ยืนยันโอนระหว่าง Stock" tone="purple"><Field label="สินค้า" wide><ProductSelect /></Field><Field label="จำนวนที่ขน (หน่วยหลัก)"><input className="control" type="number" min="0.01" placeholder="0" /></Field><Field label="ผู้ดำเนินการ"><StaffSelect /></Field><Field label="หมายเหตุ" wide><textarea className="control" rows={4} placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" /></Field></FormPanel><InfoPanel title="ผลของรายการ"><div className="flow-card"><div><span className="flow-icon amber"><Icon path="M3 9h18M5 9v11h14V9M8 9V5h8v4" /></span><strong>Stock พฤกพลัง</strong><b className="minus">− จำนวนโอน</b></div><span className="flow-arrow">→</span><div><span className="flow-icon green"><Icon path="M4 20h16M6 20V9l6-5 6 5v11" /></span><strong>Stock ศรีพัฒน์</strong><b className="plus">+ จำนวนโอน</b></div></div><InfoNote>ระบบไม่อนุญาตให้โอนเกินยอดที่มี และป้องกันการแก้ยอดพร้อมกัน</InfoNote></InfoPanel></section>}

      {activeTab === "use" && <section className="two-column tab-content"><FormPanel title="ตัดใช้จาก Stock ศรีพัฒน์" subtitle="บันทึกการเบิกใช้ภายในหน่วยงาน" onSubmit={(e) => submitDemo(e, "บันทึกการตัดใช้เรียบร้อยแล้ว")} action="ยืนยันตัดใช้จากศรีพัฒน์" tone="red"><Field label="สินค้าที่ใช้" wide><ProductSelect /></Field><Field label="จำนวนที่ใช้ (หน่วยหลัก)"><input className="control" type="number" min="0.01" placeholder="0" /></Field><Field label="ผู้บันทึก"><StaffSelect /></Field><Field label="รายละเอียดการใช้ / หมายเหตุ" wide><textarea className="control" rows={4} placeholder="เช่น ใช้ประจำวัน รอบเช้า หรือเลขเคส" /></Field></FormPanel><InfoPanel title="ข้อควรทราบ"><div className="info-illustration red-bg"><Icon path="M12 9v4m0 4h.01M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /></div><h3>ตัดจากยอดศรีพัฒน์เท่านั้น</h3><p>รายการนี้ไม่กระทบ Stock พฤกพลัง และระบบจะไม่อนุญาตให้ยอดคงเหลือติดลบ</p></InfoPanel></section>}

      {activeTab === "calculator" && <section className="two-column tab-content"><FormPanel title="คำนวณจำนวนเบิก" subtitle="วางแผนสำรองสำหรับ 4 หรือ 6 สัปดาห์" onSubmit={calculate} action="คำนวณจำนวนที่ควรเบิก" tone="purple"><Field label="เลือกสินค้า" wide><ProductSelect /></Field><Field label="คงเหลือศรีพัฒน์ปัจจุบัน"><input name="current" className="control" type="number" min="0" defaultValue="30" /></Field><Field label="ใช้เฉลี่ยต่อสัปดาห์"><input name="weekly" className="control" type="number" min="0" defaultValue="12" /></Field><Field label="ช่วงที่ต้องการครอบคลุม"><select name="weeks" className="control"><option value="4">1 เดือน (4 สัปดาห์)</option><option value="6">45 วัน (6 สัปดาห์)</option></select></Field><Field label="Safety stock (%)"><input name="safety" className="control" type="number" min="0" defaultValue="10" /></Field><Field label="จำนวนหน่วยต่อกล่อง" wide><input name="pack" className="control" type="number" min="1" defaultValue="1" /></Field></FormPanel><InfoPanel title="ผลการคำนวณ"><div className="result-grid"><div><span>ต้องใช้ตามช่วง</span><strong>{calc.ready ? number.format(calc.need) : "—"}</strong><small>หน่วย</small></div><div><span>ขาด / ควรเบิก</span><strong>{calc.ready ? number.format(calc.shortage) : "—"}</strong><small>หน่วย</small></div><div className="result-highlight"><span>สั่งเต็มกล่อง</span><strong>{calc.ready ? number.format(calc.packs) : "—"}</strong><small>{calc.ready ? `กล่อง = ${number.format(calc.order)} หน่วย` : "กล่อง"}</small></div></div><p className="formula">คำนวณจากอัตราใช้ × ระยะเวลา + Safety stock − ยอดคงเหลือ แล้วปัดขึ้นเต็มกล่อง</p></InfoPanel></section>}

      {activeTab === "history" && <section className="tab-content"><article className="panel history-panel"><div className="panel-heading"><div><h2>ประวัติรายการล่าสุด</h2><p>บันทึกการเคลื่อนไหวสินค้าในระบบ</p></div><span className="item-count">วันนี้</span></div><div className="empty-history"><span><Icon path="M4 12a8 8 0 1 0 2.3-5.7L4 8.5M4 4v4.5h4.5M12 8v5l3 2" /></span><h3>ยังไม่มีรายการใหม่</h3><p>รายการรับเข้า โอน หรือตัดใช้จะแสดงที่นี่</p></div></article></section>}
    </main>
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>
}

function Stat({ tone, label, value, note, path, warning = false }: { tone: string; label: string; value: string; note: string; path: string; warning?: boolean }) { return <article className={`stat-card ${warning ? "warning-card" : ""}`}><span className={`stat-icon ${tone}`}><Icon path={path} /></span><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article> }
function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) { return <label className={`form-field ${wide ? "wide" : ""}`}><span>{label}</span>{children}</label> }
function FormPanel({ title, subtitle, children, action, tone, onSubmit }: { title: string; subtitle: string; children: ReactNode; action: string; tone: string; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) { return <article className="panel form-panel"><div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div><form className="form-grid" onSubmit={onSubmit}>{children}<button className={`submit-button ${tone}`} type="submit">{action}<Icon path="M5 12h14m-5-5 5 5-5 5" /></button></form></article> }
function InfoPanel({ title, children }: { title: string; children: ReactNode }) { return <aside className="panel info-panel"><div className="panel-heading"><div><h2>{title}</h2></div></div><div className="info-content">{children}</div></aside> }
function InfoNote({ children }: { children: ReactNode }) { return <div className="info-note"><Icon path="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />{children}</div> }
