export const event = {
  name: process.env.EVENT_NAME || "Lễ tốt nghiệp của Lưu Bội Nghi",
  graduate: process.env.GRADUATE_NAME || "Lưu Bội Nghi",
  date: process.env.EVENT_DATE || "2026-10-31T08:00:00+07:00",
  venue: process.env.EVENT_VENUE || "Trường Đại học Công nghiệp TP.HCM",
  address: process.env.EVENT_ADDRESS || "12 Nguyễn Văn Bảo, phường 4, quận Gò Vấp, TP. Hồ Chí Minh",
  mapsUrl: process.env.EVENT_MAPS_URL || "https://maps.google.com/?q=Trường+Đại+học+Công+nghiệp+TP.HCM",
  deadline: process.env.RSVP_DEADLINE || "2026-10-30T23:59:59+07:00",
  notes: process.env.EVENT_NOTES || "Trang phục lịch sự; vui lòng đến trước 15 phút để chụp ảnh lưu niệm.",
  phone: process.env.GRADUATE_PHONE || "03989898989",
  photoUrl: process.env.GRADUATE_PHOTO_URL || "",
  musicUrl: process.env.GRADUATION_MUSIC_URL || "/graduation-music.mp3",
};
export function formatDate(value: string | Date) { return new Intl.DateTimeFormat("vi-VN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(value)); }
export function isPastDeadline() { return Date.now() > new Date(event.deadline).getTime(); }
export function calendarUrl() { const start = new Date(event.date); const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${f(start)}/${f(end)}&location=${encodeURIComponent(event.address)}&details=${encodeURIComponent(event.notes)}`; }
export function icsContent() { const start = new Date(event.date); const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART:${f(start)}\r\nDTEND:${f(end)}\r\nSUMMARY:${event.name}\r\nLOCATION:${event.address}\r\nDESCRIPTION:${event.notes}\r\nEND:VEVENT\r\nEND:VCALENDAR`; }
