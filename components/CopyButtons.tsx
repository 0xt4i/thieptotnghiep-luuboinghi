"use client";

import { useState } from "react";

export default function CopyButtons({ link, name, salutation }: { link: string; name: string; salutation: string }) {
  const [copied, setCopied] = useState("");
  const invitation = `Kính mời ${salutation} ${name} đến chung vui trong lễ tốt nghiệp của Lưu Bội Nghi. Vui lòng xác nhận tham dự tại: ${link}`;
  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1500);
  }
  return <div className="mt-2 flex flex-wrap gap-2"><button className="rounded-lg border border-navy px-2 py-1 text-xs font-semibold text-navy" onClick={() => copy(link, "link")} type="button">Copy link</button><button className="rounded-lg border border-gold px-2 py-1 text-xs font-semibold text-navy" onClick={() => copy(invitation, "message")} type="button">Copy tin nhắn</button>{copied && <span className="self-center text-xs text-emerald-700">Đã copy {copied === "link" ? "link" : "tin nhắn"}</span>}</div>;
}
