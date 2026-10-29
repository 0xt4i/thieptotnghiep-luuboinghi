# Invitation Page Overrides — `/i/[token]`

> **PROJECT:** Thiep Tot Nghiep
> **Files:** `app/i/[token]/page.tsx`, `app/i/[token]/opengraph-image.tsx`, `components/GuestInvitation.tsx`
> Rules here **override** `../MASTER.md`. Route and data model must not change.

---

## Context

- Opened from Zalo / Messenger in-app webviews on phones, often 4G
- Audience includes elders → formal Vietnamese register, large readable text

## Layout

- Single card, `max-w-[480px]` on mobile, widening on md/lg
- **Gate ("Mở thiệp"):** kept, one tap opens the invitation (and starts optional music)
- **Hero (first screen):** university logo (clearly legible) → polaroid portrait (`priority`) → "Trân trọng kính mời" → salutation + guest name → graduate name → date/time + venue
- **Personal note:** oversized italic EB Garamond pull quote (Editorial style), accent rule on the left
- Bottom padding accounts for the sticky bar height + `env(safe-area-inset-bottom)`

## Copy rules

- Always address the guest as `{salutation} {name}`; never "bạn"
- Vietnamese only (no "A new chapter begins")
- Guestbook shows messages only, never guest names

## Mobile / in-app browser rules

- Sticky bottom bar: **Xác nhận tham dự** (primary) · **Chỉ đường** · **Gọi** (`tel:` event.phone); hidden while the RSVP section is in view
- Calendar: Google Calendar link is primary, `.ics` secondary
- "Sao chép địa chỉ" button with copied feedback
- Music: only after the user taps; toggle button ≥ 44px with `aria-label`

## RSVP form

- No default status; submit disabled until a status is chosen
- Pending: button disabled + spinner; network errors caught and shown inline (`role="alert"`)
- Success: confirmation + Google Calendar button (when attending)

## OG image

- Be Vietnam Pro loaded into `next/og`; guest salutation + name in the image; `<title>` < 60 chars
