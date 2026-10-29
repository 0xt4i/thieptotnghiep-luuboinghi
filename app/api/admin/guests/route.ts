import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

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
