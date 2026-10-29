"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { CalendarPlus, CheckCircle2, Clock, Info, Loader2, MapPin, Minus, Music, Plus, VolumeX } from "lucide-react";
import Countdown from "@/components/Countdown";
import graduatePhoto from "@/public/graduate-photo.webp";

type Props = {
  token: string;
  guest: {
    name: string;
    salutation: string;
    maxGuests: number;
    personalNote: string | null;
    rsvp: { status: string; companions: number; message: string | null } | null;
  };
  guestbook: Array<{ name: string; message: string }>;
  event: {
    name: string;
    graduate: string;
    date: string;
    dateLabel: string;
    deadlineLabel: string;
    venue: string;
    address: string;
    mapsUrl: string;
    notes: string;
    pastDeadline: boolean;
    calendarUrl: string;
    photoUrl: string;
    musicUrl: string;
  };
};

const statusOptions = [["ATTENDING", "Sẽ tham dự"], ["DECLINED", "Không thể tham dự"], ["MAYBE", "Chưa chắc chắn"]] as const;

// The bundled portrait is imported statically so Next can size it and generate a blur placeholder;
// a custom GRADUATE_PHOTO_URL still works, external hosts are served as-is.
function photoSource(url: string): { src: StaticImageData | string; external: boolean } {
  if (url === "/graduate-photo.webp") return { src: graduatePhoto, external: false };
  return { src: url, external: /^https?:\/\//.test(url) };
}

function LineIcon({ children }: { children: React.ReactNode }) {
  return <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent">{children}</span>;
}

function Laurels() {
  return <svg aria-hidden="true" className="absolute inset-x-7 top-4 h-20 w-[calc(100%-3.5rem)] text-[#c9a227]/60" viewBox="0 0 300 70" fill="none">
    <path d="M25 62C18 42 21 20 45 9M30 53l-12-5m15-8-12-9m18-5-7-12M275 62c7-20 4-42-20-53m15 44 12-5m-15-8 12-9m-18-5 7-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M48 13c-7 4-9 10-9 16m-5 5c-7 2-11 7-12 13m230-34c7 4 9 10 9 16m5 5c7 2 11 7 12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>;
}

export default function GuestInvitation({ token, guest, guestbook, event }: Props) {
  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [status, setStatus] = useState(guest.rsvp?.status || "");
  const [companions, setCompanions] = useState(Math.min(guest.rsvp?.companions || 0, guest.maxGuests));
  const [message, setMessage] = useState(guest.rsvp?.message || "");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const firstStatusRef = useRef<HTMLInputElement>(null);
  const photo = photoSource(event.photoUrl);

  async function openInvitation() {
    setOpened(true);
    if (audioRef.current) {
      try { await audioRef.current.play(); setMusicOn(true); } catch { setMusicOn(false); }
    }
  }

  async function toggleMusic() {
    if (!audioRef.current) return;
    if (musicOn) { audioRef.current.pause(); setMusicOn(false); }
    else { try { await audioRef.current.play(); setMusicOn(true); } catch { setMusicOn(false); } }
  }

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (pending) return;
    if (!status) {
      setError("Vui lòng chọn một trong ba lựa chọn tham dự.");
      firstStatusRef.current?.focus();
      return;
    }
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/rsvp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, status, companions: status === "ATTENDING" ? companions : 0, message, honeypot: "" }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) setError(data.error || "Không thể gửi phản hồi. Vui lòng thử lại.");
      else setSent(true);
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng kiểm tra mạng rồi gửi lại.");
    } finally {
      setPending(false);
    }
  }

  return <main className="min-h-dvh bg-[#071b33] px-3 py-3 text-[#f8f3e8] sm:px-5 sm:py-8">
    <audio ref={audioRef} loop preload="none" src={event.musicUrl || undefined} aria-label="Nhạc nền lễ tốt nghiệp" />
    {!opened && <section className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-[480px] items-center justify-center rounded-[2rem] border border-[#c9a227]/50 bg-[#0b2545] p-6 text-center shadow-2xl sm:min-h-[680px]">
      <div className="relative w-full overflow-hidden rounded-[1.5rem] border border-[#c9a227]/40 px-6 py-14">
        <Laurels />
        <p className="relative text-xs font-semibold uppercase tracking-[.35em] text-[#c9a227]">Một lời mời trân trọng</p>
        <div className="relative mx-auto mt-10 w-full max-w-[310px] rotate-[-2deg] rounded-lg border border-[#c9a227] bg-[#f8f3e8] p-6 text-[#0b2545] shadow-xl">
          <div className="border border-[#c9a227]/60 px-4 py-10"><p className="font-display text-sm uppercase tracking-[.25em]">Thiệp mời tốt nghiệp</p><p className="mt-8 font-display text-2xl">{guest.salutation} {guest.name}</p><div className="mx-auto mt-5 h-px w-20 bg-[#c9a227]" /><p className="mt-5 text-xs uppercase tracking-[.18em]">{event.graduate}</p></div>
        </div>
        <button onClick={openInvitation} className="relative mt-12 min-h-11 rounded-full border border-[#c9a227] bg-[#c9a227] px-8 py-3 text-sm font-bold text-[#071b33] transition hover:bg-[#e2c34f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8f3e8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2545]">Mở thiệp</button>
        <p className="relative mt-4 text-xs text-white/60">Chạm để mở lời mời · nhạc nền tùy chọn</p>
      </div>
    </section>}
    {opened && <div className="mx-auto w-full max-w-[480px] animate-fade-in overflow-hidden rounded-[2rem] border border-[#c9a227]/50 bg-[#f8f3e8] text-[#0b2545] shadow-2xl md:max-w-3xl lg:max-w-6xl">
      <header className="relative overflow-hidden bg-[#0b2545] px-6 pb-10 pt-8 text-center md:px-12 md:pb-14 md:pt-10">
        <Laurels />
        <button onClick={toggleMusic} aria-label={musicOn ? "Tắt nhạc nền" : "Bật nhạc nền"} aria-pressed={musicOn} className="absolute right-3 top-3 z-10 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-[#c9a227]/60 px-3 text-sm text-[#f8f3e8] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]">
          {musicOn ? <Music aria-hidden="true" className="h-5 w-5" /> : <VolumeX aria-hidden="true" className="h-5 w-5" />}<span className="sr-only sm:not-sr-only">{musicOn ? "Nhạc: bật" : "Nhạc: tắt"}</span>
        </button>
        <div className="relative mx-auto mt-5 flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#c9a227] bg-white p-3 shadow-xl"><Image src="/logo.svg" alt="Logo Trường Đại học Công nghiệp TP.HCM" width={104} height={104} className="h-full w-full object-contain" priority /></div>
        <p className="relative mt-7 text-xs font-bold uppercase tracking-[.35em] text-[#c9a227]">Trân trọng kính mời</p>
        <h1 className="relative mt-5 font-display text-4xl leading-tight text-[#f8f3e8] md:text-5xl">{guest.salutation} {guest.name}</h1>
        <p className="relative mx-auto mt-5 max-w-md text-sm leading-6 text-white/80 md:text-base">đến chung vui trong ngày tốt nghiệp của</p>
        <h2 className="relative mt-2 font-display text-3xl text-[#c9a227] md:text-4xl">{event.graduate}</h2>
        <p className="relative mt-3 text-xs uppercase tracking-[.2em] text-white/70">Trường Đại học Công nghiệp TP.HCM · Khóa 20</p>
      </header>

      <section className="relative px-5 py-10 md:px-16 md:py-14 lg:grid lg:grid-cols-[minmax(460px,1.35fr)_minmax(0,.65fr)] lg:items-center lg:gap-16 lg:px-20">
        <div className="mx-auto w-full max-w-[360px] rotate-[-2deg] border-[10px] border-white bg-white p-2 shadow-xl lg:max-w-[560px]">
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#dce7ed]">
            {event.photoUrl ? <Image src={photo.src} alt={`Ảnh tốt nghiệp của ${event.graduate}`} fill sizes="(min-width: 1024px) 540px, 340px" className="object-cover" placeholder={photo.external || typeof photo.src === "string" ? "empty" : "blur"} unoptimized={photo.external} priority /> : <svg aria-label="Khung ảnh chân dung tốt nghiệp" className="h-40 w-40 text-[#0b2545]/50" viewBox="0 0 160 160" fill="none"><circle cx="80" cy="58" r="25" stroke="currentColor" strokeWidth="2" /><path d="M35 135c7-31 22-46 45-46s38 15 45 46M48 43l32-20 32 20-32 19-32-19Zm32 19v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M27 137h106" stroke="#c9a227" strokeWidth="2" /></svg>}
          </div>
          <p className="py-2 text-center font-display text-sm italic text-[#0b2545]">A new chapter begins</p>
        </div>
        {guest.personalNote && <blockquote className="mt-12 border-l-2 border-[#c9a227] pl-5 font-display text-xl italic leading-8 text-[#0b2545] lg:mt-0 lg:text-2xl">“{guest.personalNote}”</blockquote>}
      </section>

      <section className="bg-[#0b2545] px-6 py-8 text-center text-[#f8f3e8] md:px-16 md:py-10">
        <Countdown date={event.date} graduate={event.graduate} />
      </section>

      <section className="space-y-5 px-6 py-10 md:px-16 md:py-14">
        <h2 className="font-display text-3xl md:text-4xl">Thông tin ngày vui</h2>
        <div className="grid gap-5 border-y border-[#c9a227]/40 py-6 md:grid-cols-3 md:gap-8">
          <div className="flex gap-4"><LineIcon><Clock className="h-5 w-5" /></LineIcon><div><p className="text-xs font-bold uppercase tracking-wider text-accent">Thời gian</p><p className="mt-1 text-sm leading-6">{event.dateLabel}</p></div></div>
          <div className="flex gap-4"><LineIcon><MapPin className="h-5 w-5" /></LineIcon><div><p className="text-xs font-bold uppercase tracking-wider text-accent">Địa điểm</p><p className="mt-1 text-sm leading-6">{event.venue}<br />{event.address}</p></div></div>
          <div className="flex gap-4"><LineIcon><Info className="h-5 w-5" /></LineIcon><div><p className="text-xs font-bold uppercase tracking-wider text-accent">Lưu ý</p><p className="mt-1 text-sm leading-6">{event.notes}</p></div></div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a className="inline-flex min-h-11 items-center rounded-full bg-[#0b2545] px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2" href={event.mapsUrl} target="_blank" rel="noreferrer">Mở Google Maps</a>
          <a className="inline-flex min-h-11 items-center rounded-full border border-[#0b2545] px-5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2" href="/api/calendar">Thêm vào lịch</a>
          <a className="inline-flex min-h-11 items-center rounded-full border border-[#0b2545] px-5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2" href={event.calendarUrl} target="_blank" rel="noreferrer">Google Calendar</a>
        </div>
      </section>

      <section className="bg-[#eee6d4] px-6 py-10 md:px-16 md:py-14">
        <h2 className="font-display text-3xl md:text-4xl">Xác nhận tham dự</h2>
        {event.pastDeadline ? <div className="mt-5 border border-[#c9a227]/50 bg-white/70 p-5 text-sm leading-6">Thời gian xác nhận đã khép lại. Cảm ơn bạn đã dành thời gian phản hồi cho ngày vui của {event.graduate}.</div>
        : sent ? <div role="status" className="mt-5 rounded-xl border border-emerald-700/30 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
            <p className="flex items-start gap-2 font-semibold"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />Cảm ơn {guest.name}! Phản hồi của bạn đã được ghi nhận.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {status === "ATTENDING" && <a className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0b2545] px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2" href={event.calendarUrl} target="_blank" rel="noreferrer"><CalendarPlus aria-hidden="true" className="h-5 w-5" />Thêm vào Google Calendar</a>}
              <button type="button" onClick={() => setSent(false)} className="inline-flex min-h-11 items-center rounded-full border border-emerald-800/40 px-5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">Sửa phản hồi</button>
            </div>
          </div>
        : <form className="mt-6 space-y-5" onSubmit={submit} noValidate>
            <fieldset>
              <legend className="sr-only">Lựa chọn tham dự</legend>
              <div className="grid gap-2 md:grid-cols-3">
                {statusOptions.map(([value, label], index) => <label key={value} className="block cursor-pointer">
                  <input ref={index === 0 ? firstStatusRef : undefined} className="peer sr-only" type="radio" name="status" value={value} checked={status === value} onChange={() => { setStatus(value); setError(""); }} />
                  <span className="flex min-h-12 items-center rounded-xl border border-[#0b2545]/20 bg-white/60 px-4 py-3 text-sm font-semibold transition peer-checked:border-[#c9a227] peer-checked:bg-[#0b2545] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#eee6d4]">{label}</span>
                </label>)}
              </div>
            </fieldset>
            {status === "ATTENDING" && <div>
              <p className="text-sm font-semibold" id="companions-label">Số người đi kèm (tối đa {guest.maxGuests})</p>
              <div className="mt-2 flex items-center gap-3" role="group" aria-labelledby="companions-label">
                <button type="button" aria-label="Bớt một người" onClick={() => setCompanions(Math.max(0, companions - 1))} disabled={companions === 0} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0b2545] transition disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"><Minus aria-hidden="true" className="h-5 w-5" /></button>
                <output aria-live="polite" className="w-8 text-center text-lg font-bold">{companions}</output>
                <button type="button" aria-label="Thêm một người" onClick={() => setCompanions(Math.min(guest.maxGuests, companions + 1))} disabled={companions >= guest.maxGuests} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0b2545] transition disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"><Plus aria-hidden="true" className="h-5 w-5" /></button>
              </div>
            </div>}
            <label className="block text-sm font-semibold" htmlFor="message">Lời chúc gửi {event.graduate}
              <textarea id="message" className="mt-2 block min-h-28 w-full rounded-xl border border-[#0b2545]/20 bg-white/70 p-3 text-base font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" maxLength={500} value={message} onChange={e => setMessage(e.target.value)} placeholder="Một lời chúc nhỏ cũng làm ngày vui thêm trọn vẹn..." />
              <span className="font-normal text-slate-600">{message.length}/500</span>
            </label>
            {error && <p role="alert" className="rounded-lg border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
            <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0b2545] px-5 py-3 font-bold text-white transition hover:bg-[#164b7c] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2" type="submit" disabled={pending} aria-busy={pending}>
              {pending && <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />}
              {pending ? "Đang gửi..." : guest.rsvp ? "Cập nhật phản hồi" : "Gửi xác nhận"}
            </button>
          </form>}
      </section>

      {guestbook.length > 0 && <section className="px-6 py-10 md:px-16 md:py-14"><h2 className="font-display text-3xl md:text-4xl">Sổ lưu bút</h2><div className="mt-5 flex snap-x gap-3 overflow-x-auto pb-2">{guestbook.map((item, index) => <article key={`${item.name}-${index}`} className="min-w-[220px] snap-start border border-[#c9a227]/50 bg-[#fffdf7] p-5 shadow-sm md:min-w-[280px]"><p className="font-display text-lg italic leading-7">“{item.message}”</p><p className="mt-4 text-xs font-bold uppercase tracking-wider text-accent">— {item.name}</p></article>)}</div></section>}
      <footer className="border-t border-[#c9a227]/40 px-6 py-10 text-center md:py-14"><p className="text-xs uppercase tracking-[.25em] text-accent">Thân mến</p><p className="mt-3 font-display text-3xl italic">{event.graduate}</p></footer>
    </div>}
  </main>;
}
