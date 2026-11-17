"use client";

import { useState } from "react";

export default function CopyButtons({ link, name, salutation, disabled = false }: { link: string; name: string; salutation: string; disabled?: boolean }) {
  const [copied, setCopied] = useState("");
  const invitation = `Thân mời ${salutation} ${name} đến dự lễ tốt nghiệp của Ngiluu nhé! Vui lòng xác nhận tham dự tại: ${link}`;
  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1500);
  }
  return <div className="flex flex-wrap gap-1"><button className="inline-flex h-8 items-center rounded-lg border border-navy px-2 text-xs font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled} onClick={() => copy(link, "link")} type="button">{copied === "link" ? "Đã copy" : "Copy link"}</button><button className="inline-flex h-8 items-center rounded-lg border border-gold px-2 text-xs font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled} onClick={() => copy(invitation, "message")} type="button">{copied === "message" ? "Đã copy" : "Copy tin nhắn"}</button></div>;
}
