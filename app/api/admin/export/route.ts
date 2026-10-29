import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Guest, Rsvp } from "@prisma/client";
export async function GET(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows: Array<Guest & { rsvp: Rsvp | null }> = await db.guest.findMany({ include: { rsvp: true }, orderBy: { name: "asc" } });
  const requestUrl = new URL(request.url);
  const site = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
  const head = ["name", "salutation", "group", "contact", "max_guests", "personal_note", "status", "companions", "message", "created_at", "responded_at", "invite_link"].join(",");
  const lines = rows.map((g) => [
    g.name,
    g.salutation,
    g.group,
    g.contact,
    g.maxGuests,
    g.personalNote || "",
    g.rsvp?.status || "CHUA_PHAN_HOI",
    g.rsvp?.companions || 0,
    g.rsvp?.message || "",
    g.createdAt.toISOString(),
    g.rsvp?.updatedAt?.toISOString() || "",
    `${site}/i/${g.token}`,
  ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","));
  const csv = "\ufeff" + [head, ...lines].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="danh-sach-khach-moi-rsvp.csv"',
    },
  });
}
