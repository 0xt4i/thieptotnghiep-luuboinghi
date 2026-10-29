import { Resend } from "resend";
import { event, formatDate } from "./event";
export async function notifyOwner(guest: { name: string; group: string }, rsvp: { status: string; companions: number; message: string | null }, edited: boolean) {
  const label = { ATTENDING: "Sẽ tham dự", DECLINED: "Không thể tham dự", MAYBE: "Chưa chắc chắn" }[rsvp.status] || rsvp.status;
  const body = `【${edited ? "ĐÃ SỬA" : "MỚI"}】 ${guest.name} (${guest.group})\nLựa chọn: ${label}\nĐi kèm: ${rsvp.companions}\nLời chúc: ${rsvp.message || "(không có)"}\nThời gian: ${formatDate(new Date())}`;
  const jobs: Promise<unknown>[] = [];
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) jobs.push(fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: `${event.name}\n${body}` }) }));
  if (process.env.RESEND_API_KEY) jobs.push(new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.NOTIFICATION_FROM || "onboarding@resend.dev", to: process.env.NOTIFICATION_TO || "", subject: `${edited ? "ĐÃ SỬA" : "MỚI"} RSVP - ${guest.name}`, text: body }));
  if (jobs.length) await Promise.allSettled(jobs);
}
