import { NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/auth";
export async function POST(request: Request) { const body = await request.json().catch(() => null); if (!process.env.ADMIN_PASSWORD || body?.password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); setAdminCookie(); return NextResponse.json({ ok: true }); }
