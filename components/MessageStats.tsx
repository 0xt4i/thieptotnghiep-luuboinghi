"use client";

import { useEffect, useState } from "react";

export default function MessageStats({ total, sent }: { total: number; sent: number }) {
  const [sentCount, setSentCount] = useState(sent);

  useEffect(() => {
    function update(event: Event) {
      const { delta } = (event as CustomEvent<{ delta: number }>).detail;
      setSentCount(current => current + delta);
    }

    window.addEventListener("guest-message-status", update);
    return () => window.removeEventListener("guest-message-status", update);
  }, []);

  return <div className="border-t border-slate-100 px-4 py-4"><p className="text-sm font-semibold text-navy">Thống kê tin nhắn</p><div className="mt-3 grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200"><p className="text-xs text-slate-600">Tổng khách</p><p className="text-xl font-bold text-navy">{total}</p></div><div className="rounded-xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100"><p className="text-xs text-slate-600">Đã gửi</p><p className="text-xl font-bold text-emerald-700">{sentCount}</p></div><div className="rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100"><p className="text-xs text-slate-600">Chưa gửi</p><p className="text-xl font-bold text-amber-700">{total - sentCount}</p></div></div></div>;
}
