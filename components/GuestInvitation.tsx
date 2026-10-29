"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { CalendarPlus, Check, CheckCircle2, Clock, Copy, Download, Info, Loader2, MapPin, Minus, Music, Navigation, Phone, Plus, Quote, VolumeX } from "lucide-react";
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
  guestbook: Array<{ message: string }>;
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
    phone: string;
    pastDeadline: boolean;
    calendarUrl: string;
    photoUrl: string;
    musicUrl: string;
  };
};

const statusOptions = [["ATTENDING", "Sẽ tham dự"], ["DECLINED", "Không thể tham dự"], ["MAYBE", "Chưa chắc chắn"]] as const;
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";
const focusRingDark = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy";

// The bundled portrait is imported statically so Next can size it and generate a blur placeholder;
// a custom GRADUATE_PHOTO_URL still works, external hosts are served as-is.
function photoSource(url: string): { src: StaticImageData | string; external: boolean } {
  if (url === "/graduate-photo.webp") return { src: graduatePhoto, external: false };
  return { src: url, external: /^https?:\/\//.test(url) };
}

function smoothBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

// Zalo/Messenger webviews sometimes block the async Clipboard API; fall back to a hidden textarea.
async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through */ }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  return ok;
}

function Laurels() {
  return <svg aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-4 h-20 w-[calc(100%-3rem)] text-gold/50" viewBox="0 0 300 70" fill="none">
    <path d="M25 62C18 42 21 20 45 9M30 53l-12-5m15-8-12-9m18-5-7-12M275 62c7-20 4-42-20-53m15 44 12-5m-15-8 12-9m-18-5 7-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M48 13c-7 4-9 10-9 16m-5 5c-7 2-11 7-12 13m230-34c7 4 9 10 9 16m5 5c7 2 11 7 12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>;
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return <div className="flex gap-4">
    <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent">{icon}</span>
    <div className="min-w-0"><p className="text-[13px] font-bold uppercase tracking-wider text-accent">{label}</p><div className="mt-1 text-base leading-7">{children}</div></div>
  </div>;
}

export default function GuestInvitation({ token, guest, guestbook, event }: Props) {
  const recipient = `${guest.salutation} ${guest.name}`;
  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [status, setStatus] = useState(guest.rsvp?.status || "");
  const [companions, setCompanions] = useState(Math.min(guest.rsvp?.companions || 0, guest.maxGuests));
  const [message, setMessage] = useState(guest.rsvp?.message || "");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"" | "ok" | "fail">("");
  const [rsvpInView, setRsvpInView] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const firstStatusRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rsvpRef = useRef<HTMLElement>(null);
  const photo = photoSource(event.photoUrl);
  const phoneHref = event.phone ? `tel:${event.phone.replace(/[^\d+]/g, "")}` : "";

  // Scroll reveal: only sections still below the fold are hidden, then shown as they enter the viewport.
  useEffect(() => {
    if (!opened || !cardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = Array.from(cardRef.current.querySelectorAll<HTMLElement>("[data-reveal]")).filter(el => el.getBoundingClientRect().top > window.innerHeight);
    targets.forEach(el => { el.dataset.reveal = "pending"; });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      (entry.target as HTMLElement).dataset.reveal = "shown";
      observer.unobserve(entry.target);
    }), { rootMargin: "0px 0px -10% 0px" });
    targets.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [opened]);

  // The sticky bar steps aside while the RSVP form itself is on screen.
  useEffect(() => {
    if (!opened || !rsvpRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setRsvpInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(rsvpRef.current);
    return () => observer.disconnect();
  }, [opened]);

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

  async function copyAddress() {
    setCopied(await copyText(`${event.venue}, ${event.address}`) ? "ok" : "fail");
    window.setTimeout(() => setCopied(""), 2500);
  }

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (pending) return;
    if (!status) {
      setError(`Kính mời ${recipient} chọn một trong ba lựa chọn tham dự.`);
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

  return <main className={`min-h-dvh bg-navy-deep px-3 py-3 text-cream sm:px-5 sm:py-8 ${opened ? "pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8" : ""}`}>
    <audio ref={audioRef} loop preload="none" src={event.musicUrl || undefined} aria-label="Nhạc nền lễ tốt nghiệp" />

    {!opened && <section className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-[480px] items-stretch rounded-[2rem] border border-gold/50 bg-navy p-5 shadow-2xl sm:min-h-[680px]">
      <button type="button" onClick={openInvitation} className={`relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-gold/40 px-6 py-14 text-center ${focusRingDark}`}>
        <Laurels />
        <span className="relative font-display text-xl italic text-gold">Một lời mời trân trọng</span>
        <span className="relative mx-auto mt-10 block w-full max-w-[310px] rotate-[-2deg] rounded-lg border border-gold bg-cream p-6 text-navy shadow-xl">
          <span className="block border border-gold/60 px-4 py-10">
            <span className="block font-display text-lg">Thiệp mời tốt nghiệp</span>
            <span className="mt-6 block font-display text-3xl font-semibold leading-tight">{recipient}</span>
            <span aria-hidden="true" className="mx-auto mt-5 block h-px w-20 bg-gold" />
            <span className="mt-5 block text-[13px] font-semibold uppercase tracking-[.18em] text-accent">{event.graduate}</span>
          </span>
        </span>
        <span className="relative mt-12 inline-flex min-h-12 items-center rounded-full bg-gold px-10 text-base font-bold text-navy-deep">Mở thiệp</span>
        <span className="relative mt-4 text-[13px] text-cream/75">Chạm vào thiệp để mở · nhạc nền có thể tắt</span>
      </button>
    </section>}

    {opened && <div ref={cardRef} className="mx-auto w-full max-w-[480px] animate-fade-in overflow-hidden rounded-[2rem] border border-gold/50 bg-cream text-ink shadow-2xl md:max-w-3xl lg:max-w-6xl">
      <header className="relative overflow-hidden bg-navy px-5 pb-8 pt-5 text-center text-cream md:px-12 md:pb-14 md:pt-10">
        <div className="lg:hidden"><Laurels /></div>
        <button type="button" onClick={toggleMusic} aria-label={musicOn ? "Tắt nhạc nền" : "Bật nhạc nền"} aria-pressed={musicOn} className={`absolute right-3 top-3 z-10 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-gold/60 bg-navy/80 px-3 text-sm transition hover:bg-white/10 ${focusRingDark}`}>
          {musicOn ? <Music aria-hidden="true" className="h-5 w-5" /> : <VolumeX aria-hidden="true" className="h-5 w-5" />}<span className="sr-only sm:not-sr-only">{musicOn ? "Nhạc: bật" : "Nhạc: tắt"}</span>
        </button>

        <div className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14 lg:text-left">
          <div>
            <div className="mx-auto flex h-14 w-[160px] items-center justify-center rounded-2xl border-2 border-gold bg-white px-4 py-2 shadow-[0_12px_30px_rgba(0,0,0,.24)] md:h-24 md:w-64 lg:hidden">
              <Image src="/logo.svg" alt="Logo Trường Đại học Công nghiệp TP.HCM" width={240} height={86} className="h-full w-full object-contain" priority />
            </div>
            <figure className="mx-auto mt-4 w-[min(38vw,140px)] max-[379px]:w-[120px] rotate-[-2deg] bg-white p-2.5 pb-0 shadow-[0_18px_40px_rgba(0,0,0,.35)] md:w-[260px] lg:mt-0 lg:w-full lg:max-w-[420px]">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#dce7ed]">
                {event.photoUrl ? <Image src={photo.src} alt={`Ảnh tốt nghiệp của ${event.graduate}`} fill sizes="(min-width: 1024px) 400px, (min-width: 768px) 260px, 140px" className="object-cover" placeholder={photo.external || typeof photo.src === "string" ? "empty" : "blur"} unoptimized={photo.external} priority /> : <svg aria-label="Khung ảnh chân dung tốt nghiệp" className="absolute inset-0 m-auto h-32 w-32 text-navy/50" viewBox="0 0 160 160" fill="none"><circle cx="80" cy="58" r="25" stroke="currentColor" strokeWidth="2" /><path d="M35 135c7-31 22-46 45-46s38 15 45 46M48 43l32-20 32 20-32 19-32-19Zm32 19v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M27 137h106" stroke="#c9a227" strokeWidth="2" /></svg>}
              </div>
              <figcaption className="py-1.5 text-center font-display text-[15px] italic text-navy md:py-2 md:text-base">Chặng đường mới</figcaption>
            </figure>
          </div>

          <div>
            <div className="mx-auto hidden h-24 w-64 items-center justify-center rounded-2xl border-2 border-gold bg-white px-5 py-3 shadow-[0_12px_30px_rgba(0,0,0,.24)] lg:ml-0 lg:flex">
              <Image src="/logo.svg" alt="" width={240} height={86} className="h-full w-full object-contain" />
            </div>
            <p className="mt-4 font-display text-xl italic text-gold lg:mt-10">Trân trọng kính mời</p>
            <h1 className="mt-1 font-display text-[2.125rem] font-semibold leading-[1.1] md:text-5xl lg:text-6xl">{recipient}</h1>
            <p className="mt-3 text-base text-cream/85 lg:text-lg">đến chung vui trong ngày tốt nghiệp của</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-gold md:text-4xl">{event.graduate}</h2>
            <p className="mt-2 text-[13px] text-cream/75 max-[379px]:hidden">Trường Đại học Công nghiệp TP.HCM · Khóa 20</p>
            <div className="mx-auto mt-4 grid max-w-sm gap-2 rounded-2xl border border-gold/40 bg-white/5 px-4 py-2.5 text-left lg:mx-0">
              <p className="flex gap-3 text-base leading-6"><Clock aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-gold" /><span>{event.dateLabel}</span></p>
              <p className="flex gap-3 text-base leading-6"><MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-gold" /><span>{event.venue}</span></p>
            </div>
          </div>
        </div>
      </header>

      {guest.personalNote && <section data-reveal className="px-6 py-12 md:px-16 md:py-16">
        <figure className="mx-auto max-w-3xl">
          <Quote aria-hidden="true" className="h-10 w-10 text-accent" strokeWidth={1.5} />
          <blockquote className="mt-4 border-l-2 border-accent pl-5 font-display text-[1.75rem] italic leading-[1.35] text-navy md:text-4xl md:leading-[1.3]">{guest.personalNote}</blockquote>
          <figcaption className="mt-5 pl-5 text-base font-semibold text-accent">— {event.graduate}</figcaption>
        </figure>
      </section>}

      <section data-reveal className="bg-navy px-6 py-10 text-center text-cream md:px-16 md:py-12">
        <Countdown date={event.date} graduate={event.graduate} recipient={recipient} />
      </section>

      <section data-reveal className="space-y-6 px-6 py-12 md:px-16 md:py-16">
        <h2 className="font-display text-4xl font-semibold text-navy">Thông tin ngày vui</h2>
        <div className="grid gap-6 border-y border-line py-6 md:grid-cols-3 md:gap-8">
          <DetailRow icon={<Clock className="h-5 w-5" />} label="Thời gian">{event.dateLabel}</DetailRow>
          <DetailRow icon={<MapPin className="h-5 w-5" />} label="Địa điểm">
            <p>{event.venue}</p><p className="text-ink/80">{event.address}</p>
            <button type="button" onClick={copyAddress} className={`mt-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy transition hover:border-accent ${focusRing}`}>
              {copied === "ok" ? <Check aria-hidden="true" className="h-4 w-4 text-emerald-700" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied === "ok" ? "Đã sao chép địa chỉ" : copied === "fail" ? "Không sao chép được" : "Sao chép địa chỉ"}
            </button>
            <span className="sr-only" aria-live="polite">{copied === "ok" ? "Đã sao chép địa chỉ" : ""}</span>
          </DetailRow>
          <DetailRow icon={<Info className="h-5 w-5" />} label="Lưu ý">{event.notes}</DetailRow>
        </div>
        <div className="flex flex-wrap gap-3">
          <a className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 text-base font-semibold text-cream transition hover:bg-[#164b7c] ${focusRing}`} href={event.mapsUrl} target="_blank" rel="noreferrer"><Navigation aria-hidden="true" className="h-5 w-5" />Chỉ đường</a>
          <a className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-navy px-5 text-base font-semibold text-navy transition hover:bg-white ${focusRing}`} href={event.calendarUrl} target="_blank" rel="noreferrer"><CalendarPlus aria-hidden="true" className="h-5 w-5" />Thêm vào Google Calendar</a>
          <a className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-accent underline-offset-4 hover:underline ${focusRing}`} href="/api/calendar"><Download aria-hidden="true" className="h-4 w-4" />Tải file lịch (.ics)</a>
        </div>
      </section>

      <section ref={rsvpRef} id="xac-nhan" data-reveal className="scroll-mt-4 bg-white px-6 py-12 md:px-16 md:py-16">
        <h2 className="font-display text-4xl font-semibold text-navy">Xác nhận tham dự</h2>
        {!event.pastDeadline && !sent && <p className="mt-2 text-base text-ink/80">Kính mời {recipient} phản hồi trước {event.deadlineLabel}.</p>}
        {event.pastDeadline ? <div className="mt-5 rounded-xl border border-line bg-cream p-5 text-base leading-7">Thời gian xác nhận đã khép lại. Cảm ơn {recipient} đã dành sự quan tâm cho ngày vui của {event.graduate}.</div>
        : sent ? <div role="status" className="mt-5 rounded-xl border border-emerald-700/30 bg-emerald-50 p-5 text-base leading-7 text-emerald-900">
            <p className="flex items-start gap-2 font-semibold"><CheckCircle2 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0" />Cảm ơn {recipient}! Phản hồi của {guest.salutation} đã được ghi nhận.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {status === "ATTENDING" && <a className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 text-base font-semibold text-cream ${focusRing}`} href={event.calendarUrl} target="_blank" rel="noreferrer"><CalendarPlus aria-hidden="true" className="h-5 w-5" />Thêm vào Google Calendar</a>}
              <button type="button" onClick={() => setSent(false)} className={`inline-flex min-h-11 items-center rounded-full border border-emerald-800/40 px-5 text-base font-semibold ${focusRing}`}>Sửa phản hồi</button>
            </div>
          </div>
        : <form className="mt-6 space-y-6" onSubmit={submit} noValidate>
            <fieldset>
              <legend className="text-base font-semibold">{guest.salutation} sẽ tham dự chứ?</legend>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {statusOptions.map(([value, label], index) => <label key={value} className="block cursor-pointer">
                  <input ref={index === 0 ? firstStatusRef : undefined} className="peer sr-only" type="radio" name="status" value={value} checked={status === value} onChange={() => { setStatus(value); setError(""); }} />
                  <span className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-line bg-cream/60 px-4 py-3 text-base font-semibold transition peer-checked:border-navy peer-checked:bg-navy peer-checked:text-cream peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2">
                    {label}{status === value && <Check aria-hidden="true" className="h-5 w-5 text-gold" />}
                  </span>
                </label>)}
              </div>
            </fieldset>
            {status === "ATTENDING" && guest.maxGuests > 0 && <div>
              <p className="text-base font-semibold" id="companions-label">Số người đi cùng {guest.salutation} (tối đa {guest.maxGuests})</p>
              <div className="mt-2 flex items-center gap-3" role="group" aria-labelledby="companions-label">
                <button type="button" aria-label="Bớt một người" onClick={() => setCompanions(Math.max(0, companions - 1))} disabled={companions === 0} className={`flex h-11 w-11 items-center justify-center rounded-full border border-navy text-navy transition disabled:opacity-40 ${focusRing}`}><Minus aria-hidden="true" className="h-5 w-5" /></button>
                <output aria-live="polite" className="w-8 text-center text-xl font-bold">{companions}</output>
                <button type="button" aria-label="Thêm một người" onClick={() => setCompanions(Math.min(guest.maxGuests, companions + 1))} disabled={companions >= guest.maxGuests} className={`flex h-11 w-11 items-center justify-center rounded-full border border-navy text-navy transition disabled:opacity-40 ${focusRing}`}><Plus aria-hidden="true" className="h-5 w-5" /></button>
              </div>
            </div>}
            <div>
              <label className="block text-base font-semibold" htmlFor="message">Lời chúc gửi {event.graduate} <span className="font-normal text-muted">(không bắt buộc)</span></label>
              <textarea id="message" className="mt-2 block min-h-28 w-full rounded-xl border border-line bg-white p-3 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20" maxLength={500} value={message} onChange={e => setMessage(e.target.value)} placeholder="Một lời chúc nhỏ cũng làm ngày vui thêm trọn vẹn..." aria-describedby="message-count" />
              <p id="message-count" className="mt-1 text-right text-[13px] text-muted">{message.length}/500</p>
            </div>
            {error && <p role="alert" className="rounded-xl border border-red-700/30 bg-red-50 px-4 py-3 text-base text-red-800">{error}</p>}
            <button className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-base font-bold text-cream transition hover:bg-[#164b7c] disabled:cursor-wait disabled:opacity-70 ${focusRing}`} type="submit" disabled={pending} aria-busy={pending}>
              {pending && <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />}
              {pending ? "Đang gửi..." : guest.rsvp ? "Cập nhật phản hồi" : "Gửi xác nhận"}
            </button>
          </form>}
      </section>

      {guestbook.length > 0 && <section data-reveal className="px-6 py-12 md:px-16 md:py-16">
        <h2 className="font-display text-4xl font-semibold text-navy">Sổ lưu bút</h2>
        <p className="mt-2 text-base text-ink/80">Những lời chúc gửi đến {event.graduate}.</p>
        <ul className="mt-6 flex snap-x gap-3 overflow-x-auto pb-3">
          {guestbook.map((item, index) => <li key={index} className="min-w-[240px] max-w-[300px] shrink-0 snap-start rounded-2xl border border-line bg-white p-5 shadow-sm md:min-w-[280px]">
            <Quote aria-hidden="true" className="h-5 w-5 text-accent" />
            <p className="mt-2 font-display text-xl italic leading-8 text-navy">{item.message}</p>
          </li>)}
        </ul>
      </section>}

      <footer className="border-t border-line px-6 py-12 text-center md:py-16">
        <p className="text-base text-ink/80">Thân mến,</p>
        <p className="mt-2 font-display text-4xl italic text-navy">{event.graduate}</p>
      </footer>
    </div>}

    {opened && <nav aria-label="Thao tác nhanh" className={`fixed inset-x-0 bottom-0 z-40 border-t border-gold/40 bg-navy/95 px-3 pt-2 backdrop-blur transition-transform duration-300 md:hidden ${rsvpInView ? "translate-y-full" : "translate-y-0"}`} style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }} aria-hidden={rsvpInView}>
      <div className="mx-auto flex max-w-[480px] items-stretch gap-2">
        <button type="button" tabIndex={rsvpInView ? -1 : 0} onClick={() => rsvpRef.current?.scrollIntoView({ behavior: smoothBehavior(), block: "start" })} className={`inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-gold px-4 text-base font-bold text-navy-deep ${focusRingDark}`}>
          {event.pastDeadline || sent || guest.rsvp ? "Xem phản hồi" : "Xác nhận tham dự"}
        </button>
        <a tabIndex={rsvpInView ? -1 : 0} href={event.mapsUrl} target="_blank" rel="noreferrer" className={`inline-flex min-h-12 min-w-14 flex-col items-center justify-center rounded-xl px-2 text-[13px] text-cream ${focusRingDark}`}><Navigation aria-hidden="true" className="h-5 w-5 text-gold" />Chỉ đường</a>
        {phoneHref && <a tabIndex={rsvpInView ? -1 : 0} href={phoneHref} className={`inline-flex min-h-12 min-w-14 flex-col items-center justify-center rounded-xl px-2 text-[13px] text-cream ${focusRingDark}`}><Phone aria-hidden="true" className="h-5 w-5 text-gold" />Gọi</a>}
      </div>
    </nav>}
  </main>;
}
