"use client";

import { useState } from "react";
import CopyButtons from "@/components/CopyButtons";
import { DeleteGuestButton } from "@/components/DeleteButtons";

type Guest = {
  id: string;
  name: string;
  salutation: string;
  group: string;
  contact: string | null;
  personalNote: string | null;
  rsvp: { status: string; message: string | null; updatedAt: Date } | null;
};

export default function GuestRow({ guest, link, qr, index }: { guest: Guest; link: string; qr: string; index: number }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/guests", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        guestId: guest.id,
        name: form.get("name"),
        salutation: form.get("salutation"),
        group: form.get("group"),
        contact: form.get("contact"),
        personalNote: form.get("personalNote"),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error || "Không thể cập nhật khách.");
      setBusy(false);
      return;
    }
    window.location.reload();
  }

  return <>
    <tr className={`border-b border-slate-100 align-top ${guest.salutation === "Chưa bổ sung" || (guest.rsvp?.status === "ATTENDING" && !guest.contact) ? "bg-red-50" : ""}`}>
      <td className="px-4 py-4 text-center font-semibold text-slate-500">{index + 1}</td>
      <td className="px-4 py-4 font-semibold">{guest.salutation} {guest.name}<div className="mt-1 text-xs font-normal text-slate-500">{guest.contact || "Chưa có liên hệ"}</div></td>
      <td className="px-4 py-4">{guest.group}</td>
      <td className="px-4 py-4">{guest.rsvp?.status === "ATTENDING" ? "Sẽ tham dự" : guest.rsvp?.status === "DECLINED" ? "Không tham dự" : guest.rsvp?.status === "MAYBE" ? "Chưa chắc chắn" : "Chưa phản hồi"}</td>
      <td className="max-w-xs px-4 py-4">{guest.rsvp?.message || "—"}{guest.rsvp?.updatedAt && <div className="mt-1 text-xs text-slate-400">{new Date(guest.rsvp.updatedAt).toLocaleString("vi-VN")}</div>}</td>
      <td className="px-4 py-4"><img src={qr} alt={`QR ${guest.name}`} /><a className="break-all text-xs text-blue-700" href={link}>{link}</a><div className="mt-2 flex flex-wrap gap-1"><CopyButtons link={link} name={guest.name} salutation={guest.salutation} /><button className="rounded-lg border border-blue-300 px-2 py-1 text-xs font-semibold text-blue-700" onClick={() => setEditing(value => !value)} type="button">{editing ? "Đóng sửa" : "Sửa trực tiếp"}</button><DeleteGuestButton guestId={guest.id} guestName={`${guest.salutation} ${guest.name}`} /></div></td>
    </tr>
    {editing && <tr className="border-b border-slate-100 bg-blue-50/40">
      <td className="px-4 py-4" colSpan={6}>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={save}>
          <label className="text-xs font-semibold text-slate-700">Tên khách<input className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal" name="name" defaultValue={guest.name} required /></label>
          <label className="text-xs font-semibold text-slate-700">Danh xưng<input className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal" name="salutation" defaultValue={guest.salutation} /></label>
          <label className="text-xs font-semibold text-slate-700">Nhóm<select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal" name="group" defaultValue={guest.group === "Gia đình" || guest.group === "Bạn bè" || guest.group === "Khác" ? guest.group : "Khác"}><option>Gia đình</option><option>Bạn bè</option><option>Khác</option></select></label>
          <label className="text-xs font-semibold text-slate-700">Liên hệ<input className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal" name="contact" defaultValue={guest.contact || ""} /></label>
          <label className="text-xs font-semibold text-slate-700 md:col-span-2">Lời nhắn riêng<textarea className="mt-1 block min-h-20 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal" name="personalNote" defaultValue={guest.personalNote || ""} /></label>
          <div className="flex items-center gap-2 md:col-span-2"><button className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={busy} type="submit">{busy ? "Đang lưu..." : "Lưu thay đổi"}</button><button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" onClick={() => setEditing(false)} type="button">Hủy</button>{error && <p className="text-sm text-red-700" role="alert">{error}</p>}</div>
        </form>
      </td>
    </tr>}
  </>;
}
