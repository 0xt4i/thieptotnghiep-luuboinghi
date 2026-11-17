import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function PATCH(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.contacts) || body.contacts.length > 10 || body.contacts.some((contact: unknown) => {
    if (!contact || typeof contact !== "object") return true;
    const value = contact as { name?: unknown; phone?: unknown };
    return typeof value.name !== "string" || !value.name.trim() || typeof value.phone !== "string" || !value.phone.trim();
  })) return NextResponse.json({ error: "Danh sách liên hệ không hợp lệ." }, { status: 400 });
  const contacts: Array<{ name: string; phone: string; sortOrder: number }> = body.contacts.map((contact: { name: string; phone: string }, sortOrder: number) => ({ name: contact.name.trim().slice(0, 100), phone: contact.phone.trim().slice(0, 50), sortOrder }));
  await db.$transaction([
    db.eventContact.deleteMany(),
    ...contacts.map(contact => db.eventContact.create({ data: contact })),
  ]);
  return NextResponse.json({ ok: true });
}
