import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Guest, Rsvp } from "@prisma/client";
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const rows: Array<Guest & { rsvp: Rsvp | null }> = await db.guest.findMany({ include: { rsvp: true }, orderBy: { name: "asc" } }); const head = "name,group,status,companions,message,responded_at,invite_link"; const lines = rows.map((g: Guest & { rsvp: Rsvp | null }) => [g.name,g.group,g.rsvp?.status || "CHUA_PHAN_HOI",g.rsvp?.companions || 0,g.rsvp?.message || "",g.rsvp?.updatedAt?.toISOString() || "",`${process.env.NEXT_PUBLIC_SITE_URL || ""}/i/${g.token}`].map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")); const csv = "\ufeff" + [head,...lines].join("\r\n"); return new NextResponse(csv,{headers:{"content-type":"text/csv; charset=utf-8","content-disposition":'attachment; filename="rsvp.csv"'}}); }
