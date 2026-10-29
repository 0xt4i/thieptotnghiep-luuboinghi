"use client";

import { useState } from "react";

export default function AdminTools() {
  const [message, setMessage] = useState("");
  async function importCsv(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const response = await fetch("/api/admin/import", { method: "POST", body: new FormData(form) });
    const result = await response.json();
    setMessage(response.ok ? `Đã nhập ${result.count} khách. Hãy tải lại trang.` : result.error);
    if (response.ok) form.reset();
  }
  return <section className="paper mt-6 rounded-2xl p-6"><h2 className="font-display text-2xl text-navy">Nhập danh sách khách</h2><p className="mt-2 text-sm text-slate-600">CSV cần có cột: name, salutation, group, contact, max_guests, personal_note. Khách trùng contact sẽ được cập nhật và giữ nguyên link cũ.</p><form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={importCsv}><label className="text-sm font-semibold">File CSV<input className="mt-2 block max-w-full rounded-xl border border-slate-300 p-2 font-normal" type="file" name="file" accept=".csv,text/csv" required /></label><button className="rounded-full bg-gold px-5 py-3 font-semibold text-navy" type="submit">Nhập CSV</button></form>{message && <p className="mt-3 text-sm text-navy">{message}</p>}</section>;
}
