# Thiệp mời tốt nghiệp - Lưu Bội Nghi

Ứng dụng Next.js App Router, TypeScript, Tailwind CSS và Prisma SQLite. SQLite là lựa chọn đơn giản cho MVP/local; khi deploy nhiều instance trên Vercel nên đổi datasource Prisma sang PostgreSQL/Supabase và đặt `DATABASE_URL` tương ứng.

## Chạy local

1. Cài Node.js 20+, tạo `.env` từ `.env.example` và đổi `ADMIN_PASSWORD`, `SESSION_SECRET`.
2. Cài dependencies: `npm install`.
3. Đặt `DATABASE_URL` bằng Supabase transaction pooler (port `6543`) và `DIRECT_URL` bằng session pooler (port `5432`) trong `.env`.
4. Tạo database: `npx prisma migrate deploy`.
5. Tạo 20 khách mẫu và in link: `npm run seed`.
6. Chạy: `npm run dev`, mở `http://localhost:3000/admin`.

File [sample-guests.csv](./prisma/sample-guests.csv) có đúng 20 dòng và có thể thay bằng CSV riêng. Token được tạo bằng `crypto.randomBytes(12)` (URL-safe, 16 ký tự trở lên), không dùng ID tuần tự.

## Thông báo

- Telegram: tạo bot bằng `@BotFather`, lấy `TELEGRAM_BOT_TOKEN`; nhắn bot một tin, gọi `https://api.telegram.org/bot<TOKEN>/getUpdates` để lấy `chat.id`, rồi đặt `TELEGRAM_CHAT_ID`.
- Email: tạo tài khoản Resend, xác minh domain (hoặc dùng địa chỉ onboarding cho thử nghiệm), đặt `RESEND_API_KEY`, `NOTIFICATION_FROM` và bổ sung `NOTIFICATION_TO` trong `.env` nếu dùng email.
- Lỗi notification chỉ được log, không làm rollback RSVP.

## Deploy Vercel

1. Đẩy mã lên GitHub và import project vào Vercel.
2. Thêm toàn bộ biến trong `.env.example` tại Project Settings > Environment Variables.
3. Dùng Supabase Postgres cho production: đặt `DATABASE_URL` là transaction pooler port `6543` và `DIRECT_URL` là session pooler port `5432`. Migration dùng `DIRECT_URL`; runtime dùng `DATABASE_URL`.
4. Build command là `npm run build`; start command mặc định của Vercel.
5. Sau deploy, chạy seed một lần từ máy có `DATABASE_URL` production: `npm run seed`; lưu lại link được in ra để gửi khách.

## Route chính

- `/i/{token}`: thiệp cá nhân, RSVP, calendar và Google Maps.
- `/admin`: đăng nhập quản trị.
- `/admin/dashboard`: thống kê, danh sách, QR, link và xuất CSV UTF-8 BOM.
- Admin dashboard hỗ trợ nhập CSV theo mẫu, giữ nguyên token khi cập nhật contact, và copy link/tin nhắn mời cho từng khách.
- `POST /api/rsvp`: Zod validation, upsert theo `guestId`, giới hạn companion và rate limit IP.

## Checklist

- Token sai trả về thông báo thân thiện và không truy xuất khách khác.
- Admin dùng cookie httpOnly, sameSite và chữ ký HMAC.
- RSVP sửa dùng `upsert`, không tạo bản ghi trùng; quá hạn khóa form.
- CSV xuất có BOM để Excel đọc đúng tiếng Việt.
- Layout responsive từ 360px, có label/fieldset, màu tương phản và giảm phụ thuộc vào animation để hỗ trợ reduced-motion.
