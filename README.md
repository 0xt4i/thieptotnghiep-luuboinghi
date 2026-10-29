# Thiệp mời tốt nghiệp - Lưu Bội Nghi

Thiệp mời online cá nhân hoá. Mỗi khách nhận một link riêng để xem thiệp, xác nhận tham dự và gửi lời chúc. Bạn quản lý danh sách khách và xem phản hồi ở trang quản trị `/admin`.

Tài liệu này hướng dẫn cài đặt từ đầu: tạo database, chạy trên máy, đưa lên Vercel, điền biến môi trường và chuẩn bị file danh sách khách. Muốn sửa code (đổi màu, thêm chức năng…) xem [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

**Mục lục**

1. [Cần chuẩn bị](#1-cần-chuẩn-bị)
2. [Tạo database trên Supabase](#2-tạo-database-trên-supabase)
3. [File `.env`: điền biến môi trường](#3-file-env-điền-biến-môi-trường)
4. [Chạy trên máy](#4-chạy-trên-máy)
5. [Đưa lên Vercel](#5-đưa-lên-vercel)
6. [Chuẩn bị file CSV danh sách khách](#6-chuẩn-bị-file-csv-danh-sách-khách)
7. [Sử dụng trang quản trị](#7-sử-dụng-trang-quản-trị)
8. [Bật thông báo Telegram / Email](#8-bật-thông-báo-telegram--email)
9. [Thay ảnh, nhạc, logo, thông tin lễ](#9-thay-ảnh-nhạc-logo-thông-tin-lễ)
10. [Xử lý sự cố](#10-xử-lý-sự-cố)

---

## 1. Cần chuẩn bị

- **Node.js 20+** (tải tại nodejs.org). Kiểm tra bằng `node -v`.
- **Git** và một tài khoản **GitHub**.
- Tài khoản **Supabase** (supabase.com), gói miễn phí là đủ.
- Tài khoản **Vercel** (vercel.com), đăng nhập bằng GitHub.

Các file mẫu có sẵn trong repo:

| File | Dùng để |
|---|---|
| `.env.example` | Mẫu biến môi trường, chép ra thành `.env` |
| `prisma/guests-upload-template.csv` | Mẫu danh sách khách để tải lên trang quản trị |
| `prisma/sample-guests.csv` | Danh sách khách mẫu cho lệnh `npm run seed` |

## 2. Tạo database trên Supabase

1. Vào supabase.com → **New project**.
2. Đặt tên, chọn region gần Việt Nam (ví dụ Singapore), đặt **Database Password** và **lưu mật khẩu này lại**: bạn sẽ cần nó ở bước sau.
3. Đợi project tạo xong (khoảng 1–2 phút).
4. Bấm nút **Connect** trên thanh trên cùng của project, chọn tab **ORMs** → **Prisma**. Supabase sẽ hiện sẵn hai dòng:
   - `DATABASE_URL`: chuỗi **Transaction pooler**, cổng `6543`, có `?pgbouncer=true` ở cuối. Ứng dụng dùng chuỗi này khi chạy.
   - `DIRECT_URL`: chuỗi **Session pooler**, cổng `5432`. Chuỗi này dùng để tạo bảng (migration).
5. Chép hai chuỗi này vào `.env` (bước 3), thay `[YOUR-PASSWORD]` bằng mật khẩu database.

> **Mật khẩu có ký tự đặc biệt** (`@`, `#`, `/`, `:`, `?`…) phải được mã hoá trong chuỗi kết nối, ví dụ `@` → `%40`, `#` → `%23`. Cách đơn giản nhất là đặt mật khẩu chỉ gồm chữ và số.
>
> Quên mật khẩu: **Project Settings → Database → Reset database password**.

Bảng dữ liệu được tạo bằng lệnh `npx prisma migrate deploy` ở bước 4. Bạn không cần tạo bảng tay trên Supabase.

## 3. File `.env`: điền biến môi trường

Chép file mẫu:

```bash
cp .env.example .env        # macOS / Linux / Git Bash
copy .env.example .env      # Windows CMD
```

Mở `.env` và điền theo bảng dưới. File `.env` đã nằm trong `.gitignore` nên **không bị đưa lên GitHub**. Đừng đổi tên hoặc xoá dòng đó trong `.gitignore`.

### Bắt buộc

| Biến | Ví dụ | Ý nghĩa |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.xxxx:MATKHAU@aws-...pooler.supabase.com:6543/postgres?pgbouncer=true` | Chuỗi Transaction pooler từ Supabase (cổng 6543) |
| `DIRECT_URL` | `postgresql://postgres.xxxx:MATKHAU@aws-...pooler.supabase.com:5432/postgres` | Chuỗi Session pooler từ Supabase (cổng 5432) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` (máy) · `https://ten-du-an.vercel.app` (Vercel) | Địa chỉ gốc của trang, dùng để tạo link mời và mã QR. **Không** có dấu `/` ở cuối |
| `ADMIN_PASSWORD` | `MatKhauQuanTri2026` | Mật khẩu đăng nhập `/admin` |
| `SESSION_SECRET` | chuỗi ngẫu nhiên ≥ 32 ký tự | Khoá ký cookie đăng nhập. Tạo bằng lệnh bên dưới |

Tạo `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Đổi `SESSION_SECRET` sẽ đăng xuất mọi phiên admin đang mở.

### Thông tin buổi lễ

Bỏ trống biến nào thì trang dùng giá trị mặc định ghi trong `lib/event.ts`.

| Biến | Ví dụ | Hiển thị ở đâu |
|---|---|---|
| `EVENT_NAME` | `Lễ tốt nghiệp của Lưu Bội Nghi` | Tiêu đề dashboard, lịch, thông báo |
| `GRADUATE_NAME` | `Lưu Bội Nghi` | Tên trên bìa thiệp, nội dung thiệp |
| `EVENT_DATE` | `2026-11-22T08:00:00+07:00` | Ngày giờ lễ, đồng hồ đếm ngược, file lịch |
| `RSVP_DEADLINE` | `2026-11-21T23:59:59+07:00` | Hạn xác nhận. Quá hạn thì form tự khoá |
| `EVENT_VENUE` | `Trường Đại học Công nghiệp TP.HCM` | Tên địa điểm |
| `EVENT_ADDRESS` | `12 Nguyễn Văn Bảo, phường 4, quận Gò Vấp, TP. Hồ Chí Minh` | Địa chỉ đầy đủ, nút "Sao chép địa chỉ" |
| `EVENT_MAPS_URL` | link chia sẻ từ Google Maps | Nút "Chỉ đường" |
| `EVENT_NOTES` | `Trang phục lịch sự; vui lòng đến trước 15 phút.` | Mục "Lưu ý" |
| `GRADUATE_PHONE` | `0398989898` | Nút "Gọi" trên điện thoại |
| `GRADUATE_PHOTO_URL` | để trống, hoặc `https://...jpg` | Ảnh chân dung. Để trống thì dùng `public/graduate-photo.webp` |
| `GRADUATION_MUSIC_URL` | để trống, hoặc `https://...mp3` | Nhạc nền. Để trống thì dùng `public/graduation-music.mp3` |

> **Định dạng ngày giờ:** `NĂM-THÁNG-NGÀYTGIỜ:PHÚT:GIÂY+07:00`. Luôn giữ `+07:00` (giờ Việt Nam). Thiếu phần này, giờ hiển thị có thể lệch 7 tiếng trên Vercel.

### Thông báo (tuỳ chọn)

Để trống thì không gửi thông báo. Cách lấy giá trị xem [mục 8](#8-bật-thông-báo-telegram--email).

| Biến | Ý nghĩa |
|---|---|
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Nhận tin Telegram mỗi khi có khách phản hồi |
| `RESEND_API_KEY`, `NOTIFICATION_FROM`, `NOTIFICATION_TO` | Nhận email mỗi khi có khách phản hồi |

## 4. Chạy trên máy

```bash
npm install                  # cài thư viện
npx prisma migrate deploy    # tạo bảng trong database (chạy 1 lần, và mỗi khi có migration mới)
npm run dev                  # chạy trang
```

Mở `http://localhost:3000/admin` và đăng nhập bằng `ADMIN_PASSWORD`.

Muốn có sẵn khách để thử, chạy `npm run seed`. Lệnh này nhập khách từ `prisma/sample-guests.csv` và in link mời của từng người ra terminal.

> Máy và Vercel dùng **chung một database** nếu `.env` trỏ cùng Supabase. Khách tạo khi thử trên máy cũng sẽ hiện trên trang thật. Muốn tách riêng, tạo thêm một project Supabase để thử nghiệm.

## 5. Đưa lên Vercel

### Lần đầu

1. Đẩy code lên GitHub.
2. Vào vercel.com → **Add New… → Project** → chọn repo này → **Import**.
3. **Framework Preset** tự nhận là Next.js. Build Command để mặc định (dự án đã cấu hình `npm run build`).
4. Mở mục **Environment Variables** và thêm toàn bộ biến trong `.env`:
   - Nhanh nhất: chép hết nội dung file `.env` và dán vào ô **Key** đầu tiên, Vercel sẽ tự tách từng dòng.
   - Sửa `NEXT_PUBLIC_SITE_URL` thành domain Vercel, ví dụ `https://ten-du-an.vercel.app`. Nếu chưa biết domain, deploy một lần để xem, rồi sửa biến này và deploy lại.
5. Bấm **Deploy**.
6. Tạo bảng trên database (nếu chưa làm ở bước 4): trên máy, với `.env` trỏ tới Supabase thật, chạy `npx prisma migrate deploy`. Vercel **không** tự chạy lệnh này.
7. Mở `https://ten-du-an.vercel.app/admin` để đăng nhập.

### Các lần sau

- **Sửa code:** push lên nhánh `main`, Vercel tự deploy.
- **Sửa biến môi trường** (đổi ngày lễ, đổi mật khẩu…): vào **Project → Settings → Environment Variables**, sửa giá trị, rồi vào **Deployments**, chọn bản mới nhất → **⋯ → Redeploy**. Biến mới **chỉ có hiệu lực sau khi redeploy**.
- **Có migration mới** (thư mục `prisma/migrations/` có thêm thư mục con): chạy `npx prisma migrate deploy` **trước** khi push code.

## 6. Chuẩn bị file CSV danh sách khách

Cách dễ nhất: mở `prisma/guests-upload-template.csv` bằng Excel hoặc Google Sheets, xoá các dòng mẫu, điền khách của bạn, rồi lưu lại.

### Các cột

Dòng đầu tiên là tên cột, viết đúng như dưới đây (chữ thường, thứ tự cột không quan trọng):

```
name,salutation,group,contact,max_guests,personal_note
```

| Cột | Bắt buộc | Ví dụ | Ý nghĩa |
|---|---|---|---|
| `name` | ✔ | `Hữu Tài` | Tên khách, không kèm danh xưng |
| `salutation` | ✔ | `Anh`, `Chị`, `Em`, `Cô`, `Chú`, `Bạn` | Danh xưng, đứng trước tên: "Kính mời **Anh** Hữu Tài" |
| `group` | ✔ | `Gia đình`, `Bạn bè`, `Thầy cô` | Nhóm khách, dùng để thống kê trong dashboard |
| `contact` | | `0901234567` hoặc email | Chỉ admin thấy. Dùng để nhận ra khách khi nhập lại file |
| `max_guests` | ✔ | `0`, `1`, `2` | Số người **đi kèm** tối đa, không tính khách. `0` = chỉ mời một mình. Số nguyên từ 0 đến 20 |
| `personal_note` | | `"Chúc anh luôn rực rỡ trên hành trình mới!"` | Lời nhắn riêng, hiện thành câu trích dẫn lớn trong thiệp |

### Ví dụ

```csv
name,salutation,group,contact,max_guests,personal_note
Hữu Tài,Anh,Gia đình,0901234567,1,"Chúc anh luôn rực rỡ trên hành trình mới!"
Minh Triết,Em,Gia đình,0907654321,2,
Nguyễn Thị Lan,Cô,Thầy cô,lan@example.com,0,"Em cảm ơn cô, nhờ cô em mới có ngày hôm nay."
```

### Lưu ý khi soạn

- **Lưu đúng định dạng:**
  - Excel: **File → Save As → CSV UTF-8 (Comma delimited)**. Chọn "CSV" thường thì tiếng Việt sẽ bị lỗi font.
  - Google Sheets: **File → Download → Comma-separated values (.csv)**.
- Nội dung có **dấu phẩy** phải đặt trong ngoặc kép: `"Chúc em vui, khoẻ"`. Excel và Google Sheets tự làm việc này.
- Một ô có dấu xuống dòng sẽ làm hỏng file. Viết lời nhắn trên một dòng.
- Gặp dòng sai (thiếu `name`/`salutation`/`group`, hoặc `max_guests` không phải số 0–20), cả file bị từ chối và trang báo số dòng lỗi. Sửa dòng đó rồi tải lại.

### Nhập lại file có sao không?

- Khách trùng **cả `name` lẫn `contact`** với khách đã có: được **cập nhật** (danh xưng, nhóm, số người đi kèm, lời nhắn). **Link mời giữ nguyên**, nên có thể sửa file và nhập lại thoải mái.
- Đổi `name` hoặc `contact` của một khách: hệ thống coi là **khách mới** và tạo link mới. Khách cũ vẫn còn, cần xoá tay trong dashboard.
- Khách **không có `contact`**: mỗi lần nhập là tạo thêm một bản mới. Nên điền `contact` cho mọi người, hoặc chỉ nhập file một lần.

> File CSV chứa số điện thoại thật **không nên** commit lên repo GitHub công khai.

## 7. Sử dụng trang quản trị

Vào `/admin`, đăng nhập bằng `ADMIN_PASSWORD`. Phiên đăng nhập giữ 8 giờ.

| Việc | Cách làm |
|---|---|
| Thêm khách | Mục **Nhập danh sách khách** → chọn file CSV → **Nhập CSV** |
| Gửi thiệp | Mỗi dòng có mã QR, **Copy link** (chỉ link) và **Copy tin nhắn** (lời mời kèm link), dán vào Zalo/Messenger |
| Xem phản hồi | Bảng hiển thị trạng thái, số người đi kèm, lời chúc. Bốn ô trên cùng là tổng số khách, số đã phản hồi, số người dự kiến đến (gồm cả người đi kèm) và số chưa phản hồi |
| Tải danh sách | **Xuất CSV**: gồm thông tin khách, phản hồi và link mời; mở được bằng Excel, giữ đúng tiếng Việt |
| Xoá khách | Nút xoá trên từng dòng, hoặc xoá tất cả (xác nhận 2 lần, **không hoàn tác được**) |
| Đăng xuất | Nút **Đăng xuất** góc trên |

Khách có thể mở lại link để sửa phản hồi bao nhiêu lần cũng được, cho tới `RSVP_DEADLINE`.

## 8. Bật thông báo Telegram / Email

Mỗi khi khách gửi hoặc sửa phản hồi, bạn nhận một tin gồm tên, lựa chọn, số người đi kèm và lời chúc. Thông báo gửi lỗi cũng không ảnh hưởng tới phản hồi của khách.

### Telegram

1. Trong Telegram, nhắn `@BotFather` → `/newbot` → đặt tên. BotFather trả về token dạng `123456:ABC...` → đó là `TELEGRAM_BOT_TOKEN`.
2. Mở bot vừa tạo, bấm **Start** và nhắn một tin bất kỳ.
3. Mở trình duyệt: `https://api.telegram.org/bot<TOKEN>/getUpdates`, tìm `"chat":{"id": ...}` → số đó là `TELEGRAM_CHAT_ID`.
4. Thêm hai biến vào `.env` và vào Vercel, rồi redeploy.

### Email (Resend)

1. Tạo tài khoản ở resend.com → **API Keys** → tạo key → đó là `RESEND_API_KEY`.
2. `NOTIFICATION_TO`: email nhận thông báo.
3. `NOTIFICATION_FROM`:
   - Khi thử nghiệm, dùng `Thiệp tốt nghiệp <onboarding@resend.dev>`. Ở chế độ này Resend chỉ gửi tới email bạn dùng để đăng ký Resend.
   - Muốn gửi tới email khác, xác minh domain riêng trong **Domains** rồi dùng địa chỉ thuộc domain đó.

## 9. Thay ảnh, nhạc, logo, thông tin lễ

| Muốn thay | Cách |
|---|---|
| Ngày giờ, địa điểm, hạn xác nhận, lưu ý, SĐT | Sửa biến môi trường ([mục 3](#thông-tin-buổi-lễ)), rồi redeploy trên Vercel |
| Ảnh chân dung | Thay file `public/graduate-photo.webp` (ảnh dọc tỉ lệ 4:5), hoặc đặt `GRADUATE_PHOTO_URL` |
| Nhạc nền | Thay file `public/graduation-music.mp3`, hoặc đặt `GRADUATION_MUSIC_URL`. Nhạc chỉ phát sau khi khách bấm "Mở thiệp" |
| Logo trường | Thay file `public/logo.svg` |
| Màu sắc, phông chữ, câu chữ cố định, hiệu ứng | Xem [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |

## 10. Xử lý sự cố

| Hiện tượng | Nguyên nhân thường gặp |
|---|---|
| Build trên Vercel báo lỗi Prisma / không kết nối được database | Thiếu `DATABASE_URL` hoặc `DIRECT_URL` trên Vercel, hoặc mật khẩu sai / chưa mã hoá ký tự đặc biệt |
| Trang báo lỗi bảng không tồn tại (`table ... does not exist`) | Chưa chạy `npx prisma migrate deploy` |
| Link mời trong dashboard trỏ về `localhost` | `NEXT_PUBLIC_SITE_URL` trên Vercel chưa đổi sang domain thật, hoặc đổi rồi nhưng chưa redeploy |
| Đã sửa biến môi trường nhưng trang không đổi | Chưa **Redeploy** |
| Đăng nhập báo "Mật khẩu chưa đúng" dù gõ đúng | `ADMIN_PASSWORD` trên Vercel khác với `.env` trên máy, hoặc vừa đổi mà chưa redeploy |
| Tiếng Việt trong CSV bị lỗi font | Lưu lại file dạng **CSV UTF-8** |
| Nhập CSV báo "Dòng N không hợp lệ" | Dòng N (tính cả dòng tiêu đề) thiếu `name`/`salutation`/`group`, hoặc `max_guests` không phải số 0–20 |
| Giờ lễ hiển thị lệch | `EVENT_DATE` thiếu `+07:00` |
| Không nhận được thông báo Telegram | Chưa nhắn **Start** cho bot, sai `TELEGRAM_CHAT_ID`, hoặc thêm biến rồi chưa redeploy |
