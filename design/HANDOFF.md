# Handoff: Elderflowers Garden — Mobile App + Website

## Overview
Elderflowers Garden is a Vietnamese lifestyle brand (farm in Madagui, Lâm Đồng) selling cordials, fresh flower boxes and herbal goods (candles, soap, shampoo). Positioning: editorial, story-led slow commerce. The core journey is **story → ingredient → product**: users read about the farm, meet an ingredient (elderflower, lemon, wild honey, mint…), and shop the products made from it.

Deliverables:
1. **Mobile app** (iOS-sized, 390×844) — full flow: home, shop, product, ingredient, story, flower-box subscription, bag, checkout, confirmation, journal, farm-visit booking, account.
2. **Website** (responsive, max-width 1320px) — single long editorial page with bag drawer.

All UI copy is **bilingual EN/VI shown together** (English primary, Vietnamese as an italic serif secondary line). Currency **VND**, formatted `220.000₫` (`toLocaleString('vi-VN') + '₫'`).

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. Recreate them in the target codebase's environment (e.g. React Native / SwiftUI / Flutter for the app; Next.js / Shopify Hydrogen etc. for the web) using its established patterns. If no environment exists, pick the most appropriate stack (suggestion: Expo/React Native for app, Next.js for web, shared product/ingredient data from a headless commerce backend).

The `.dc.html` files open directly in a browser (they load `support.js`). Each contains: a template (markup with inline styles) and a `class Component` logic block holding all data constants and state logic — read the logic block for exact data, copy and behaviors.

## Fidelity
**High-fidelity** for layout, color, typography, spacing, copy and interactions. **Exceptions / placeholders:**
- Striped boxes (`repeating-linear-gradient` with a mono caption like `PHOTO · …`) are **photo placeholders** — the caption describes the intended shot. Replace with real photography (aspect ratios noted below).
- Product names (Elderflower Cordial, Lemon with Honey, Mint Soap, candles) came from the client; other products, all prices, story copy, farm address and visit experiences are **placeholder content** to be confirmed.
- Status bar / home indicator / device frame in the app file are mock chrome — don't build them.

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| ink (plum) | `#3E2330` | Primary text, primary buttons, selected chips, rules |
| plum-deep | `#4A2735` | Dark sections (flower box, announcement bar, confirmation) |
| cream | `#F5F0E6` | Page background, text on dark |
| paper | `#FBF8F2` | Cards, inputs, selected option bg |
| sage | `#55654A` | Secondary accent: "in season" status, toggles on, CTA for visit & place order |
| butter | `#EADFB6` | Highlight sections (harvest calendar, recipe "pour it" card, shop box banner); also kicker text on dark |
| muted | `#6E5A62` | Secondary text, VI subtitles, labels |
| body-soft | `#4F3A44` | Long-form secondary paragraphs |
| on-dark muted | `#E4D6DB`, `#C9B6BE` | Secondary text on plum |
| butter-ink | `#5A4A1E` | Text on butter |
| out-of-season | `#8A6A3E` | "From Dec" status labels |
| error | `#A1352E` | Field error text + border |
| line | `rgba(62,35,48,.12–.2)` | Hairline dividers / borders |
| track-off | `rgba(62,35,48,.2)` | Toggle off; calendar empty cell `rgba(62,35,48,.1)` |
| overlay | `rgba(30,18,24,.4)` | Bag drawer scrim |

Ingredient swatch pairs (placeholder fill colors, also usable as soft brand tints): elderflower `#EDE4C4/#E3D8B0`, lemon `#EFE6A8/#E6DB92`, honey `#E8CF9A/#DEC283`, mint `#D3E0C9/#C4D4B8`, lemongrass `#DCE2C4/#CFD7B3`, pomelo `#EFE9DA/#E4DCC8`, dã quỳ `#F0D88E/#E8CC75`.

### Typography (Google Fonts)
- **Instrument Serif** (400, regular + italic) — all display, headings, product names, VI subtitles (italic).
- **Hanken Grotesk** (400/500/600) — UI and body.
- **IBM Plex Mono** (400) — only for photo-placeholder captions (drop in production).

| Role | Font | Size / line-height / tracking |
|---|---|---|
| Web hero | Instrument Serif | `clamp(56px,8vw,118px)` / .88 / -.035em |
| Web section title | Instrument Serif | `clamp(40px,4.4vw,60px)` / .95 / -.02em |
| App hero (Almanac) | Instrument Serif | 52px / .92 / -.025em |
| App screen title | Instrument Serif | 40px / 1 |
| Product name (PDP) | Instrument Serif | 40px / .98 / -.015em |
| Card product name | Instrument Serif | 19px app / 23px web, lh 1.05 |
| VI subtitle | Instrument Serif italic | ~0.4–0.5× of its heading (14–26px), color muted |
| Kicker / label | Hanken Grotesk 600 | 10–11px, UPPERCASE, letter-spacing .14em |
| Body | Hanken Grotesk 400 | 15–16.5px / 1.55–1.62 |
| Small | Hanken Grotesk | 12.5–13.5px |
| Button | Hanken Grotesk 500 | 14–15px |
| Tab label | Hanken Grotesk 600 12.5px + VI Instrument Serif italic 12px |

### Shape, spacing, effects
- Radius: buttons/chips/pills `999px`; everything else **square (0)** — cards, images, inputs, option rows. Device screen only is rounded.
- Spacing: app horizontal padding 20px (full-bleed images inset 12px); section gaps 26–40px; web container `max-width:1320px; padding 0 28px`, section top padding 96px.
- Borders: 1px hairlines; selected option = 1px solid ink + paper bg.
- Shadows: only on toast (`0 10px 30px rgba(0,0,0,.25)`) and bag drawer (`-20px 0 50px rgba(0,0,0,.2)`).
- Button heights: primary 50–52px; qty steppers 34–52px; hit targets ≥44px.
- Toggle: 46×28 track, 22px knob, `transition: left .2s, background .2s`.

## Mobile App — Screens
File: `Elderflowers App v2.dc.html` (prop `homeVariant`: `almanac` | `calendar` | `field`). `Elderflowers Garden — Home Directions.dc.html` shows all three side by side — **client to pick one home direction**; the rest of the app is identical.

**Global chrome**
- Header (tab roots): 3-col grid — left: current month EN (10px kicker) + VI (14px italic); center: plum logo 54px tall (tap → home); right: `Bag (n)`. Bottom hairline. Sticky.
- Pushed screens: sticky bar with `← Back` (or `← Bag` on checkout) left, `Bag (n)` right.
- Tab bar (84px, top hairline): Home/Trang chủ · Shop/Cửa hàng · Journal/Nhật ký · Visit/Ghé vườn · Account/Tài khoản. Active = ink label + 5px sage dot above; inactive label `#6E5A62`. Tab bar visible on tab roots, Story and Ingredient; hidden on Product, Box, Bag, Checkout, Done.
- Toast: top, 14px inset, plum bg, cream text, radius 14, auto-dismiss 2.4s, with "Bag" link.
- Navigation model: tab + a push stack. Switching tabs clears the stack; every push scrolls to top.

**Home A — Almanac**: issue line (`Issue No. 14 · Số 14`); hero photo 430px tall → title "The Elderflower Issue" / "Số đặc biệt: Hoa cơm cháy" / dek / underlined "Read the story · Đọc câu chuyện" (whole block opens Story). "In this issue" contents list: rows `[no 36px | EN title 22px + VI italic | →]`, top rule 1px ink — rows link to Story, Ingredient(elder), Journal tab, Visit tab. Ingredients carousel: 88px circles + name + VI, tap → Ingredient. Cordial Bar 2-col grid (4 featured products, 4:5 images). Plum Flower Box promo with "Build your box".

**Home B — Harvest Calendar**: kicker, month name 66px + VI 24px; horizontal month chips (46px wide pills; selected ink; current month has a sage dot). List of ingredients in season for selected month: 64px circle, name+VI, status label, origin, 12-cell season bar (6px tall, filled ink for in-season months). "Made from {Month}'s harvest" product grid (products whose ingredients overlap). Story teaser row.

**Home C — Field Notes**: 5 full-height chapters (706px each, `scroll-snap-type: y mandatory`), alternating backgrounds cream / plum-deep / butter / `#46553D` / cream. Each: photo filling remaining height (logo overlaid on chapter 1), kicker + `0n / 05`, 36px title, VI italic, pill CTA in inverted colors. No header in this variant.

**Shop**: title + VI; category chips with EN + VI stacked (Everything/Tất cả, Cordials/Siro, Flowers/Hoa tươi, Candles/Nến thơm, Bath/Tắm gội); butter banner → Box builder; 2-col product grid (4:5 image, category kicker, name, VI, "From …₫").

**Product**: 430px image (inset 12px); category kicker (sage), name 40px, VI 19px italic, description; size pills (label + price, selected ink); notes table (96px label col, e.g. Flavour/Pour/Keeps or Top/Heart/Base/Burn); "From the garden" ingredient rows (44px circle, name+VI, origin, "Story" link → Ingredient); for cordials a butter "Pour it like this · Cách pha" card. Sticky footer: qty stepper (1–9) + "Add to bag · {total}" (ink). Add → merges by product+size, toast.

**Ingredient**: 340px photo; status (sage if in season: "Picking now" / "Last weeks" / "All year", else "From {Mon}" in `#8A6A3E`); name 50px; VI 22px; story paragraph; Grown row; Season row = 12 cells with month initials, current month outlined 1.5px sage. "Made with {X}" product grid.

**Story**: kicker, 46px title, VI; 320px photo; 3 blocks (roman-numeral kicker, 16.5px body, "Meet the ingredient" card → Ingredient). "Shop the ingredients" chip cloud.

**Box builder** (pushed): 1 Size (3 option rows: Petite 450.000₫ / Garden 650.000₫ / Abundance 950.000₫, with stem counts); 2 Frequency segmented (Weekly/Fortnightly/Monthly); 3 First delivery date chips (next 7 days); 4 "Send as a gift" toggle → reveals handwritten-note textarea (Instrument Serif 19px). Sticky footer summary "{Size} · {freq} · from {date}" + per-box price; "Start subscription" → adds to bag, replaces Box with Bag in stack.

**Bag**: title + VI + item count; empty state (italic "Nothing picked yet.", VI line, "Visit the shop"). Items: 74×92 thumb, name, size·VI, qty stepper (0 removes), line price. Gift wrap toggle (+30.000₫, "Gói lá chuối, dây gai") → note textarea, max 160 chars with counter. Subtotal (incl. wrap), Delivery (35.000₫; free when subtotal ≥ 1.000.000₫), hint "Add X for free delivery". Sticky Total + "Checkout · Thanh toán".

**Checkout**: Full name, Phone, Address inputs (50px, paper bg, square). Delivery window options (Today 16–19, Tomorrow 09–12, Tomorrow 14–17). Payment 3-up: COD / Card / MoMo. "Place order · Đặt hàng" (sage).
Validation on submit: name ≥2 chars; phone matches `^0\d{9}$` after stripping spaces; address ≥8 chars. Errors: red border + bilingual message under field; editing a field clears its error.

**Confirmation** (plum-deep full screen): cream logo, kicker `Order EG-xxxxx`, 46px title, VI line, body (slot + wrap note + Zalo notification copy), paid-via / total row, "View in account" (cream pill) + "Back to the garden" link. Also used for visit booking confirmation ("See you on the hill.").
On order: bag clears; order prepended to Account orders (status "Being picked"); any flower-box items become Account subscriptions.

**Journal tab**: featured story card; full 12-month Harvest Calendar grid (96px name col + 12 cols, 16px cells, current month outlined sage; row tap → Ingredient); Recipes carousel (220×260 images, time kicker, name, VI, "Shop the cordial" → Product).

**Visit tab**: title + VI, 240px photo, address line. 1 Experience (3 cards: Morning harvest walk 450k, Cordial workshop 850k, Long-table supper 1.2M — per guest); 2 Date chips (next Fri/Sat/Sun only, 8 shown); 3 Time pills (depends on experience) + Guests stepper (1–8). Sticky summary + total; "Reserve · Đặt chỗ" (sage) → confirmation, booking added to Account.

**Account tab**: "Xin chào, Thu Hà" + email; Subscriptions (cards with Active/Paused status, Pause↔Resume, Skip next → toast; empty → link to Box); Orders list (no., status, items, date, total); Farm visits (empty → link to Visit); settings rows (Addresses, Language, Payment, Help · Zalo).

## Website — Sections
File: `Elderflowers Garden Website.dc.html`. Single page, anchor nav with smooth scroll, `scroll-margin-top: 90px` on sections. All grids use `repeat(auto-fit|auto-fill, minmax(min(100%, Npx), 1fr))` so they collapse to one column on mobile.

1. **Announcement bar** — plum-deep, 12.5px, bilingual free-delivery message.
2. **Header** (sticky, cream, bottom hairline) — 3-col grid: left nav Shop/Harvest/Flower Box; center logo 64px; right nav Journal/Visit + outlined pill `Bag (n)` (opens drawer). Nav 13px 600 uppercase .12em.
3. **Hero** — meta row (issue / month EN·VI / location) over 1px ink rule; 2-col: title (clamp 56–118px), VI italic, 17px dek, two pills (filled "Read the story", outlined "Shop the harvest") | 5:4 photo.
4. **Story** — 4-col auto-fit: title column + 3 story blocks (top ink rule, kicker, body, "Meet the {ingredient} →" with 52px swatch → selects ingredient and scrolls to Ingredients).
5. **Ingredients** — horizontal row of 104px circles (selected = 2px ink ring); below, a 3-panel paper card: photo | name/status/story/origin/12-month bar | "Made with X" product rows with outlined "Add" pill (hover fills ink).
6. **Shop** — title + chips (EN + VI inline) over ink rule; product grid min 250px: 4:5 image with cream "Add +" pill bottom-right (hover → ink/cream), category kicker, name 23px, VI, one-line note, price · size.
7. **Harvest Calendar** (butter bg, full-bleed) — left: kicker, month name (clamp 56–88px), VI, copy, 6×2 month pill grid; right: 150px name col + 12 cells (20px tall). Selected month column: cells sage if in season, outlined ink; rows not in season at 40% opacity.
8. **Flower Box** (plum-deep, full-bleed) — square photo | kicker, title, copy, 3 size rows (selected: cream border + 10% cream bg), frequency segmented control (selected cream on plum), "Start subscription · {price}" cream pill → adds to bag.
9. **Recipes** — 3 cards (4:5 image, time kicker, 28px name, VI, method, underlined "Add the {cordial} →").
10. **Visit** — copy + 16:10 photo | experience cards, weekend date chips, guests stepper, sage "Reserve · {total}" → toast.
11. **Footer** (ink bg) — cream logo 110px + tagline; Shop links; Farm links; newsletter (Instrument Serif 22px line + underlined email field + →). Bottom bar © and socials.

**Bag drawer**: fixed right, `width:min(440px,100vw)`, scrim closes. Header title + VI + Close. Items with steppers; gift wrap toggle + note textarea; footer delivery, free-delivery hint, Total, "Checkout · Thanh toán". Prototype checkout jumps straight to a thank-you state inside the drawer — in production route to the same checkout form/validation as the app.

**Toast**: fixed bottom-center pill, plum, 2.6s, "View bag" link.

## State (both surfaces)
- `bag: {key, name, sizeLabel, price, qty, thumb}[]`; derived subtotal, wrap fee (30.000₫ if on & bag non-empty), delivery (35.000₫ unless 0 or ≥1.000.000₫), total.
- `wrap: boolean`, `wrapNote: string (≤160)`.
- `box: {size, freq, day, gift, note}`; `visit: {exp, day, time, guests}`.
- `calMonth` (defaults to current month), selected `ingredient`, shop `category`.
- App only: `tab`, `stack` (pushed views), `form` + `errors`, `slot`, `pay`, `orders`, `subs`, `bookings`, `done` payload.
- Seasonality is data-driven: each ingredient has `months: number[]` (0–11); status text derives from current month. Products reference ingredients via `ings: string[]` — this drives "Made with", "From the garden", and calendar product lists.

Data needed from backend/CMS: products (bilingual names, sizes/prices, notes, ingredient refs, pairing), ingredients (bilingual, origin, months, story, photo), stories/journal, recipes (linked product), box tiers, visit experiences + availability, delivery slots, orders/subscriptions/bookings per user.

## Assets
- `assets/logo-plum.png` — client's logo, background removed and recolored to `#3E2330` (transparent PNG, 313×408).
- `assets/logo-cream.png` — same, recolored `#F5F0E6` for dark backgrounds.
Request a vector (SVG) logo from the client for production. No icon set is used (text + arrows only). All imagery is placeholder.

## Files
- `Elderflowers App v2.dc.html` — full mobile app prototype (all screens + logic + data).
- `Elderflowers Garden — Home Directions.dc.html` — the three home variants side by side.
- `Elderflowers Garden Website.dc.html` — responsive website prototype.
- `support.js` — runtime needed only to open the prototypes in a browser.
- `assets/` — logos.
