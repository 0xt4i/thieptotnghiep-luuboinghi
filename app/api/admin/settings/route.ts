import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function PATCH(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.deadline !== "string" || Number.isNaN(new Date(body.deadline).getTime())) {
    return NextResponse.json({ error: "Hạn phản hồi không hợp lệ." }, { status: 400 });
  }
  const setting = await db.eventSetting.upsert({ where: { id: 1 }, create: { id: 1, deadline: body.deadline }, update: { deadline: body.deadline } });
  return NextResponse.json({ ok: true, setting });
}
