import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

const fields = ["familyTime", "familyEnd", "friendsTime", "friendsEnd", "otherTime", "otherEnd"] as const;

export async function PATCH(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || fields.some(field => body[field] !== null && typeof body[field] !== "string")) {
    return NextResponse.json({ error: "Thời gian không hợp lệ." }, { status: 400 });
  }
  const values = Object.fromEntries(fields.map(field => [field, typeof body[field] === "string" && body[field] ? body[field] : null]));
  const schedule = await db.eventSchedule.upsert({ where: { id: 1 }, create: { id: 1, ...values }, update: values });
  return NextResponse.json({ ok: true, schedule });
}
