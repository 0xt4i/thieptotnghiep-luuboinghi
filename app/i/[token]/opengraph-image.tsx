import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { event } from "@/lib/event";

export const runtime = "nodejs";
export const alt = "Thiệp mời lễ tốt nghiệp";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OpenGraphImage({ params }: { params: { token: string } }) {
  const guest = await db.guest.findUnique({ where: { token: params.token }, select: { name: true, salutation: true } });
  const recipient = guest ? `${guest.salutation} ${guest.name}` : "Quý khách";
  return new ImageResponse(
    <div style={{ background: "#0b2545", color: "#f8f3e8", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", padding: "72px 100px", position: "relative", width: "100%" }}>
      <div style={{ border: "2px solid #c9a227", display: "flex", flexDirection: "column", height: "calc(100% - 48px)", justifyContent: "center", padding: "48px", width: "calc(100% - 48px)" }}>
        <div style={{ color: "#c9a227", fontSize: 24, letterSpacing: 8, textTransform: "uppercase" }}>Thiệp mời tốt nghiệp</div>
        <div style={{ fontSize: 30, marginTop: 42 }}>Trân trọng kính mời</div>
        <div style={{ color: "#c9a227", fontSize: 68, fontWeight: 700, marginTop: 16 }}>{recipient}</div>
        <div style={{ fontSize: 28, marginTop: 24 }}>đến chung vui trong ngày tốt nghiệp của</div>
        <div style={{ fontSize: 48, marginTop: 10 }}>{event.graduate}</div>
      </div>
    </div>,
    { ...size },
  );
}
