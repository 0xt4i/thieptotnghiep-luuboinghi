"use client";

import { useState } from "react";

export function DeleteGuestButton({ guestId, guestName }: { guestId: string; guestName: string }) {
  const [busy, setBusy] = useState(false);
  async function remove() {
    if (!window.confirm(`Xóa khách "${guestName}" và RSVP của khách này?`)) return;
    setBusy(true);
    const response = await fetch("/api/admin/guests", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ guestId }) });
    if (!response.ok) window.alert("Không thể xóa khách. Vui lòng thử lại.");
    else window.location.reload();
    setBusy(false);
  }
  return <button className="rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 disabled:opacity-50" disabled={busy} onClick={remove} type="button">{busy ? "Đang xóa..." : "Xóa"}</button>;
}

export function DeleteAllGuestsButton({ count }: { count: number }) {
  const [busy, setBusy] = useState(false);
  async function removeAll() {
    if (!window.confirm(`XÓA TOÀN BỘ ${count} khách và RSVP? Link cũ sẽ không còn dùng được. Không thể hoàn tác.`)) return;
    if (window.prompt('Nhập "XOA TAT CA" để xác nhận:') !== "XOA TAT CA") return;
    setBusy(true);
    const response = await fetch("/api/admin/guests", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ deleteAll: true }) });
    if (!response.ok) window.alert("Không thể dọn dữ liệu. Vui lòng thử lại.");
    else window.location.reload();
    setBusy(false);
  }
  return <button className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50" disabled={busy || count === 0} onClick={removeAll} type="button">{busy ? "Đang dọn..." : "Dọn toàn bộ dữ liệu"}</button>;
}
