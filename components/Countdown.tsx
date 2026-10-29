"use client";

import { useEffect, useState } from "react";

const units = [["Ngày", 86400, Infinity], ["Giờ", 3600, 24], ["Phút", 60, 60], ["Giây", 1, 60]] as const;

// Time is read only after mount so server and client render the same markup.
export default function Countdown({ date, graduate, recipient }: { date: string; graduate: string; recipient: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(date).getTime();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [date]);

  if (remaining === 0) return <p className="font-display text-2xl italic text-gold">Cảm ơn {recipient} đã đến chung vui cùng {graduate}.</p>;

  const seconds = remaining === null ? null : Math.floor(remaining / 1000);
  return <>
    <p className="font-display text-xl italic text-gold">Hẹn gặp {recipient} vào ngày vui</p>
    <div className="mx-auto mt-5 grid max-w-md grid-cols-4 gap-2" role="timer" aria-label="Thời gian còn lại đến ngày lễ">
      {units.map(([label, size, wrap]) => <div key={label} className="rounded-xl border border-gold/40 px-1 py-3">
        <strong className="block font-display text-3xl font-semibold tabular-nums text-gold">{seconds === null ? "--" : String(Math.floor(seconds / size) % wrap).padStart(2, "0")}</strong>
        <span className="text-[13px] text-cream/80">{label}</span>
      </div>)}
    </div>
  </>;
}
