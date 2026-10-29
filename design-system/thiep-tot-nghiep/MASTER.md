# Design System - File gốc

> **QUY TẮC:** Khi làm một trang cụ thể, xem trước `design-system/thiep-tot-nghiep/pages/[tên-trang].md`.
> Nếu file đó tồn tại, quy tắc trong đó **ghi đè** file gốc này.
> Nếu không có, tuân thủ nghiêm ngặt các quy tắc dưới đây.

---

**Dự án:** Thiệp Tốt Nghiệp (thiệp mời lễ tốt nghiệp — Next.js 14 + Tailwind)
**Tạo lúc:** 2026-10-29 bằng ui-ux-pro-max `--persist`, sau đó chỉnh theo hướng thiết kế đã chốt
**Hướng thiết kế:** A — Academic Heritage (học thuật cổ điển), mượn từ B (Editorial): phần mở đầu lấy ảnh chân dung làm trọng tâm + câu trích dẫn cỡ lớn
**Thông số thiết kế:** Độ biến tấu 3/10 (căn giữa / tối giản) | Chuyển động 3/10 (nhẹ nhàng) | Mật độ 2/10 (thoáng)
**Đối tượng:** gia đình, người lớn tuổi, bạn bè mở link từ trình duyệt trong Zalo / Messenger (ưu tiên điện thoại)

---

## Quy tắc chung

### Bảng màu

| Vai trò | Hex | Token Tailwind | Quy tắc |
|------|-----|----------------|------|
| Màu chính (header, section tối, nút chính) | `#0B2545` | `navy` | Màu nhận diện sẵn có — giữ nguyên |
| Màu chính đậm (nền trang) | `#071B33` | `navy-deep` | Chỉ dùng phía sau tấm thiệp |
| Chữ trên màu chính | `#F8F3E8` | `cream` | Chữ trên nền navy |
| Vàng trang trí | `#C9A227` | `gold` | **Chỉ dùng trên nền tối** (navy). Không bao giờ dùng cho chữ trên nền sáng |
| Chữ nhấn trên nền sáng | `#B45309` | `accent` | Nhãn, dòng chữ nhỏ phía trên tiêu đề, link trên nền cream (4.54:1 trên `#F8F3E8`, 5.02:1 trên nền trắng). **Không đạt trên `#EEE6D4` (4.04)** — không dùng màu nền đó phía sau chữ |
| Nền | `#F8F3E8` | `cream` | Thẻ / nền giấy |
| Chữ chính | `#0F172A` | `ink` | Chữ thân bài trên nền sáng |
| Chữ phụ | `#64748B` | `muted` | Chữ phụ: 4.76:1 trên nền trắng, chỉ 4.30:1 trên cream → trên cream chỉ dùng cho chữ lớn (≥ 24px, hoặc ≥ 18.7px in đậm); chữ phụ cỡ nhỏ phải đặt trên nền trắng |
| Viền | `#CBD5E1` | `line` | Đường kẻ, ô nhập liệu |
| Lỗi / nguy hiểm | `#B91C1C` | `red-700` | Lỗi trong form |
| Thành công | `#047857` | `emerald-700` | Xác nhận RSVP |
| Viền focus | `#B45309` trên nền sáng / `#C9A227` trên navy | — | Viền focus phải nhìn thấy rõ (2px + khoảng cách) |

**Ghi chú về màu:** Navy học thuật + hoạ tiết vàng. Vàng `#C9A227` không đủ tương phản trên nền cream, nên mọi *chữ* màu vàng trên nền sáng đều dùng `#B45309`. Không dùng mã hex trực tiếp trong component — dùng token Tailwind.

### Chữ

- **Phông tiêu đề:** EB Garamond (500–700) — `font-display`
- **Phông thân bài:** Be Vietnam Pro (400–700) — `font-sans`
- **Cách tải:** `next/font/google` với `subsets: ["vietnamese"]` (tự host, không dùng `<link>` bên ngoài)
- **Ảnh OG (next/og):** phải nạp file TTF Be Vietnam Pro — Satori mặc định không có phông tiếng Việt
- **Cỡ chữ:** thân bài ≥ 16px, nhãn ≥ 13px, không có chữ nào dưới 12px
- **Viết hoa + giãn chữ rộng:** chỉ dùng cho nhãn ngắn, không có nhiều dấu (≤ 3 từ). Câu tiếng Việt có dấu giữ kiểu viết hoa chữ đầu câu
- **Cảm giác:** học thuật, trang trọng, ấm áp, vượt thời gian

### Biểu tượng

- **Thư viện:** chỉ dùng `lucide-react`, nét 1.5–2, cỡ 20–24px
- Không dùng emoji hay ký tự Unicode (◷ ⌖ ♢ ✉️) làm biểu tượng
- Biểu tượng trang trí có `aria-hidden`; nút chỉ có biểu tượng phải có `aria-label`

### Khoảng cách

*Mật độ: 2/10 — Thoáng*

| Token | Giá trị | Dùng cho |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Khoảng cách sát |
| `--space-sm` | `8px` / `0.5rem` | Khoảng cách quanh biểu tượng, **khoảng cách tối thiểu giữa các vùng chạm** |
| `--space-md` | `24px` / `1.5rem` | Padding tiêu chuẩn |
| `--space-lg` | `32px` / `2rem` | Padding section (điện thoại) |
| `--space-xl` | `48px` / `3rem` | Khoảng cách lớn |
| `--space-2xl` | `64px` / `4rem` | Padding section (máy tính) |
| `--space-3xl` | `96px` / `6rem` | Padding phần mở đầu |

### Độ đổ bóng

| Mức | Giá trị | Dùng cho |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(11,37,69,0.06)` | Nổi nhẹ |
| `--shadow-md` | `0 4px 12px rgba(11,37,69,0.10)` | Thẻ, nút |
| `--shadow-xl` | `0 18px 60px rgba(11,37,69,0.18)` | Ảnh polaroid, tấm thiệp |

---

## Quy cách component

### Nút

- **Vùng chạm tối thiểu:** 44×44px; cách nút bên cạnh ≥ 8px
- **Nút chính:** nền `navy`, chữ `cream`, bo tròn hình viên thuốc (`rounded-full`), `min-h-11 px-6`, chữ semibold 16px
- **Nút phụ:** nền trong suốt, viền `navy`, chữ `navy`, cùng kích thước
- **Trên nền navy:** nút chính = nền `gold`, chữ `navy`; nút phụ = viền `gold/60`, chữ `cream`
- **Nút chờ xử lý:** vô hiệu hoá + vòng xoay (`Loader2` animate-spin) trong lúc chờ — không cho gửi hai lần
- Chuyển trạng thái 150–300ms; `cursor-pointer`; viền `focus-visible` nhìn thấy rõ

### Thẻ / nền giấy

- Nền `cream` hoặc trắng/80, viền `line` hoặc `gold/35` (trong ngữ cảnh navy), bo góc 16–24px, `--shadow-md`
- Thẻ không bấm được thì không nổi lên khi rê chuột

### Ô nhập liệu

- `min-h-11`, padding 12px 16px, viền `line`, bo góc 12px, **cỡ chữ 16px** (tránh iOS tự phóng to)
- Khi focus: viền `accent` + vòng 3px `accent/20`
- Luôn có `<label>` hiển thị; lỗi hiện dưới ô / dưới form với `role="alert"`

### Thẻ lựa chọn (RSVP)

- `<input type="radio">` gốc được ẩn khỏi giao diện, vòng `peer-focus-visible` hiện trên thẻ
- Không chọn sẵn đáp án; trạng thái đã chọn = nền `navy` + chữ `cream` + biểu tượng dấu tích (không chỉ dựa vào màu)

---

## Định hướng phong cách

**Phong cách:** Academic Heritage (cổ điển, đối xứng, trang trọng) + điểm nhấn Editorial

**Từ khoá:** huy hiệu trường, vòng nguyệt quế, đường kẻ vàng mảnh, ảnh chân dung kiểu polaroid, tiêu đề chữ có chân, nhiều khoảng trắng, câu trích dẫn lớn

**Mượn từ Editorial (B):** phần mở đầu lấy ảnh chân dung làm trọng tâm, lời nhắn riêng hiển thị thành câu trích dẫn in nghiêng cỡ lớn

### Bố cục trang

**Tên bố cục:** Thiệp mời sự kiện (phỏng theo trang giới thiệu sự kiện / hội nghị)

- **Mục tiêu chuyển đổi:** khách gửi RSVP
- **Vị trí nút kêu gọi:** thanh cố định dưới đáy (điện thoại) + section RSVP + sau khi xác nhận
- **Thứ tự section:** 1. Mở đầu (logo, chân dung, tên khách, người tốt nghiệp, ngày + địa điểm) → 2. Lời nhắn riêng → 3. Đếm ngược → 4. Thông tin + bản đồ/lịch → 5. RSVP → 6. Sổ lưu bút → 7. Lời kết

---

## Chuyển động

**Hiện dần khi cuộn** (nhẹ nhàng) — khi vào khung nhìn | 300–400ms | ease-out | trượt dọc 8–16px

- Làm bằng CSS + `IntersectionObserver` (không phụ thuộc GSAP)
- Nội dung phải hiển thị được khi không có JS (class ẩn chỉ được thêm sau khi hydrate)
- `prefers-reduced-motion: reduce` → không trượt, không mờ dần

---

## Không được dùng

- ❌ Chữ vàng `#C9A227` trên nền sáng
- ❌ Chọn sẵn đáp án RSVP / quy trình đăng ký rối rắm
- ❌ Bỏ đồng hồ đếm ngược
- ❌ Gọi khách chung chung là "bạn" — luôn dùng danh xưng + tên
- ❌ `100vh` cho bố cục toàn màn hình — dùng `dvh`/`svh`
- ❌ Ảnh `unoptimized` hoặc ảnh phần mở đầu > 200 KB
- ❌ **Emoji / ký tự Unicode làm biểu tượng** — dùng Lucide
- ❌ **Chữ tương phản thấp** — tối thiểu 4.5:1
- ❌ **Trạng thái focus không nhìn thấy**
- ❌ **Đổi trạng thái tức thì** — chuyển trạng thái 150–300ms

---

## Kiểm tra trước khi bàn giao

- [ ] Không dùng emoji/ký tự làm biểu tượng (chỉ Lucide)
- [ ] Vùng chạm ≥ 44×44px, cách nhau ≥ 8px
- [ ] Độ tương phản chữ ≥ 4.5:1; vàng chỉ dùng trên navy
- [ ] Trạng thái focus nhìn thấy rõ (kể cả thẻ lựa chọn RSVP)
- [ ] Thân bài ≥ 16px, nhãn ≥ 13px
- [ ] Tôn trọng `prefers-reduced-motion`
- [ ] Dùng `dvh` + `env(safe-area-inset-bottom)` cho phần tử cố định
- [ ] Ảnh qua `next/image`, đúng `sizes`, có ảnh mờ tạm, `priority` chỉ cho ảnh ở màn hình đầu
- [ ] Ảnh OG hiển thị đúng dấu tiếng Việt
- [ ] Responsive: 360px, 390px, 768px, 1024px, 1440px
- [ ] Không có nội dung bị thanh cố định che; không cuộn ngang
