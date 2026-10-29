"use client";

import { useEffect, useState } from "react";

const units = [["Ngày", 86400], ["Giờ", 3600], ["Phút", 60], ["Giây", 1]] as const;
const wraps: Record<string, number> = { Ngày: Infinity, Giờ: 24, Phút: 60, Giây: 60 };

// Time is read only after mount so server and client render the same markup.
export default function Countdown({ date, graduate }: { date: string; graduate: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(date).getTime();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [date]);

  if (remaining === 0) return <p className="font-display text-xl text-[#c9a227]">Cảm ơn bạn đã đến chung vui cùng {graduate}.</p>;

  const seconds = remaining === null ? null : Math.floor(remaining / 1000);
  return <>
    <p className="text-xs uppercase tracking-[.25em] text-[#c9a227]">Hẹn gặp bạn vào ngày vui</p>
    <div className="mt-5 grid grid-cols-4 gap-2" aria-label="Thời gian còn lại đến ngày lễ">
      {units.map(([label, size]) => <div key={label} className="rounded-lg border border-[#c9a227]/40 px-1 py-3">
        <strong className="block font-display text-2xl tabular-nums text-[#c9a227]">{seconds === null ? "--" : String(Math.floor(seconds / size) % wraps[label]).padStart(2, "0")}</strong>
        <span className="text-[10px] uppercase tracking-wider text-white/60">{label}</span>
      </div>)}
    </div>
  </>;
}
