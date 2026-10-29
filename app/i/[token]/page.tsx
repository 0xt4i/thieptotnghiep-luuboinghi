import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { calendarUrl, event, formatDate, isPastDeadline } from "@/lib/event";
import GuestInvitation from "@/components/GuestInvitation";
import { MailX } from "lucide-react";
export const dynamic = "force-dynamic";
// Chat apps cut link previews at ~60 characters: drop the graduate's name first, then truncate.
function shareTitle(recipient: string) {
  const full = `Thiệp mời ${recipient} | ${event.graduate}`;
  if (full.length <= 60) return full;
  const short = `Thiệp mời ${recipient}`;
  return short.length <= 60 ? short : `${short.slice(0, 59).trimEnd()}…`;
}
export async function generateMetadata({ params }: { params: { token: string } }) {
  const guest = await db.guest.findUnique({ where: { token: params.token }, select: { name: true, salutation: true } });
  const title = guest ? shareTitle(`${guest.salutation} ${guest.name}`) : "Thiệp mời tốt nghiệp";
  return { title, description: guest ? `Lời mời thân gửi ${guest.salutation} ${guest.name} đến dự lễ tốt nghiệp của ${event.graduate}.` : `Lời mời tham dự ${event.name}`, openGraph: { title, description: `Lễ tốt nghiệp của ${event.graduate}`, type: "website" as const, images: [{ url: `/i/${params.token}/opengraph-image`, width: 1200, height: 630, alt: title }] } };
}
export default async function InvitationPage({ params }: { params: { token: string } }) {
  const guest = await db.guest.findUnique({ where: { token: params.token }, include: { rsvp: true } });
  if (!guest) return <main className="min-h-dvh flex items-center justify-center p-6"><section className="paper max-w-md rounded-3xl p-8 text-center"><MailX aria-hidden="true" className="mx-auto h-12 w-12 text-accent" strokeWidth={1.5} /><h1 className="mt-5 font-display text-3xl text-navy">Thiệp mời không khả dụng</h1><p className="mt-3 text-slate-600">Liên kết này không đúng hoặc đã được thay đổi. Vui lòng liên hệ người gửi để nhận link mới.</p></section></main>;
  const messages = await db.rsvp.findMany({ where: { message: { not: null } }, orderBy: { updatedAt: "desc" }, take: 30, select: { message: true, guest: { select: { name: true, salutation: true } } } });
  return <GuestInvitation guest={{ name: guest.name, salutation: guest.salutation, maxGuests: guest.maxGuests, personalNote: guest.personalNote, rsvp: guest.rsvp }} guestbook={messages.filter(item => item.message).map(item => ({ name: `${item.guest.salutation} ${item.guest.name}`, message: item.message as string }))} token={params.token} event={{ ...event, dateLabel: formatDate(event.date), deadlineLabel: formatDate(event.deadline), pastDeadline: isPastDeadline(), calendarUrl: calendarUrl() }} />;
}
