"use client";

import { useState } from "react";

export default function AdminTools() {
  const [message, setMessage] = useState("");
  const [addMessage, setAddMessage] = useState("");
  async function importCsv(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const response = await fetch("/api/admin/import", { method: "POST", body: new FormData(form) });
    const result = await response.json();
    setMessage(response.ok ? `Đã nhập ${result.count} khách. Đang tải lại danh sách...` : result.error);
    if (response.ok) {
      form.reset();
      window.setTimeout(() => window.location.reload(), 500);
    }
  }
  async function addGuest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const response = await fetch("/api/admin/guests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: fields.get("name"),
        salutation: fields.get("salutation"),
        group: fields.get("group"),
        contact: fields.get("contact"),
        personalNote: fields.get("personalNote"),
      }),
    });
    const result = await response.json();
    setAddMessage(response.ok ? "Đã thêm khách mời. Đang tải lại danh sách..." : result.error);
    if (response.ok) {
      form.reset();
      window.setTimeout(() => window.location.reload(), 500);
    }
  }
  return <section className="paper mt-6 rounded-2xl p-6"><h2 className="font-display text-2xl text-navy">Thêm khách mời</h2><p className="mt-2 text-sm text-slate-600">Thêm trực tiếp trên web, không cần chỉnh file CSV.</p><form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={addGuest}><label className="text-sm font-semibold">Tên khách<input className="mt-2 block w-full rounded-xl border border-slate-300 p-2 font-normal" name="name" required /></label><label className="text-sm font-semibold">Danh xưng<input className="mt-2 block w-full rounded-xl border border-slate-300 p-2 font-normal" name="salutation" placeholder="Anh, Chị, Cô..." required /></label><label className="text-sm font-semibold">Nhóm<select className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-2 font-normal" name="group" defaultValue="Khác"><option>Gia đình</option><option>Bạn bè</option><option>Khác</option></select></label><label className="text-sm font-semibold">Liên hệ<input className="mt-2 block w-full rounded-xl border border-slate-300 p-2 font-normal" name="contact" /></label><label className="text-sm font-semibold sm:col-span-2">Lời nhắn riêng<textarea className="mt-2 block min-h-20 w-full rounded-xl border border-slate-300 p-2 font-normal" name="personalNote" /></label><button className="w-fit rounded-full bg-gold px-5 py-3 font-semibold text-navy" type="submit">Thêm khách</button></form>{addMessage && <p className="mt-3 text-sm text-navy">{addMessage}</p>}<hr className="my-6 border-slate-200" /><h3 className="font-display text-xl text-navy">Nhập danh sách bằng CSV</h3><p className="mt-2 text-sm text-slate-600">CSV cần có cột: Tên,Xưng hô,Nhóm,Liên hệ,Lời nhắn. Nhóm chỉ dùng: Gia đình, Bạn bè, Khác.</p><form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={importCsv}><label className="text-sm font-semibold">File CSV<input className="mt-2 block max-w-full rounded-xl border border-slate-300 p-2 font-normal" type="file" name="file" accept=".csv,text/csv" required /></label><button className="rounded-full bg-gold px-5 py-3 font-semibold text-navy" type="submit">Nhập CSV</button></form>{message && <p className="mt-3 text-sm text-navy">{message}</p>}</section>;
}
