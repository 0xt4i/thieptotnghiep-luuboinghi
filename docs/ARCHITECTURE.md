# Kiến trúc và hướng dẫn mở rộng

Tài liệu kỹ thuật cho người sửa code: dự án được tổ chức thế nào, màu sắc và hiệu ứng nằm ở đâu, và thêm chức năng mới thì phải sửa những file nào. Cài đặt, deploy và cách dùng xem ở [README.md](../README.md).

**Công nghệ:** Next.js 14 (App Router) · TypeScript · Tailwind CSS 3 · Prisma 6 + PostgreSQL (Supabase) · deploy trên Vercel.

**Mục lục**

1. [Kiến trúc tổng quan](#kiến-trúc-tổng-quan)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [Luồng dữ liệu](#luồng-dữ-liệu)
4. [Hệ thống màu sắc và giao diện](#hệ-thống-màu-sắc-và-giao-diện)
5. [Hướng dẫn tuỳ biến thường gặp](#hướng-dẫn-tuỳ-biến-thường-gặp)
6. [Thêm chức năng mới](#thêm-chức-năng-mới)
7. [Thêm kênh thông báo](#thêm-kênh-thông-báo)
8. [Checklist trước khi deploy](#checklist-trước-khi-deploy)

| Lệnh | Việc làm |
|---|---|
| `npm run dev` | Chạy dev server |
| `npm run build` | `prisma generate` rồi build production |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm run lint` | ESLint |
| `npm run seed` | Nhập khách từ `prisma/sample-guests.csv` |

---

## Kiến trúc tổng quan

```
             ┌──────────────────────── Trình duyệt ────────────────────────┐
             │                                                             │
  Khách ───► │ /i/{token}  ──► GuestInvitation (client component)          │
             │                   ├─ bìa "Mở thiệp" + hiệu ứng mở           │
             │                   ├─ nội dung thiệp, Countdown, sổ lưu bút  │
             │                   └─ form RSVP ──► POST /api/rsvp           │
             │                                                             │
  Admin ───► │ /admin ──► LoginForm ──► POST /api/admin/login (set cookie) │
             │ /admin/dashboard ──► AdminTools, CopyButtons, DeleteButtons │
             │                        ├─► POST   /api/admin/import        │
             │                        ├─► GET    /api/admin/export        │
             │                        ├─► DELETE /api/admin/guests        │
             │                        └─► POST   /api/admin/logout        │
             └─────────────────────────────────────────────────────────────┘
                                   │
                    Server (Next.js route handlers / server components)
                                   │
           lib/event.ts (cấu hình sự kiện từ env) · lib/auth.ts (cookie HMAC)
           lib/db.ts (Prisma) ──► PostgreSQL: Guest 1─1 Rsvp
           lib/notifications.ts ──► Telegram / Resend
```

Nguyên tắc chính:

- **Server component lấy dữ liệu, client component lo tương tác.** `app/i/[token]/page.tsx` đọc DB rồi truyền props thuần (string, number) vào `components/GuestInvitation.tsx`. Client không bao giờ gọi Prisma.
- **Thông tin sự kiện không nằm trong DB** mà nằm trong `lib/event.ts`, đọc từ biến môi trường và có giá trị mặc định. Đổi ngày, giờ, địa điểm chỉ cần sửa env rồi redeploy.
- **Mọi màu sắc đi qua token Tailwind** trong `tailwind.config.ts`, trừ một vài chỗ bắt buộc dùng hex (xem [mục màu sắc](#hệ-thống-màu-sắc-và-giao-diện)).
- **Không có ID tuần tự trong link.** Token là `crypto.randomBytes(12)` dạng base64url.

## Cấu trúc thư mục

```
app/
  layout.tsx                 Font (Be Vietnam Pro, EB Garamond), metadata, themeColor
  globals.css                CSS toàn cục: .paper, keyframes hiệu ứng mở thiệp, scroll reveal, reduced-motion
  page.tsx                   Trang chủ (chỉ dẫn khách mở link riêng)
  i/[token]/
    page.tsx                 Server: tìm khách theo token, lấy sổ lưu bút, render GuestInvitation
    opengraph-image.tsx      Ảnh preview 1200×630 khi gửi link qua Zalo/Messenger
  admin/
    page.tsx                 Trang đăng nhập (đã đăng nhập thì chuyển sang dashboard)
    dashboard/page.tsx       Thống kê, bảng khách, QR, link, nhập/xuất CSV
  api/
    rsvp/route.ts            POST: validate (zod) → upsert Rsvp → gửi thông báo
    calendar/route.ts        GET: file .ics
    admin/login|logout/      Đặt / xoá cookie admin
    admin/import/route.ts    POST multipart CSV → tạo/cập nhật Guest
    admin/export/route.ts    GET CSV (UTF-8 BOM) gồm khách + RSVP + link
    admin/guests/route.ts    DELETE một khách hoặc tất cả

components/
  GuestInvitation.tsx        Toàn bộ trang thiệp: bìa, hiệu ứng mở, các section, form RSVP, thanh thao tác mobile
  Countdown.tsx              Đếm ngược đến ngày lễ
  AdminTools.tsx             Form nhập CSV
  CopyButtons.tsx            Copy link / lời mời
  DeleteButtons.tsx          Xoá khách (xác nhận 2 bước khi xoá tất cả)
  LoginForm.tsx              Form mật khẩu admin

lib/
  event.ts                   Cấu hình sự kiện + formatDate, calendarUrl, icsContent, isPastDeadline
  auth.ts                    isAdmin / setAdminCookie / clearAdminCookie (HMAC bằng SESSION_SECRET)
  db.ts                      Prisma client singleton
  csv.ts                     Parser CSV khách (bắt buộc đủ cột)
  validation.ts              Schema zod cho RSVP
  notifications.ts           Gửi Telegram / email khi có RSVP

prisma/
  schema.prisma              Model Guest, Rsvp
  migrations/                Migration SQL
  seed.ts                    Seed từ sample-guests.csv
  guests-upload-template.csv Mẫu CSV để nhập trong dashboard

public/                      logo.svg, graduate-photo.webp, graduation-music.mp3
assets/fonts/                TTF cho ảnh OG (Satori không có sẵn font tiếng Việt)
design-system/               Quy tắc thiết kế: MASTER.md (chung) + pages/invitation.md (ghi đè cho trang thiệp)
```

## Luồng dữ liệu

### Mô hình dữ liệu (`prisma/schema.prisma`)

| Model | Trường | Ghi chú |
|---|---|---|
| `Guest` | `token` (unique), `name`, `salutation`, `group`, `contact?`, `maxGuests`, `personalNote?` | Một dòng = một thiệp |
| `Rsvp` | `guestId` (unique), `status`, `companions`, `message?`, `updatedAt` | Mỗi khách tối đa một RSVP; xoá khách thì xoá RSVP theo (`onDelete: Cascade`) |

`status` là chuỗi `ATTENDING` / `DECLINED` / `MAYBE`. Danh sách hợp lệ nằm ở `lib/validation.ts`, nhãn hiển thị ở `statusOptions` trong `GuestInvitation.tsx`, trong dashboard và trong `lib/notifications.ts`.

### Khách mở thiệp

1. `app/i/[token]/page.tsx` tìm `Guest` theo token. Token sai thì hiện trang "Thiệp mời không khả dụng".
2. Lấy 30 lời chúc mới nhất làm sổ lưu bút (chỉ nội dung, không kèm tên).
3. Gộp `event` từ `lib/event.ts` với các giá trị tính sẵn (`dateLabel`, `pastDeadline`, `calendarUrl`) rồi truyền vào `GuestInvitation`.
4. Khách bấm **Mở thiệp**:
   - Thiệp xoay thẳng, bìa tách thành hai cánh và xoay mở (CSS `.door-left` / `.door-right` trong `globals.css`).
   - Trang thiệp hiện ở đúng kích thước khung bìa, từ mờ chuyển rõ, rồi phóng to ra (Web Animations API trong `useLayoutEffect` của `GuestInvitation`).
   - Nhạc nền bắt đầu phát (nếu trình duyệt cho phép).
5. Gửi RSVP: `POST /api/rsvp` với `{ token, status, companions, message, honeypot }`.

### `POST /api/rsvp`

Giới hạn tần suất theo IP (10 lần/phút, bộ nhớ trong) → tìm khách theo token → chặn nếu quá hạn → validate bằng zod → kiểm tra `companions ≤ maxGuests` → `upsert` → gửi thông báo. Lỗi thông báo chỉ được ghi log, không làm hỏng RSVP.

### Admin

- Đăng nhập: so mật khẩu với `ADMIN_PASSWORD`, đặt cookie `graduation_admin` (httpOnly, 8 giờ) chứa HMAC-SHA256 của chuỗi `"admin"`.
- Mọi route `/api/admin/*` và trang dashboard đều kiểm tra `isAdmin()` trước tiên.
- Nhập CSV: khách trùng **cả tên và contact** thì cập nhật (giữ nguyên token và link cũ), ngược lại thì tạo mới.

---

## Hệ thống màu sắc và giao diện

### Token màu (một nguồn duy nhất)

Toàn bộ bảng màu khai báo trong `tailwind.config.ts`:

| Token | Hex | Dùng cho |
|---|---|---|
| `navy` | `#0b2545` | Header, section tối, nút chính |
| `navy-deep` | `#071b33` | Nền phía sau tấm thiệp |
| `gold` | `#c9a227` | Hoạ tiết, chữ trên nền **tối** |
| `cream` | `#f8f3e8` | Nền giấy, chữ trên nền navy |
| `ink` | `#0f172a` | Chữ thân bài trên nền sáng |
| `muted` | `#64748b` | Chữ phụ |
| `line` | `#cbd5e1` | Viền, đường kẻ |
| `accent` | `#b45309` | Chữ nhấn trên nền **sáng** (gold không đủ tương phản trên cream) |

Trong component chỉ dùng tên token: `bg-navy`, `text-gold`, `border-gold/40`… Đổi hex trong `tailwind.config.ts` thì mọi chỗ dùng token đổi theo.

### Những chỗ còn hex cứng (phải sửa tay khi đổi màu)

Các chỗ này không dùng được class Tailwind, nên khi đổi bảng màu phải sửa cả ở đây:

| File | Nội dung | Lý do |
|---|---|---|
| `app/globals.css` | `body` background/color, `.paper`, `.gold-line` | CSS thuần |
| `app/layout.tsx` | `themeColor: "#0b2545"` | Màu thanh trình duyệt trên điện thoại |
| `app/i/[token]/opengraph-image.tsx` | `#0b2545`, `#f8f3e8`, `#c9a227` | Ảnh OG render bằng Satori, chỉ hiểu inline style |
| `components/GuestInvitation.tsx` | `hover:bg-[#164b7c]` (hover nút navy), `bg-[#dce7ed]` (nền khung ảnh), `stroke="#c9a227"` trong SVG placeholder, bóng `rgba(0,0,0,…)` | Màu phụ chưa có token |

Tìm nhanh mọi hex còn sót: `grep -rnE "#[0-9a-fA-F]{6}" app components lib`

Trang admin và một số chỗ dùng thẳng màu mặc định của Tailwind (`slate-*`, `amber-*`, `emerald-*`, `red-*`) cho chữ phụ, trạng thái thành công/lỗi. Những màu này không thuộc bảng màu thương hiệu nên có thể giữ nguyên.

### Quy tắc tương phản cần giữ

Chi tiết trong `design-system/thiep-tot-nghiep/MASTER.md`. Tóm tắt:

- Chữ màu `gold` chỉ đặt trên nền tối. Trên nền sáng dùng `accent`.
- Chữ thường phải đạt tỉ lệ tương phản ≥ 4.5:1 với nền. Khi đổi màu, kiểm tra từng cặp chữ/nền bằng công cụ như WebAIM Contrast Checker.
- `muted` trên `cream` chỉ dùng cho chữ lớn.

### Phông chữ

Khai báo trong `app/layout.tsx` bằng `next/font/google`, gắn vào biến CSS rồi map sang class trong `tailwind.config.ts`:

- `font-sans` → Be Vietnam Pro (`--font-be-vietnam`)
- `font-display` → EB Garamond (`--font-garamond`)

Phông thay thế bắt buộc có subset `vietnamese`.

### Hiệu ứng

| Hiệu ứng | Ở đâu | Chỉnh gì |
|---|---|---|
| Hai cánh bìa mở | `globals.css`: `.door`, `@keyframes door-left/right` | `.95s` thời lượng, `.35s` độ trễ, `110deg` góc mở |
| Trang thiệp mờ → rõ → phóng to | `GuestInvitation.tsx`, `useLayoutEffect` có `cardRef.current.animate(...)` | `duration: 2100` tổng thời gian; `offset: 0.17` lúc bắt đầu rõ dần; `offset: 0.57` lúc bắt đầu phóng to; `blur(${10 / scale}px)` độ mờ; `opacity: 0.35` độ nhạt ban đầu |
| Gỡ bìa khỏi DOM | `openInvitation()`: `setTimeout(..., 1400)` | Phải ≥ thời điểm hai cánh mở xong (0.35s + 0.95s) |
| Hiện dần khi cuộn | `[data-reveal]` trong `globals.css` + `useEffect` trong `GuestInvitation` | Thêm `data-reveal` vào section mới; độ trễ `2100` phải bằng `duration` của hiệu ứng phóng to |

Mọi hiệu ứng tự tắt khi người dùng bật *giảm chuyển động* (`prefers-reduced-motion`). Hiệu ứng mới cũng phải tôn trọng điều này.

---

## Hướng dẫn tuỳ biến thường gặp

### Đổi bảng màu

1. Sửa hex trong `tailwind.config.ts`.
2. Sửa các hex cứng liệt kê ở [bảng trên](#những-chỗ-còn-hex-cứng-phải-sửa-tay-khi-đổi-màu).
3. Cập nhật bảng màu trong `design-system/thiep-tot-nghiep/MASTER.md` cho khớp.
4. `npm run dev`, kiểm tra trang thiệp, dashboard và ảnh OG (`/i/{token}/opengraph-image`).

### Thêm một màu mới

Thêm vào `theme.extend.colors` trong `tailwind.config.ts`, ví dụ `rose: "#be123c"`, rồi dùng `text-rose`, `bg-rose/20`… Tailwind chỉ sinh class cho tên xuất hiện nguyên văn trong `app/` hoặc `components/`. Vì vậy đừng ghép tên class động kiểu `` `bg-${color}` ``.

### Cho phép đổi màu mà không cần build lại (nhiều bộ màu / chọn màu theo khách)

Hiện màu được biên dịch cố định lúc build. Muốn đổi lúc chạy (ví dụ mỗi khách một bộ màu, hoặc admin tự chọn màu), chuyển token sang **biến CSS**:

1. Khai báo biến trong `app/globals.css`, ghi dạng kênh RGB để Tailwind vẫn dùng được độ trong suốt (`/40`):

   ```css
   :root {
     --c-navy: 11 37 69;
     --c-navy-deep: 7 27 51;
     --c-gold: 201 162 39;
     --c-cream: 248 243 232;
     --c-accent: 180 83 9;
     /* ... */
   }
   [data-theme="rose"] {
     --c-navy: 76 5 25;
     --c-gold: 244 194 194;
     /* chỉ ghi các màu khác bộ mặc định */
   }
   ```

2. Trỏ token Tailwind về biến trong `tailwind.config.ts`:

   ```ts
   colors: {
     navy: { DEFAULT: "rgb(var(--c-navy) / <alpha-value>)", deep: "rgb(var(--c-navy-deep) / <alpha-value>)" },
     gold: "rgb(var(--c-gold) / <alpha-value>)",
     // ...
   }
   ```

3. Gắn `data-theme` ở nơi cần, ví dụ thẻ `<main>` trong `GuestInvitation`, hoặc truyền thẳng giá trị bằng `style={{ "--c-gold": "201 162 39" } as React.CSSProperties}`.
4. Lưu lựa chọn màu ở đâu tuỳ phạm vi:
   - **Chung cho cả sự kiện:** thêm biến env, ví dụ `EVENT_THEME`, đọc trong `lib/event.ts`.
   - **Theo từng khách:** thêm cột `theme String?` vào `Guest` (xem [thêm trường cho khách](#thêm-một-trường-cho-khách-ví-dụ-theme-hoặc-ghi-chú-riêng)).
   - **Admin chỉnh trong dashboard:** tạo model `Setting` và một route `/api/admin/settings` (xem [thêm route admin](#thêm-một-route-api-cho-admin)).
5. Các chỗ hex cứng (OG image, `themeColor`) không đọc được biến CSS. Phải truyền giá trị hex từ server vào.

### Đổi phông chữ

Trong `app/layout.tsx`, thay `Be_Vietnam_Pro` / `EB_Garamond` bằng phông khác từ `next/font/google`, giữ `subsets: ["latin", "vietnamese"]` và giữ tên `variable`. Nếu đổi phông thân bài, thay luôn các file TTF trong `assets/fonts/` và tên `fontFamily` trong `opengraph-image.tsx`.

### Đổi thông tin sự kiện, ảnh, nhạc, logo

| Muốn đổi | Cách |
|---|---|
| Tên lễ, tên người tốt nghiệp, ngày giờ, địa điểm, hạn RSVP, lưu ý, SĐT | Biến env `EVENT_*`, `GRADUATE_*`, `RSVP_DEADLINE` (giá trị mặc định nằm trong `lib/event.ts`) |
| Ảnh chân dung | Thay `public/graduate-photo.webp`, hoặc đặt `GRADUATE_PHOTO_URL` |
| Nhạc nền | Thay `public/graduation-music.mp3`, hoặc đặt `GRADUATION_MUSIC_URL` |
| Logo trường | Thay `public/logo.svg` |
| Dòng chữ cố định ("Trân trọng kính mời", "Chặng đường mới", "Khóa 20"…) | Sửa trực tiếp trong `components/GuestInvitation.tsx` |
| Tin nhắn mời khi bấm "Copy tin nhắn" trong dashboard | `components/CopyButtons.tsx` (đang ghi cứng tên "Lưu Bội Nghi", chưa đọc từ `event.graduate`) |
| Tiêu đề tab, mô tả | `metadata` trong `app/layout.tsx`, `generateMetadata` trong `app/i/[token]/page.tsx` |

Ngày giờ ghi theo ISO kèm múi giờ, ví dụ `2026-11-22T08:00:00+07:00`.

---

## Thêm chức năng mới

### Thêm một section vào thiệp

1. Thêm một `<section data-reveal className="px-6 py-12 md:px-16 md:py-16">…</section>` vào `components/GuestInvitation.tsx`, giữa `<header>` và `<footer>`. Xen kẽ nền sáng và `bg-navy` như các section hiện có.
2. Nếu cần dữ liệu từ server: thêm trường vào `Props`, lấy dữ liệu trong `app/i/[token]/page.tsx` rồi truyền vào. Chỉ truyền dữ liệu đã chuyển sang string/number, không truyền `Date` hay object Prisma.
3. Phần tương tác phức tạp (như `Countdown`) nên tách thành component riêng trong `components/`.

### Thêm một trường cho khách (ví dụ theme hoặc ghi chú riêng)

Cần đi qua đủ các lớp sau, thiếu bước nào là dữ liệu bị rơi ở bước đó:

1. **Schema:** thêm `theme String?` vào `model Guest` trong `prisma/schema.prisma`.
2. **Migration:** `npx prisma migrate dev --name add_guest_theme`, rồi commit thư mục migration mới.
3. **Nhập CSV:** thêm cột vào `parseGuestsCsv` trong `lib/csv.ts`. Nếu cột là tuỳ chọn, đừng thêm vào danh sách `required` để file CSV cũ vẫn nhập được. Cập nhật `prisma/guests-upload-template.csv`.
4. **Xuất CSV:** thêm cột vào `head` và `lines` trong `app/api/admin/export/route.ts`.
5. **Hiển thị:** thêm vào object `guest` truyền cho `GuestInvitation` trong `app/i/[token]/page.tsx` và vào kiểu `Props`.
6. **Dashboard:** thêm cột vào bảng trong `app/admin/dashboard/page.tsx` nếu muốn xem.
7. **Production:** Vercel không tự chạy migration. Chạy `npx prisma migrate deploy` với `DIRECT_URL` production **trước** khi deploy code mới.

### Thêm trường cho RSVP (ví dụ món ăn, ăn chay)

1. Thêm cột vào `model Rsvp`, tạo migration như trên.
2. Thêm trường vào `rsvpSchema` trong `lib/validation.ts`.
3. Thêm vào `create` / `update` trong `upsert` của `app/api/rsvp/route.ts`.
4. Thêm state và input vào form trong `GuestInvitation.tsx`, gửi kèm trong `fetch("/api/rsvp")`.
5. Hiển thị trong dashboard, CSV xuất ra và nội dung thông báo (`lib/notifications.ts`).

### Thêm một lựa chọn trạng thái tham dự

Cập nhật đồng thời: `z.enum` trong `lib/validation.ts`, `statusOptions` trong `GuestInvitation.tsx`, nhãn trong `app/admin/dashboard/page.tsx` và `lib/notifications.ts`. Không cần migration vì `status` là chuỗi.

### Thêm một route API cho admin

```ts
// app/api/admin/<tên>/route.ts
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  // validate body bằng zod (thêm schema vào lib/validation.ts), rồi đọc/ghi qua db
  return NextResponse.json({ ok: true });
}
```

Gọi từ một client component trong `components/`, rồi đặt component đó vào `app/admin/dashboard/page.tsx` (xem `AdminTools.tsx` làm mẫu).

**Lưu ý:** form HTML thường (`<form action=… method="post">`) điều hướng cả trang tới route đó. Trong trường hợp này route nên trả `NextResponse.redirect(url, { status: 303 })` như `logout`, không trả JSON. Nếu gọi bằng `fetch` thì trả JSON.

### Thêm một trang mới

Tạo `app/<đường-dẫn>/page.tsx`. Mặc định đó là server component. Trang cần dữ liệu luôn mới (đọc DB mỗi lần mở) thì thêm `export const dynamic = "force-dynamic"`. Trang cần bảo vệ thì gọi `if (!isAdmin()) redirect("/admin")` ở đầu, giống dashboard.

---

## Thêm kênh thông báo

`lib/notifications.ts` gom các kênh vào mảng `jobs` rồi chạy song song bằng `Promise.allSettled`, nên một kênh lỗi không ảnh hưởng kênh khác. Thêm kênh mới (Zalo, Discord, Slack…) bằng một `jobs.push(fetch(...))`, chỉ chạy khi biến env của kênh đó có giá trị, và thêm biến đó vào `.env.example`.

## Checklist trước khi deploy

- `npm run typecheck` và `npm run build` chạy không lỗi.
- Có thay đổi schema → đã chạy `prisma migrate deploy` trên production.
- Đổi màu → kiểm tra tương phản, ảnh OG, thanh trình duyệt trên điện thoại (`themeColor`).
- Thử trên màn hình rộng 360px và trong trình duyệt của Zalo/Messenger.
- Bật *giảm chuyển động* trên máy để chắc thiệp vẫn mở được và đọc được.
- Token sai vẫn hiện trang thân thiện; RSVP quá hạn bị khoá.
