import { NextResponse } from "next/server";
import { icsContent } from "@/lib/event";
export function GET() { return new NextResponse(icsContent(), { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": 'attachment; filename="le-tot-nghiep.ics"' } }); }
