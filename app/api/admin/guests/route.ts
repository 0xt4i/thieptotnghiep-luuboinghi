import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { guestSchema, personalNoteSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.checkedIn === "boolean" && typeof body?.guestId === "string") {
    const guest = await db.guest.update({ where: { id: body.guestId }, data: { checkedIn: body.checkedIn }, select: { id: true, checkedIn: true } });
    return NextResponse.json({ ok: true, guest });
  }
  const parsed = guestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Vui lòng nhập đủ tên, danh xưng và nhóm khách." }, { status: 400 });

  const guest = await db.guest.create({
    data: {
      token: crypto.randomBytes(12).toString("base64url"),
      name: parsed.data.name,
      salutation: parsed.data.salutation,
      group: parsed.data.group,
      contact: parsed.data.contact || null,
      personalNote: parsed.data.personalNote || null,
    },
  });
  return NextResponse.json({ ok: true, id: guest.id });
}

export async function PATCH(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (body?.applyToAll === true) {
    const note = personalNoteSchema.safeParse(body.personalNote);
    if (!note.success) return NextResponse.json({ error: "Lời nhắn không hợp lệ." }, { status: 400 });
    const result = await db.guest.updateMany({ data: { personalNote: note.data || null } });
    return NextResponse.json({ ok: true, count: result.count });
  }
  const guestId = typeof body?.guestId === "string" ? body.guestId : "";
  const parsed = guestSchema.safeParse(body);
  if (!guestId || !parsed.success) return NextResponse.json({ error: "Thông tin khách chưa hợp lệ." }, { status: 400 });
  const guest = await db.guest.update({
    where: { id: guestId },
    data: {
      name: parsed.data.name,
      salutation: parsed.data.salutation,
      group: parsed.data.group,
      contact: parsed.data.contact || null,
      personalNote: parsed.data.personalNote || null,
    },
  });
  return NextResponse.json({ ok: true, id: guest.id });
}

export async function DELETE(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const guestId = typeof body?.guestId === "string" ? body.guestId : "";
  const deleteAll = body?.deleteAll === true;

  if (!guestId && !deleteAll) return NextResponse.json({ error: "Thiếu khách cần xóa." }, { status: 400 });
  if (deleteAll) {
    const result = await db.guest.deleteMany();
    return NextResponse.json({ ok: true, count: result.count });
  }

  const guest = await db.guest.findUnique({ where: { id: guestId }, select: { id: true } });
  if (!guest) return NextResponse.json({ error: "Không tìm thấy khách." }, { status: 404 });
  await db.guest.delete({ where: { id: guestId } });
  return NextResponse.json({ ok: true, count: 1 });
}
