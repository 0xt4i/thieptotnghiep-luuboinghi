"use client";

import { useState } from "react";

type Props = {
  token: string;
  guest: {
    name: string;
    salutation: string;
    maxGuests: number;
    personalNote: string | null;
    rsvp: { status: string; companions: number; message: string | null } | null;
  };
  event: {
    name: string;
    graduate: string;
    dateLabel: string;
    deadlineLabel: string;
    venue: string;
    address: string;
    mapsUrl: string;
    notes: string;
    pastDeadline: boolean;
    calendarUrl: string;
    photoUrl: string;
  };
};

export default function GuestInvitation({ token, guest, event }: Props) {
  const [status, setStatus] = useState(guest.rsvp?.status || "ATTENDING");
  const [companions, setCompanions] = useState(guest.rsvp?.companions || 0);
  const [message, setMessage] = useState(guest.rsvp?.message || "");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError("");
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, status, companions: status === "ATTENDING" ? companions : 0, message, honeypot: "" }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Không thể gửi phản hồi.");
    else setSent(true);
  }

  return (
    <main className="min-h-screen bg-[#eaf7ff] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0788df] via-[#35bdf2] to-[#e8f9ff] px-5 pb-8 pt-7 text-center shadow-xl sm:px-12">
          <div className="pointer-events-none absolute -right-10 top-12 h-36 w-36 rounded-full bg-white/25 blur-2xl" />
          <div className="pointer-events-none absolute -left-12 bottom-24 h-40 w-40 rounded-full border-[18px] border-white/20" />
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[10px] font-bold tracking-[.25em] text-white/90 sm:gap-6 sm:text-xs">
            <span className="text-left">HAPPY</span>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white p-2 shadow-[0_8px_24px_rgba(7,95,157,.3)] sm:h-24 sm:w-24 sm:p-2.5">
              <img className="h-full w-full object-contain" src="/logo.svg" alt="Logo Trường Đại học Công nghiệp TP.HCM" />
            </div>
            <span className="text-right">GRADUATION</span>
          </div>
          <p className="relative mt-7 text-base font-bold uppercase tracking-[.22em] text-white sm:mt-8 sm:text-lg">Trân trọng kính mời</p>
          <div className="relative mx-auto mt-5 max-w-md rotate-[-1deg] rounded-[1.5rem] border-[10px] border-white bg-white/90 p-2 shadow-2xl">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1rem] bg-gradient-to-br from-[#bdeaff] via-white to-[#70cff5]">
              {event.photoUrl ? <img className="h-full w-full object-cover" src={event.photoUrl} alt={`Ảnh tốt nghiệp của ${event.graduate}`} /> : <div className="text-center text-[#0788df]"><div className="text-6xl">🎓</div><p className="mt-2 text-sm font-bold">Ảnh chân dung tốt nghiệp</p><p className="text-xs text-slate-500">Sẽ cập nhật sau</p></div>}
              <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0788df] shadow">Graduation day</span>
            </div>
          </div>
          <h1 className="relative mt-6 font-display text-3xl font-bold leading-tight text-white sm:text-5xl">{guest.salutation} {guest.name}</h1>
          <p className="relative mt-3 text-lg font-semibold text-white/95">đến chung vui trong ngày tốt nghiệp của</p>
          <h2 className="relative mt-1 font-display text-3xl font-bold text-white sm:text-4xl">{event.graduate}</h2>
          <div className="relative mx-auto mt-5 h-1 w-20 rounded-full bg-white/80" />
          {guest.personalNote && <p className="relative mx-auto mt-5 max-w-lg rounded-2xl bg-white/80 px-5 py-3 italic text-[#12618c]">“{guest.personalNote}”</p>}
        </header>

        <section className="paper mt-5 rounded-3xl border-[#9cdef8] p-6 sm:p-8">
          <h2 className="font-display text-2xl text-[#075f9d]">Ngày vui của chúng mình</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold text-[#0788df]">Thời gian</dt><dd className="mt-1">{event.dateLabel}</dd></div>
            <div><dt className="font-semibold text-[#0788df]">Địa điểm</dt><dd className="mt-1">{event.venue}<br />{event.address}</dd></div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="rounded-full bg-[#087dcc] px-4 py-2 text-sm font-semibold text-white" href={event.mapsUrl} target="_blank" rel="noreferrer">Mở Google Maps</a>
            <a className="rounded-full border border-[#087dcc] px-4 py-2 text-sm font-semibold text-[#075f9d]" href="/api/calendar">Thêm vào lịch (.ics)</a>
            <a className="rounded-full border border-[#087dcc] px-4 py-2 text-sm font-semibold text-[#075f9d]" href={event.calendarUrl} target="_blank" rel="noreferrer">Google Calendar</a>
          </div>
          <p className="mt-6 rounded-xl bg-[#e7f7ff] p-4 text-sm text-[#24516b]">{event.notes}</p>
        </section>

        <section className="paper mt-5 rounded-3xl border-[#9cdef8] p-6 sm:p-8">
          <h2 className="font-display text-2xl text-[#075f9d]">Xác nhận tham dự</h2>
          <p className="mt-2 text-sm text-slate-600">Vui lòng phản hồi trước {event.deadlineLabel}.</p>
          {sent ? <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-emerald-800">Cảm ơn {guest.name}! Phản hồi của bạn đã được ghi nhận.</div> : <form className="mt-6 space-y-5" onSubmit={submit}>
            <fieldset disabled={event.pastDeadline} className="space-y-3">
              <legend className="mb-2 text-sm font-semibold">Bạn sẽ tham dự?</legend>
              {[["ATTENDING", "Sẽ tham dự"], ["DECLINED", "Không thể tham dự"], ["MAYBE", "Chưa chắc chắn"]].map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-3"><input type="radio" name="status" value={value} checked={status === value} onChange={() => setStatus(value)} />{label}</label>)}
              {status === "ATTENDING" && <label className="block text-sm font-semibold">Số người đi kèm (tối đa {guest.maxGuests})<input className="mt-2 block w-full rounded-xl border border-slate-300 p-3 font-normal" type="number" min="0" max={guest.maxGuests} value={companions} onChange={e => setCompanions(Number(e.target.value))} /></label>}
              <label className="block text-sm font-semibold">Lời chúc gửi {event.graduate}<textarea className="mt-2 block min-h-28 w-full rounded-xl border border-slate-300 p-3 font-normal" maxLength={500} value={message} onChange={e => setMessage(e.target.value)} placeholder="Một lời chúc nhỏ cũng làm ngày vui thêm trọn vẹn..." /><span className="font-normal text-slate-500">{message.length}/500</span></label>
            </fieldset>
            {event.pastDeadline ? <p className="rounded-xl bg-slate-100 p-4 text-sm">Đã quá hạn xác nhận, biểu mẫu hiện chỉ để xem.</p> : <button className="w-full rounded-full bg-[#087dcc] px-5 py-3 font-bold text-white hover:bg-[#075f9d]" type="submit">{guest.rsvp ? "Cập nhật phản hồi" : "Gửi xác nhận"}</button>}
            {error && <p className="text-sm text-red-700">{error}</p>}
          </form>}
        </section>
        <footer className="py-8 text-center text-sm text-[#39708f]">Thân mến, {event.graduate} · {event.name}</footer>
      </div>
    </main>
  );
}
