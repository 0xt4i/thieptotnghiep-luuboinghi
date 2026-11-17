"use client";

import { useState } from "react";

type Schedule = { familyTime: string; familyEnd: string; friendsTime: string; friendsEnd: string; otherTime: string; otherEnd: string };
type Contact = { name: string; phone: string };

export default function AdminTools({ schedule, contacts, deadline }: { schedule: Schedule; contacts: Contact[]; deadline: string }) {
  const [message, setMessage] = useState("");
  const [addMessage, setAddMessage] = useState("");
  const [importing, setImporting] = useState(false);
  const [sharedNote, setSharedNote] = useState("");
  const [updatingNotes, setUpdatingNotes] = useState(false);
  const [scheduleValues, setScheduleValues] = useState(schedule);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [contactValues, setContactValues] = useState(contacts);
  const [savingContacts, setSavingContacts] = useState(false);
  const [deadlineValue, setDeadlineValue] = useState(deadline.slice(0, 16));
  const [savingDeadline, setSavingDeadline] = useState(false);
  async function importCsv(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (importing) return;
    const form = event.currentTarget;
    setImporting(true);
    setMessage("Đang nhận file và nhập danh sách khách...");
    try {
      const response = await fetch("/api/admin/import", { method: "POST", body: new FormData(form) });
      const result = await response.json();
      setMessage(response.ok ? `Đã nhập ${result.count} khách. Đang tải lại danh sách...` : result.error);
      if (response.ok) {
        form.reset();
        window.setTimeout(() => window.location.reload(), 500);
      } else {
        setImporting(false);
      }
    } catch {
      setMessage("Không thể nhập CSV. Vui lòng thử lại.");
      setImporting(false);
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
  async function applySharedNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm("Lời nhắn này sẽ ghi đè lời nhắn riêng của tất cả khách. Bạn có muốn tiếp tục không?")) return;
    setUpdatingNotes(true);
    try {
      const response = await fetch("/api/admin/guests", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ applyToAll: true, personalNote: sharedNote }) });
      const result = await response.json();
      if (!response.ok) {
        window.alert(result.error || "Không thể cập nhật lời nhắn.");
        setUpdatingNotes(false);
        return;
      }
      window.location.reload();
    } catch {
      window.alert("Không thể cập nhật lời nhắn. Vui lòng thử lại.");
      setUpdatingNotes(false);
    }
  }
  async function saveSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSchedule(true);
    try {
      const response = await fetch("/api/admin/schedule", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(scheduleValues) });
      const result = await response.json();
      if (!response.ok) {
        window.alert(result.error || "Không thể lưu thời gian.");
        return;
      }
      window.location.reload();
    } catch {
      window.alert("Không thể lưu thời gian. Vui lòng thử lại.");
    } finally {
      setSavingSchedule(false);
    }
  }
  async function saveContacts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingContacts(true);
    try {
      const response = await fetch("/api/admin/contacts", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ contacts: contactValues }) });
      const result = await response.json();
      if (!response.ok) {
        window.alert(result.error || "Không thể lưu liên hệ.");
        return;
      }
      window.location.reload();
    } catch {
      window.alert("Không thể lưu liên hệ. Vui lòng thử lại.");
    } finally {
      setSavingContacts(false);
    }
  }
  async function saveDeadline(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingDeadline(true);
    try {
      const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ deadline: `${deadlineValue}:00+07:00` }) });
      const result = await response.json();
      if (!response.ok) { window.alert(result.error || "Không thể lưu hạn phản hồi."); return; }
      window.location.reload();
    } catch { window.alert("Không thể lưu hạn phản hồi. Vui lòng thử lại."); } finally { setSavingDeadline(false); }
  }
  const busy = importing || updatingNotes || savingSchedule || savingContacts || savingDeadline;
  const scheduleGroups = [{ label: "Gia đình", start: "familyTime", end: "familyEnd" }, { label: "Bạn bè", start: "friendsTime", end: "friendsEnd" }, { label: "Khác", start: "otherTime", end: "otherEnd" }] as const;
  const deadlineForm = <section className="paper mt-6 rounded-2xl border border-gold/30 p-6"><div className="mb-4 flex items-center gap-3"><span className="h-8 w-1 rounded-full bg-gold" /><h2 className="font-display text-2xl text-navy">Hạn phản hồi</h2></div><p className="text-sm text-slate-600">Thời hạn dùng chung cho tất cả khách mời.</p><form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={saveDeadline}><label className="text-sm font-semibold">Ngày và giờ<input className="mt-2 block rounded-xl border border-slate-300 p-2 font-normal" type="datetime-local" value={deadlineValue} onChange={event => setDeadlineValue(event.target.value)} disabled={busy} required /></label><button className="rounded-full bg-gold px-5 py-2 font-semibold text-navy" type="submit" disabled={busy}>{savingDeadline ? "Đang lưu..." : "Lưu hạn phản hồi"}</button></form></section>;
  return <>{deadlineForm}<section className="admin-tools paper mt-6 rounded-2xl border border-slate-200 p-6"><div className="mb-5 flex items-center gap-3"><span className="h-8 w-1 rounded-full bg-gold" /><h2 className="font-display text-2xl text-navy">Thêm khách mời</h2></div><p className="mt-2 text-sm text-slate-600">Thêm trực tiếp trên web, không cần chỉnh file CSV.</p><form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={addGuest}><label className="text-sm font-semibold">Tên khách<input className="mt-2 block w-full rounded-xl border border-slate-300 p-2 font-normal" name="name" required /></label><label className="text-sm font-semibold">Danh xưng<input className="mt-2 block w-full rounded-xl border border-slate-300 p-2 font-normal" name="salutation" placeholder="Anh, Chị, Cô..." /></label><label className="text-sm font-semibold">Nhóm<select className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-2 font-normal" name="group" defaultValue="Khác"><option>Gia đình</option><option>Bạn bè</option><option>Khác</option></select></label><label className="text-sm font-semibold">Liên hệ<input className="mt-2 block w-full rounded-xl border border-slate-300 p-2 font-normal" name="contact" /></label><label className="text-sm font-semibold sm:col-span-2">Lời nhắn riêng<textarea className="mt-2 block min-h-20 w-full rounded-xl border border-slate-300 p-2 font-normal" name="personalNote" /></label><button className="w-fit rounded-full bg-gold px-5 py-3 font-semibold text-navy" type="submit" disabled={busy}>Thêm khách</button></form>{addMessage && <p className="mt-3 text-sm text-navy">{addMessage}</p>}<hr className="my-6 border-slate-200" /><h3 className="font-display text-xl text-navy">Thời gian theo nhóm</h3><p className="mt-2 text-sm text-slate-600">Mỗi khách sẽ thấy khoảng thời gian tương ứng với nhóm của mình.</p><form className="mt-3 grid gap-3 sm:grid-cols-3" onSubmit={saveSchedule}>{scheduleGroups.map(group => <fieldset className="rounded-xl border border-slate-200 p-3" key={group.start}><legend className="px-1 text-sm font-semibold">{group.label}</legend><label className="block text-xs text-slate-600">Bắt đầu<input className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-sm font-normal" type="datetime-local" value={scheduleValues[group.start]} onChange={event => setScheduleValues({ ...scheduleValues, [group.start]: event.target.value })} disabled={busy} /></label><label className="mt-2 block text-xs text-slate-600">Kết thúc<input className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-sm font-normal" type="datetime-local" value={scheduleValues[group.end]} onChange={event => setScheduleValues({ ...scheduleValues, [group.end]: event.target.value })} disabled={busy} /></label></fieldset>)}<button className="w-fit rounded-full bg-gold px-5 py-2 font-semibold text-navy sm:col-span-3" type="submit" disabled={busy}>{savingSchedule ? "Đang lưu..." : "Lưu thời gian"}</button></form>  <hr className="my-6 border-slate-200" /><h3 className="font-display text-xl text-navy">Liên hệ hiển thị trên thiệp</h3><p className="mt-2 text-sm text-slate-600">Admin có thể thêm, chỉnh sửa hoặc xóa số liên hệ.</p><form className="mt-3 space-y-3" onSubmit={saveContacts}>{contactValues.map((contact, index) => <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" key={`${index}-${contact.name}`}><input className="rounded-xl border border-slate-300 p-2" value={contact.name} onChange={event => setContactValues(values => values.map((value, itemIndex) => itemIndex === index ? { ...value, name: event.target.value } : value))} placeholder="Tên liên hệ" disabled={busy} /><input className="rounded-xl border border-slate-300 p-2" value={contact.phone} onChange={event => setContactValues(values => values.map((value, itemIndex) => itemIndex === index ? { ...value, phone: event.target.value } : value))} placeholder="Số điện thoại" disabled={busy} /><button className="rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-700" type="button" onClick={() => setContactValues(values => values.filter((_, itemIndex) => itemIndex !== index))} disabled={busy}>Xóa</button></div>)}<div className="flex flex-wrap gap-2"><button className="rounded-full border border-navy px-4 py-2 font-semibold text-navy" type="button" onClick={() => setContactValues(values => [...values, { name: "", phone: "" }])} disabled={busy || contactValues.length >= 10}>Thêm liên hệ</button><button className="rounded-full bg-gold px-5 py-2 font-semibold text-navy disabled:opacity-60" type="submit" disabled={busy}>{savingContacts ? "Đang lưu..." : "Lưu liên hệ"}</button></div></form><hr className="my-6 border-slate-200" /><h3 className="font-display text-xl text-navy">Lời nhắn chung cho tất cả khách</h3><p className="mt-2 text-sm text-slate-600">Nội dung này sẽ ghi đè lời nhắn riêng của toàn bộ khách mời.</p><form className="mt-3 space-y-3" onSubmit={applySharedNote}><textarea className="block min-h-20 w-full rounded-xl border border-slate-300 p-2" maxLength={500} value={sharedNote} onChange={event => setSharedNote(event.target.value)} placeholder="Nhập lời nhắn dùng chung..." disabled={busy} /><button className="rounded-full border border-navy px-5 py-2 font-semibold text-navy disabled:opacity-60" type="submit" disabled={busy}>{updatingNotes ? "Đang cập nhật..." : "Áp dụng cho tất cả"}</button></form><hr className="my-6 border-slate-200" /><h3 className="font-display text-xl text-navy">Nhập danh sách bằng CSV</h3><p className="mt-2 text-sm text-slate-600">CSV cần có cột: Tên,Xưng hô,Nhóm,Liên hệ,Lời nhắn. Nhóm chỉ dùng: Gia đình, Bạn bè, Khác.</p><form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={importCsv}><label className="text-sm font-semibold">File CSV<input className="mt-2 block max-w-full rounded-xl border border-slate-300 p-2 font-normal" type="file" name="file" accept=".csv,text/csv" required disabled={busy} /></label><button className="rounded-full bg-gold px-5 py-3 font-semibold text-navy disabled:cursor-wait disabled:opacity-60" type="submit" disabled={busy}>{importing ? "Đang nhập..." : "Nhập CSV"}</button></form>{message && <p className="mt-3 text-sm text-navy">{message}</p>}</section>{busy && <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-6" role="status" aria-live="polite" aria-label={importing ? "Đang nhập CSV" : "Đang cập nhật lời nhắn"}><div className="rounded-2xl bg-white px-8 py-7 text-center shadow-2xl"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-gold" /><p className="mt-4 text-lg font-bold text-navy">{importing ? "Đang nhập danh sách..." : "Đang cập nhật lời nhắn..."}</p><p className="mt-1 text-sm text-slate-600">Vui lòng chờ, không thao tác trên trang.</p></div></div>}</>;
}
