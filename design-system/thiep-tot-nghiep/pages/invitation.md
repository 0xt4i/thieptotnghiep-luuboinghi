# Quy tắc riêng cho trang thiệp — `/i/[token]`

> **DỰ ÁN:** Thiệp Tốt Nghiệp
> **File:** `app/i/[token]/page.tsx`, `app/i/[token]/opengraph-image.tsx`, `components/GuestInvitation.tsx`
> Quy tắc ở đây **ghi đè** `../MASTER.md`. Không thay đổi route và mô hình dữ liệu.

---

## Bối cảnh

- Khách mở thiệp từ trình duyệt trong Zalo / Messenger trên điện thoại, thường dùng 4G
- Khách có cả người lớn tuổi → lời lẽ trang trọng, chữ lớn dễ đọc

## Bố cục

- Một tấm thiệp duy nhất, `max-w-[480px]` trên điện thoại, rộng dần ở md/lg
- **Bìa ("Mở thiệp"):** giữ lại, một chạm là mở thiệp (và bật nhạc nếu có)
- **Phần mở đầu (màn hình đầu tiên):** logo trường (rõ ràng, dễ đọc) → ảnh chân dung polaroid (`priority`) → "Trân trọng kính mời" → danh xưng + tên khách → tên người tốt nghiệp → ngày giờ + địa điểm
- **Lời nhắn riêng:** câu trích dẫn EB Garamond in nghiêng cỡ lớn (phong cách Editorial), có đường kẻ màu `accent` bên trái
- Padding dưới đáy tính cả chiều cao thanh cố định + `env(safe-area-inset-bottom)`

## Quy tắc câu chữ

- Luôn gọi khách bằng `{danh xưng} {tên}`; không bao giờ dùng "bạn"
- Chỉ dùng tiếng Việt (không viết kiểu "A new chapter begins")
- Sổ lưu bút chỉ hiện lời chúc, không bao giờ hiện tên khách

## Quy tắc cho điện thoại / trình duyệt trong ứng dụng

- Thanh cố định dưới đáy: **Xác nhận tham dự** (nút chính) · **Chỉ đường** · **Gọi** (`tel:` event.phone); ẩn đi khi section RSVP đang hiện trên màn hình
- Lịch: link Google Calendar là chính, file `.ics` là phụ
- Nút "Sao chép địa chỉ" có phản hồi đã sao chép
- Nhạc: chỉ phát sau khi khách chạm; nút bật/tắt ≥ 44px, có `aria-label`

## Form RSVP

- Không chọn sẵn trạng thái; chỉ gửi được khi đã chọn một trạng thái
- Đang gửi: nút bị vô hiệu hoá + vòng xoay; lỗi mạng được bắt và hiện ngay trong form (`role="alert"`)
- Gửi thành công: hiện xác nhận + nút Google Calendar (khi chọn tham dự)

## Ảnh OG

- Nạp phông Be Vietnam Pro vào `next/og`; ảnh có danh xưng + tên khách; `<title>` dưới 60 ký tự
