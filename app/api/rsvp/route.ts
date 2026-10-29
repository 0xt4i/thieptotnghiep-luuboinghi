import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { event, isPastDeadline } from "@/lib/event";
import { notifyOwner } from "@/lib/notifications";
import { rsvpSchema } from "@/lib/validation";
const attempts = new Map<string, { count: number; time: number }>();
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now(); const prior = attempts.get(ip);
  if (prior && now - prior.time < 60_000 && prior.count >= 10) return NextResponse.json({ error: "Thao tác quá nhanh, vui lòng thử lại sau ít phút." }, { status: 429 });
  attempts.set(ip, { count: prior && now - prior.time < 60_000 ? prior.count + 1 : 1, time: now });
  const body = await request.json().catch(() => null); const token = typeof body?.token === "string" ? body.token : "";
  const guest = await db.guest.findUnique({ where: { token } });
  if (!guest) return NextResponse.json({ error: "Liên kết thiệp không hợp lệ." }, { status: 404 });
  if (isPastDeadline()) return NextResponse.json({ error: "Đã quá hạn xác nhận tham dự." }, { status: 400 });
  const parsed = rsvpSchema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: "Thông tin RSVP chưa hợp lệ." }, { status: 400 });
  if (parsed.data.honeypot) return NextResponse.json({ ok: true });
  if (parsed.data.status !== "ATTENDING" && parsed.data.companions !== 0) return NextResponse.json({ error: "Số người đi kèm chỉ áp dụng khi tham dự." }, { status: 400 });
  if (parsed.data.companions > guest.maxGuests) return NextResponse.json({ error: `Số người đi kèm tối đa là ${guest.maxGuests}.` }, { status: 400 });
  const existing = await db.rsvp.findUnique({ where: { guestId: guest.id } });
  const rsvp = await db.rsvp.upsert({ where: { guestId: guest.id }, create: { guestId: guest.id, status: parsed.data.status, companions: parsed.data.companions, message: parsed.data.message }, update: { status: parsed.data.status, companions: parsed.data.companions, message: parsed.data.message } });
  try { await notifyOwner(guest, rsvp, Boolean(existing)); } catch (error) { console.error("Notification failed", error); }
  return NextResponse.json({ ok: true, status: rsvp.status });
}
