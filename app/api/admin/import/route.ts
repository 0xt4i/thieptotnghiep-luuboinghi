import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { parseGuestsCsv } from "@/lib/csv";

export async function POST(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Vui lòng chọn file CSV." }, { status: 400 });
  try {
    const guests = parseGuestsCsv(await file.text());
    for (const guest of guests) {
      const existing = guest.contact
        ? await db.guest.findFirst({ where: { contact: guest.contact, name: guest.name } })
        : null;
      if (existing) {
        await db.guest.update({ where: { id: existing.id }, data: guest });
      } else {
        await db.guest.create({ data: { ...guest, token: crypto.randomBytes(12).toString("base64url") } });
      }
    }
    return NextResponse.json({ ok: true, count: guests.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể nhập CSV.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
