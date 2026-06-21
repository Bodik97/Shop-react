# Design System Master File — AirSoft-UA

> **LOGIC:** When building a specific page, first check `design-system/airsoft-ua/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file. Otherwise, follow the rules below.

**Project:** AirSoft-UA (Ukrainian airsoft / pneumatics e-commerce)
**Direction:** Clean Pro Retail — light, maximum-trust (chosen 2026-06-21)
**Category:** High-trust e-commerce (weapons/pneumatics) — trust & clarity over flash

---

## Design Principles

1. **Trust first.** In this category the visitor silently asks "is this legit / will it arrive / is it a scam?". Every screen must answer that. Surface trust signals at the top, not buried on product pages.
2. **Light & airy.** White/light-gray surfaces, generous whitespace. The opposite of the old "dark warehouse" feel.
3. **One clear action per screen.** One primary CTA (orange). Everything else is subordinate.
4. **Calm, not aggressive.** Red discount badges used sparingly and only when the discount is real. No spammy "-XX%" on everything.

---

## Color Palette

| Role | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Background | `#FFFFFF` | `--color-background` | Page background |
| Surface / Muted | `#F5F5F4` | `--color-muted` | Section bands, card backgrounds |
| Foreground (Ink) | `#1C1917` | `--color-foreground` | Headings, body text |
| Muted Foreground | `#57534E` | `--color-muted-foreground` | Secondary text, labels |
| Primary (brand dark) | `#1C1917` | `--color-primary` | Dark surfaces, header, buttons-secondary |
| On Primary | `#FFFFFF` | `--color-on-primary` | Text on dark |
| Accent / CTA | `#EA580C` | `--color-accent` | Primary buttons "Купити", key CTAs |
| On Accent | `#FFFFFF` | `--color-on-accent` | Text on CTA |
| Trust / Success | `#15803D` | `--color-success` | Trust ticks, "в наявності", guarantees |
| Border | `#E7E5E4` | `--color-border` | Card/input borders, dividers |
| Destructive / Sale | `#DC2626` | `--color-destructive` | Real discounts only, errors |
| Ring (focus) | `#EA580C` | `--color-ring` | Focus outline |

**Notes:** Light retail base (white + warm gray) + decisive orange CTA + green trust accents. Keep the existing orange CTA the store already uses — it's consistent and converts.

---

## Typography

- **Heading Font:** Lexend (600/700) — clean, trustworthy, highly readable
- **Body Font:** Source Sans 3 (400/500)
- **Logo:** keep the existing stencil "AIRSOFT-UA" wordmark (brand identity) — used only as the logo, never for body text.

```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap');
```

**Type scale:** 12 · 14 · 16(base) · 18 · 24 · 32 · 40. Body line-height 1.5–1.6. Use tabular figures for prices.

---

## Spacing (4/8 rhythm)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Tight gaps |
| `--space-sm` | 8px | Inline spacing, icon gaps |
| `--space-md` | 16px | Standard padding |
| `--space-lg` | 24px | Card / section padding |
| `--space-xl` | 32px | Large gaps |
| `--space-2xl` | 48px | Section margins |
| `--space-3xl` | 64–80px | Hero / section vertical padding |

## Shadows (subtle — light theme)

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 10px rgba(0,0,0,0.06)` | Cards |
| `--shadow-lg` | `0 12px 24px rgba(0,0,0,0.08)` | Featured cards, dropdowns |

Border radius: 8px (buttons/inputs), 12px (cards), 16px (modals).

---

## Component Specs

### Primary Button (CTA)
```css
background: #EA580C; color: #fff; padding: 14px 28px; border-radius: 8px;
font: 600 16px Lexend; transition: all 200ms ease; cursor: pointer;
/* hover */ filter: brightness(0.95); /* never shift layout */
```

### Secondary Button
```css
background: #fff; color: #1C1917; border: 1.5px solid #1C1917;
padding: 14px 28px; border-radius: 8px; font: 600 16px Lexend; cursor: pointer;
```

### Product Card
```css
background: #fff; border: 1px solid #E7E5E4; border-radius: 12px;
box-shadow: var(--shadow-md); transition: box-shadow 200ms ease, transform 200ms ease;
/* hover */ box-shadow: var(--shadow-lg); transform: translateY(-2px);
```
- Discount badge: only when real; use `--color-destructive`, small, top-left, never on every card.
- Always show: in-stock state (green), price (tabular), one clear "Купити" / "В кошик".

### Input
```css
padding: 12px 16px; border: 1px solid #E7E5E4; border-radius: 8px; font-size: 16px;
/* focus */ border-color: #EA580C; box-shadow: 0 0 0 3px rgba(234,88,12,0.2); outline: none;
```

---

## Page Pattern (Homepage) — Trust & Conversion

**Section order:**
1. **Header** — logo, nav, search, prominent phone + cart. Sticky.
2. **Hero** — clear value proposition headline + subline (хто ви, чому довіряти) + 2 CTAs (Каталог / Підібрати зброю) on a light, photo-supported background.
3. **Trust bar** — Оплата при отриманні · Доставка по Україні · 14 днів повернення · Перевірка перед відправленням (icons + short text, green ticks). Moved UP from product page.
4. **Categories** — clean cards.
5. **Popular products** — calm cards (no badge spam).
6. **Social proof** — customer reviews ★ with count, real text/photos.
7. **Why us / How we work** — short reassurance (legality, warranty, support).
8. **FAQ** — handle objections (legality, delivery, returns, payment).
9. **Footer** — contacts, messengers, policies.

---

## Anti-Patterns (Do NOT use)

- ❌ Dark "warehouse" full-page background (the old problem)
- ❌ Liquid-glass / iridescent / chromatic effects — too flashy, erodes trust here
- ❌ Aggressive red "-XX%" badges on every product
- ❌ Emojis as icons — use Lucide / Heroicons SVG
- ❌ Layout-shifting hover (scale that moves neighbors)
- ❌ Low-contrast gray-on-gray text (<4.5:1)
- ❌ Instant state changes (always 150–300ms transitions)
- ❌ Hiding trust signals only on product pages

---

## Pre-Delivery Checklist

- [ ] No emojis as icons (Lucide/Heroicons SVG)
- [ ] One primary (orange) CTA per screen; secondary subordinate
- [ ] Trust bar visible above the fold on homepage
- [ ] `cursor-pointer` + smooth 150–300ms hover on all clickables
- [ ] Text contrast ≥ 4.5:1 (verify orange/green on white)
- [ ] Visible focus states; `prefers-reduced-motion` respected
- [ ] Responsive 375 / 768 / 1024 / 1440; no horizontal scroll on mobile
- [ ] Prices use tabular figures; empty product specs filled in Sanity
