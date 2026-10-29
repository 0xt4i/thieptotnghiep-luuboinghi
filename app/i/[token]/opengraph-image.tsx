import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { event } from "@/lib/event";

export const runtime = "nodejs";
export const alt = "Thiệp mời lễ tốt nghiệp";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

// Satori ships no Vietnamese glyphs, so the preview shown in Zalo/Messenger needs the font loaded explicitly.
const fontDir = join(process.cwd(), "assets", "fonts");
const fonts = Promise.all([readFile(join(fontDir, "BeVietnamPro-Regular.ttf")), readFile(join(fontDir, "BeVietnamPro-Bold.ttf"))]);

export default async function OpenGraphImage({ params }: { params: { token: string } }) {
  const [guest, [regular, bold]] = await Promise.all([db.guest.findUnique({ where: { token: params.token }, select: { name: true, salutation: true } }), fonts]);
  const recipient = guest ? `${guest.salutation} ${guest.name}` : "Quý khách";
  return new ImageResponse(
    <div style={{ background: "#0b2545", color: "#f8f3e8", display: "flex", fontFamily: "Be Vietnam Pro", height: "100%", padding: 24, width: "100%" }}>
      <div style={{ alignItems: "center", border: "2px solid #c9a227", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", padding: "40px 64px", textAlign: "center", width: "100%" }}>
        <div style={{ color: "#c9a227", fontSize: 26, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase" }}>Thiệp mời tốt nghiệp</div>
        <div style={{ fontSize: 32, marginTop: 40 }}>Trân trọng kính mời</div>
        <div style={{ color: "#c9a227", fontSize: recipient.length > 24 ? 56 : 72, fontWeight: 700, lineHeight: 1.2, marginTop: 16 }}>{recipient}</div>
        <div style={{ fontSize: 30, marginTop: 28 }}>đến chung vui trong ngày tốt nghiệp của</div>
        <div style={{ fontSize: 52, fontWeight: 700, marginTop: 12 }}>{event.graduate}</div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Be Vietnam Pro", data: regular, weight: 400, style: "normal" }, { name: "Be Vietnam Pro", data: bold, weight: 700, style: "normal" }] },
  );
}
