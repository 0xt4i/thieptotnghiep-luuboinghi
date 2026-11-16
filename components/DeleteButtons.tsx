"use client";

import { useState } from "react";

function OperationOverlay({ label }: { label: string }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-6" role="status" aria-live="polite" aria-label={label}><div className="rounded-2xl bg-white px-8 py-7 text-center shadow-2xl"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-gold" /><p className="mt-4 text-lg font-bold text-navy">{label}</p><p className="mt-1 text-sm text-slate-600">Vui lòng chờ, không thao tác trên trang.</p></div></div>;
}

export function DeleteGuestButton({ guestId, guestName }: { guestId: string; guestName: string }) {
  const [busy, setBusy] = useState(false);
  async function remove() {
    if (!window.confirm(`Xóa khách "${guestName}" và RSVP của khách này?`)) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/guests", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ guestId }) });
      if (!response.ok) window.alert("Không thể xóa khách. Vui lòng thử lại.");
      else window.location.reload();
    } catch {
      window.alert("Không thể xóa khách. Vui lòng thử lại.");
    }
    setBusy(false);
  }
  return <>{busy && <OperationOverlay label="Đang xóa khách..." />}<button className="rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 disabled:opacity-50" disabled={busy} onClick={remove} type="button">{busy ? "Đang xóa..." : "Xóa"}</button></>;
}

export function DeleteAllGuestsButton({ count }: { count: number }) {
  const [busy, setBusy] = useState(false);
  async function removeAll() {
    if (!window.confirm(`XÓA TOÀN BỘ ${count} khách và RSVP? Link cũ sẽ không còn dùng được. Không thể hoàn tác.`)) return;
    if (window.prompt('Nhập "XOA TAT CA" để xác nhận:') !== "XOA TAT CA") return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/guests", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ deleteAll: true }) });
      if (!response.ok) window.alert("Không thể dọn dữ liệu. Vui lòng thử lại.");
      else window.location.reload();
    } catch {
      window.alert("Không thể dọn dữ liệu. Vui lòng thử lại.");
    }
    setBusy(false);
  }

  return <>{busy && <OperationOverlay label="Đang xóa toàn bộ dữ liệu..." />}<button className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50" disabled={busy || count === 0} onClick={removeAll} type="button">{busy ? "Đang dọn..." : "Dọn toàn bộ dữ liệu"}</button></>;
}

export function EditGuestButton({ guest }: { guest: { id: string; name: string; salutation: string; group: string; contact: string | null; personalNote: string | null } }) {
  const [busy, setBusy] = useState(false);
  async function edit() {
    const name = window.prompt("Tên khách", guest.name);
    if (name === null) return;
    const salutation = window.prompt("Danh xưng", guest.salutation);
    if (salutation === null) return;
    const group = window.prompt("Nhóm", guest.group);
    if (group === null) return;
    const contact = window.prompt("Liên hệ", guest.contact || "");
    if (contact === null) return;
    const personalNote = window.prompt("Lời nhắn riêng", guest.personalNote || "");
    if (personalNote === null) return;
    setBusy(true);
    const response = await fetch("/api/admin/guests", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ guestId: guest.id, name, salutation, group, contact, personalNote }),
    });
    if (!response.ok) window.alert("Không thể cập nhật khách. Vui lòng thử lại.");
    else window.location.reload();
    setBusy(false);
  }
  return <button className="rounded-lg border border-blue-300 px-2 py-1 text-xs font-semibold text-blue-700 disabled:opacity-50" disabled={busy} onClick={edit} type="button">{busy ? "Đang lưu..." : "Sửa"}</button>;
}
