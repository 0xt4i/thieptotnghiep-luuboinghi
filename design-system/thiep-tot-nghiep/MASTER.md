# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/thiep-tot-nghiep/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Thiep Tot Nghiep (thiệp mời lễ tốt nghiệp — Next.js 14 + Tailwind)
**Generated:** 2026-10-29 by ui-ux-pro-max `--persist`, then edited to the locked direction
**Direction:** A — Academic Heritage, borrowing from B (Editorial): portrait-led hero + large pull quote
**Design Dials:** Variance 3/10 (Centered / Minimal) | Motion 3/10 (Subtle) | Density 2/10 (Spacious)
**Audience:** family, elders, friends opening the link from Zalo / Messenger in-app browsers (mobile first)

---

## Global Rules

### Color Palette

| Role | Hex | Tailwind token | Rule |
|------|-----|----------------|------|
| Primary (header, dark sections, primary CTA) | `#0B2545` | `navy` | Existing brand identity — keep |
| Primary deep (page backdrop) | `#071B33` | `navy-deep` | Behind the card only |
| On Primary | `#F8F3E8` | `cream` | Text on navy |
| Gold ornament | `#C9A227` | `gold` | **Dark backgrounds only** (navy). Never for text on light backgrounds |
| Accent text on light | `#B45309` | `accent` | Labels, eyebrows, links on cream (4.54:1 on `#F8F3E8`, 5.02:1 on white). **Fails on `#EEE6D4` (4.04)** — do not use that tint behind text |
| Background | `#F8F3E8` | `cream` | Card / paper |
| Foreground | `#0F172A` | `ink` | Body text on light |
| Muted text | `#64748B` | `muted` | Secondary text: 4.76:1 on white, only 4.30:1 on cream → on cream use it for large text (≥ 24px, or ≥ 18.7px bold) only; small secondary text sits on white surfaces |
| Border | `#CBD5E1` | `line` | Dividers, inputs |
| Destructive | `#B91C1C` | `red-700` | Form errors |
| Success | `#047857` | `emerald-700` | RSVP confirmation |
| Ring | `#B45309` on light / `#C9A227` on navy | — | Focus rings must be visible (2px + offset) |

**Color Notes:** Scholarly navy + gold ornament. Gold `#C9A227` fails contrast on cream, so all gold-coloured *text* on light surfaces uses `#B45309`. Do not use raw hex in components — use the Tailwind tokens.

### Typography

- **Heading Font:** EB Garamond (500–700) — `font-display`
- **Body Font:** Be Vietnam Pro (400–700) — `font-sans`
- **Loading:** `next/font/google` with `subsets: ["vietnamese"]` (self-hosted, no external `<link>`)
- **OG image (next/og):** load Be Vietnam Pro TTF explicitly — Satori has no Vietnamese font by default
- **Scale:** body ≥ 16px, labels ≥ 13px, nothing below 12px
- **Uppercase + wide tracking:** only for short labels without long diacritic runs (≤ 3 words). Sentences with Vietnamese diacritics stay in sentence case
- **Mood:** academic, ceremonial, warm, timeless

### Iconography

- **Library:** `lucide-react` only, stroke 1.5–2, size 20–24px
- No emoji or Unicode glyphs (◷ ⌖ ♢ ✉️) as icons
- Decorative icons get `aria-hidden`; icon-only buttons get `aria-label`

### Spacing Variables

*Density: 2/10 — Spacious*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, **minimum gap between touch targets** |
| `--space-md` | `24px` / `1.5rem` | Standard padding |
| `--space-lg` | `32px` / `2rem` | Section padding (mobile) |
| `--space-xl` | `48px` / `3rem` | Large gaps |
| `--space-2xl` | `64px` / `4rem` | Section padding (desktop) |
| `--space-3xl` | `96px` / `6rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(11,37,69,0.06)` | Subtle lift |
| `--shadow-md` | `0 4px 12px rgba(11,37,69,0.10)` | Cards, buttons |
| `--shadow-xl` | `0 18px 60px rgba(11,37,69,0.18)` | Polaroid photo, invitation card |

---

## Component Specs

### Buttons

- **Min touch target:** 44×44px; ≥ 8px gap between adjacent targets
- **Primary:** bg `navy`, text `cream`, pill (`rounded-full`), `min-h-11 px-6`, font-semibold 16px
- **Secondary:** transparent, border `navy`, text `navy`, same sizing
- **On navy:** primary = bg `gold`, text `navy`; secondary = border `gold/60`, text `cream`
- **Async buttons:** disabled + spinner (`Loader2` animate-spin) while pending — no double submit
- Transitions 150–300ms; `cursor-pointer`; visible `focus-visible` ring

### Cards / Paper

- bg `cream` or white/80, border `line` or `gold/35` (navy contexts), radius 16–24px, `--shadow-md`
- No hover lift on non-interactive cards

### Inputs

- `min-h-11`, padding 12px 16px, border `line`, radius 12px, **font-size 16px** (prevents iOS zoom)
- Focus: border `accent` + 3px ring `accent/20`
- Always a visible `<label>`; errors shown under the field / form with `role="alert"`

### Radio cards (RSVP)

- Native `<input type="radio">` visually hidden, `peer-focus-visible` ring on the card
- No pre-selected answer; selected state = bg `navy` + text `cream` + check icon (not colour alone)

---

## Style Guidelines

**Style:** Academic Heritage (classic, symmetric, ceremonial) + Editorial accents

**Keywords:** university crest, laurel, thin gold rule, polaroid portrait, serif headings, generous whitespace, pull quote

**Borrowed from Editorial (B):** portrait-led hero, oversized italic pull quote for the personal note

### Page Pattern

**Pattern Name:** Event invitation (adapted from Event/Conference Landing)

- **Conversion goal:** RSVP submitted
- **CTA Placement:** sticky bottom bar (mobile) + RSVP section + after confirmation
- **Section Order:** 1. Hero (logo, portrait, guest name, graduate, date + venue) → 2. Personal note → 3. Countdown → 4. Details + map/calendar → 5. RSVP → 6. Guestbook → 7. Sign-off

---

## Motion

**Scroll Reveal** (Subtle) — viewport enter | 300–400ms | ease-out | translateY 8–16px

- Implement with CSS + `IntersectionObserver` (no GSAP dependency)
- Content must be visible without JS (reveal class added only after hydration)
- `prefers-reduced-motion: reduce` → no transform/fade

---

## Anti-Patterns (Do NOT Use)

- ❌ Gold `#C9A227` text on light backgrounds
- ❌ Pre-selected RSVP answer / confusing registration
- ❌ Removing the countdown
- ❌ Generic "bạn" when addressing the guest — always salutation + name
- ❌ `100vh` for full-screen layouts — use `dvh`/`svh`
- ❌ `unoptimized` images or hero images > 200 KB
- ❌ **Emojis / Unicode glyphs as icons** — use Lucide
- ❌ **Low contrast text** — 4.5:1 minimum
- ❌ **Invisible focus states**
- ❌ **Instant state changes** — transitions 150–300ms

---

## Pre-Delivery Checklist

- [ ] No emojis/glyphs used as icons (Lucide only)
- [ ] Touch targets ≥ 44×44px, ≥ 8px apart
- [ ] Text contrast ≥ 4.5:1; gold only on navy
- [ ] Focus states visible (incl. RSVP radio cards)
- [ ] Body ≥ 16px, labels ≥ 13px
- [ ] `prefers-reduced-motion` respected
- [ ] `dvh` + `env(safe-area-inset-bottom)` for fixed elements
- [ ] Images via `next/image`, correct `sizes`, blur placeholder, `priority` only above the fold
- [ ] OG image renders Vietnamese diacritics
- [ ] Responsive: 360px, 390px, 768px, 1024px, 1440px
- [ ] No content hidden behind the sticky bar; no horizontal scroll
