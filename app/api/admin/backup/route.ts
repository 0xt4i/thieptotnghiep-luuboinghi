import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

type Backup = {
  version: 1;
  exportedAt: string;
  guests: Array<{
    id: string;
    token: string;
    name: string;
    salutation: string;
    group: string;
    contact: string | null;
    personalNote: string | null;
    checkedIn: boolean;
    messageSent: boolean;
    createdAt: string;
    rsvp: {
      id: string;
      status: string;
      companions: number;
      message: string | null;
      createdAt: string;
      updatedAt: string;
    } | null;
  }>;
  eventSchedule: {
    id: number;
    familyTime: string | null;
    familyEnd: string | null;
    friendsTime: string | null;
    friendsEnd: string | null;
    otherTime: string | null;
    otherEnd: string | null;
  } | null;
  eventContacts: Array<{ id: string; name: string; phone: string; sortOrder: number; createdAt: string }>;
  eventSetting: { id: number; deadline: string } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function date(value: unknown, field: string) {
  if (typeof value !== "string" || Number.isNaN(new Date(value).getTime())) {
    throw new Error(`${field} không hợp lệ.`);
  }
  return new Date(value);
}

function parseBackup(value: unknown): Backup {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.guests) ||
      !Array.isArray(value.eventContacts) ||
      (value.eventSchedule !== null && !isRecord(value.eventSchedule)) ||
      (value.eventSetting !== null && !isRecord(value.eventSetting))) {
    throw new Error("File backup không đúng định dạng.");
  }
  return value as unknown as Backup;
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [guests, eventSchedule, eventContacts, eventSetting] = await Promise.all([
    db.guest.findMany({ include: { rsvp: true }, orderBy: { createdAt: "asc" } }),
    db.eventSchedule.findUnique({ where: { id: 1 } }),
    db.eventContact.findMany({ orderBy: { sortOrder: "asc" } }),
    db.eventSetting.findUnique({ where: { id: 1 } }),
  ]);
  const backup: Backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    guests: guests.map(({ rsvp, ...guest }) => ({
      ...guest,
      createdAt: guest.createdAt.toISOString(),
      rsvp: rsvp ? { ...rsvp, createdAt: rsvp.createdAt.toISOString(), updatedAt: rsvp.updatedAt.toISOString() } : null,
    })),
    eventSchedule,
    eventContacts: eventContacts.map(contact => ({ ...contact, createdAt: contact.createdAt.toISOString() })),
    eventSetting,
  };
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="backup-thiep-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

export async function POST(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Vui lòng chọn file backup JSON." }, { status: 400 });

  try {
    const backup = parseBackup(JSON.parse(await file.text()));
    await db.$transaction(async tx => {
      await tx.rsvp.deleteMany();
      await tx.guest.deleteMany();
      await tx.eventContact.deleteMany();
      await tx.eventSchedule.deleteMany();
      await tx.eventSetting.deleteMany();

      for (const guest of backup.guests) {
        if (!guest.id || !guest.token || !guest.name || typeof guest.checkedIn !== "boolean" || typeof guest.messageSent !== "boolean") {
          throw new Error("Dữ liệu khách trong file backup không hợp lệ.");
        }
        await tx.guest.create({
          data: {
            id: guest.id,
            token: guest.token,
            name: guest.name,
            salutation: guest.salutation,
            group: guest.group,
            contact: guest.contact,
            personalNote: guest.personalNote,
            checkedIn: guest.checkedIn,
            messageSent: guest.messageSent,
            createdAt: date(guest.createdAt, "createdAt"),
            rsvp: guest.rsvp ? {
              create: {
                id: guest.rsvp.id,
                status: guest.rsvp.status,
                companions: guest.rsvp.companions,
                message: guest.rsvp.message,
                createdAt: date(guest.rsvp.createdAt, "rsvp.createdAt"),
                updatedAt: date(guest.rsvp.updatedAt, "rsvp.updatedAt"),
              },
            } : undefined,
          },
        });
      }
      if (backup.eventSchedule) await tx.eventSchedule.create({ data: backup.eventSchedule });
      if (backup.eventSetting) await tx.eventSetting.create({ data: backup.eventSetting });
      for (const contact of backup.eventContacts) {
        await tx.eventContact.create({ data: { ...contact, createdAt: date(contact.createdAt, "contact.createdAt") } });
      }
    });
    return NextResponse.json({ ok: true, count: backup.guests.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể phục hồi backup.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
