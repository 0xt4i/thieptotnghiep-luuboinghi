import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { calendarUrl, event, formatDate, isPastDeadline } from "@/lib/event";
import GuestInvitation from "@/components/GuestInvitation";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { token: string } }) { const guest = await db.guest.findUnique({ where: { token: params.token }, select: { name: true } }); return { title: guest ? `Thiệp mời gửi ${guest.name} | ${event.graduate}` : "Thiệp mời tốt nghiệp", description: `Lời mời tham dự ${event.name}` }; }
export default async function InvitationPage({ params }: { params: { token: string } }) {
  const guest = await db.guest.findUnique({ where: { token: params.token }, include: { rsvp: true } });
  if (!guest) return <main className="min-h-screen flex items-center justify-center p-6"><section className="paper max-w-md rounded-3xl p-8 text-center"><div className="text-5xl">✉️</div><h1 className="mt-5 font-display text-3xl text-navy">Thiệp mời không khả dụng</h1><p className="mt-3 text-slate-600">Liên kết này không đúng hoặc đã được thay đổi. Vui lòng liên hệ người gửi để nhận link mới.</p></section></main>;
  return <GuestInvitation guest={{ name: guest.name, salutation: guest.salutation, maxGuests: guest.maxGuests, personalNote: guest.personalNote, rsvp: guest.rsvp }} token={params.token} event={{ ...event, dateLabel: formatDate(event.date), deadlineLabel: formatDate(event.deadline), pastDeadline: isPastDeadline(), calendarUrl: calendarUrl() }} />;
}
