"use client";

import { useState } from "react";
import { Check, Phone } from "lucide-react";

type Guest = {
  id: string;
  name: string;
  salutation: string;
  group: string;
  contact: string | null;
  personalNote: string | null;
  checkedIn: boolean;
  rsvp: { companions: number } | null;
};

export default function AttendingGuestTable({ guests, missingContact = false }: { guests: Guest[]; missingContact?: boolean }) {
  const [values, setValues] = useState(() => new Map(guests.map(guest => [guest.id, guest.checkedIn])));
  const [saving, setSaving] = useState<string | null>(null);
  const [contactValues, setContactValues] = useState(() => new Map(guests.map(guest => [guest.id, guest.contact || ""])));

  async function toggle(guest: Guest) {
    const checkedIn = !values.get(guest.id);
    setSaving(guest.id);
    try {
      const response = await fetch("/api/admin/guests", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestId: guest.id, checkedIn }),
      });
      if (!response.ok) return;
      setValues(current => new Map(current).set(guest.id, checkedIn));
    } finally {
      setSaving(null);
    }

  }

  async function saveContact(guest: Guest) {
    const contact = contactValues.get(guest.id)?.trim() || "";
    if (!contact) return;
    setSaving(guest.id);
    try {
      const response = await fetch("/api/admin/guests", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestId: guest.id, name: guest.name, salutation: guest.salutation, group: guest.group, contact, personalNote: guest.personalNote || "" }),
      });
      if (!response.ok) return;
      window.location.reload();
    } finally {
      setSaving(null);
    }
  }

  return <section className="paper mt-6 overflow-hidden rounded-2xl border border-emerald-200">
    <div className={`border-b px-5 py-4 ${missingContact ? "border-amber-100 bg-amber-50/70" : "border-emerald-100 bg-emerald-50/70"}`}>
      <h2 className="font-display text-2xl text-navy">{missingContact ? "Khách tham dự chưa có liên hệ" : "Danh sách khách tham dự"}</h2>
      <p className="mt-1 text-sm text-slate-600">{missingContact ? "Liên hệ để bổ sung số điện thoại trước khi đón khách." : "Chỉ hiển thị khách đã xác nhận tham dự và có thông tin liên hệ."}</p>
    </div>
    {guests.length === 0 ? <p className="px-5 py-6 text-sm text-slate-600">Hiện chưa có khách nào cần bổ sung số điện thoại.</p> : <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-navy text-white"><tr><th className="px-5 py-3">Khách mời</th><th className="px-5 py-3">Nhóm</th><th className="px-5 py-3">Liên hệ</th><th className="px-5 py-3 text-center">Đã đón</th><th className="px-5 py-3">Gọi</th></tr></thead>
        <tbody>{guests.map(guest => {
          const checkedIn = values.get(guest.id) === true;
          return <tr className={`border-b border-slate-100 last:border-0 ${checkedIn ? "bg-emerald-50/60" : ""}`} key={guest.id}>
            <td className="px-5 py-4 font-semibold">{guest.salutation} {guest.name}{guest.rsvp?.companions ? <span className="ml-2 text-xs font-normal text-slate-500">+{guest.rsvp.companions}</span> : null}</td>
            <td className="px-5 py-4">{guest.group}</td>
            <td className="px-5 py-4">{missingContact ? <div className="flex flex-wrap gap-2"><input className="w-44 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm" value={contactValues.get(guest.id) || ""} onChange={event => setContactValues(current => new Map(current).set(guest.id, event.target.value))} placeholder="Nhập số điện thoại" /><button type="button" onClick={() => saveContact(guest)} disabled={saving === guest.id} className="rounded-full bg-gold px-3 py-2 text-xs font-semibold text-navy disabled:opacity-50">Lưu</button></div> : guest.contact}</td>
            <td className="px-5 py-4 text-center"><button type="button" onClick={() => toggle(guest)} disabled={saving === guest.id} aria-label={`${checkedIn ? "Bỏ đánh dấu" : "Đánh dấu"} ${guest.name} đã đón`} aria-pressed={checkedIn} className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${checkedIn ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white text-transparent hover:border-emerald-500"} disabled:opacity-50`}><Check aria-hidden="true" className="h-5 w-5" /></button></td>
            <td className="px-5 py-4">{guest.contact ? <a href={`tel:${guest.contact.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 font-semibold text-navy"><Phone aria-hidden="true" className="h-4 w-4" />Gọi</a> : <span className="text-xs text-slate-400">Chưa có số</span>}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>}
  </section>;
}
