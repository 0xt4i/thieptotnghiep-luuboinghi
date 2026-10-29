import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import fs from "fs";
import path from "path";
const db = new PrismaClient();
function parse(line: string) { const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || []; return values.map(v=>v.replace(/^"|"$/g,"").trim()); }
async function main() { const csv = fs.readFileSync(path.join(process.cwd(),"prisma","sample-guests.csv"),"utf8").trim().split(/\r?\n/).slice(1); for (const line of csv) { const [name,salutation,group,contact,maxGuests,personalNote] = parse(line); const existing = contact ? await db.guest.findFirst({ where: { contact } }) : null; if (existing) await db.guest.update({ where: { id: existing.id }, data: { name,salutation,group,maxGuests:Number(maxGuests),personalNote:personalNote||null } }); else await db.guest.create({data:{token:crypto.randomBytes(12).toString("base64url"),name,salutation,group,contact:contact||null,maxGuests:Number(maxGuests),personalNote:personalNote||null}}); } const guests=await db.guest.findMany({orderBy:{name:"asc"}}); console.log("Invite links:"); for (const g of guests) console.log(`${g.name}: ${process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"}/i/${g.token}`); }
main().finally(()=>db.$disconnect());
