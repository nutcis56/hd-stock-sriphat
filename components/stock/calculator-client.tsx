"use client";

import { FormEvent, useMemo, useState } from "react";

export default function CalculatorClient() {
  const [result, setResult] = useState<{ need: number; shortage: number; packs: number; order: number } | null>(null);
  const number = useMemo(() => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }), []);

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const current = Number(data.get("current"));
    const weekly = Number(data.get("weekly"));
    const weeks = Number(data.get("weeks"));
    const safety = Number(data.get("safety"));
    const pack = Math.max(1, Number(data.get("pack")));
    const base = weekly * weeks;
    const need = base + base * safety / 100;
    const shortage = Math.max(0, need - current);
    const packs = Math.ceil(shortage / pack);
    setResult({ need, shortage, packs, order: packs * pack });
  }

  return <section className="operation-page"><div className="content-heading"><div><span className="eyebrow">REQUISITION PLANNING</span><h2>คำนวณจำนวนเบิก</h2><p>วางแผนสำรองสำหรับ 4 หรือ 6 สัปดาห์</p></div></div><div className="two-column"><article className="panel"><div className="panel-heading"><div><h2>ข้อมูลสำหรับคำนวณ</h2></div></div><form className="form-grid" onSubmit={calculate}><label className="form-field"><span>คงเหลือศรีพัฒน์ปัจจุบัน</span><input name="current" className="control" type="number" min="0" defaultValue="30" /></label><label className="form-field"><span>ใช้เฉลี่ยต่อสัปดาห์</span><input name="weekly" className="control" type="number" min="0" defaultValue="12" /></label><label className="form-field"><span>ช่วงที่ต้องการครอบคลุม</span><select name="weeks" className="control"><option value="4">1 เดือน (4 สัปดาห์)</option><option value="6">45 วัน (6 สัปดาห์)</option></select></label><label className="form-field"><span>Safety stock (%)</span><input name="safety" className="control" type="number" min="0" defaultValue="10" /></label><label className="form-field wide"><span>จำนวนหน่วยต่อกล่อง</span><input name="pack" className="control" type="number" min="1" defaultValue="1" /></label><button className="submit-button purple" type="submit">คำนวณจำนวนที่ควรเบิก</button></form></article><article className="panel info-panel"><div className="panel-heading"><div><h2>ผลการคำนวณ</h2></div></div><div className="info-content"><div className="result-grid"><div><span>ต้องใช้ตามช่วง</span><strong>{result ? number.format(result.need) : "—"}</strong><small>หน่วย</small></div><div><span>ขาด / ควรเบิก</span><strong>{result ? number.format(result.shortage) : "—"}</strong><small>หน่วย</small></div><div className="result-highlight"><span>สั่งเต็มกล่อง</span><strong>{result ? number.format(result.packs) : "—"}</strong><small>{result ? `= ${number.format(result.order)} หน่วย` : "กล่อง"}</small></div></div></div></article></div></section>;
}
