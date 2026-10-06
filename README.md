# Elderflowers Garden — Website

Responsive single-page editorial shop for Elderflowers Garden (Madagui, Lâm Đồng), built from the design handoff in [`design/HANDOFF.md`](design/HANDOFF.md).

**Stack:** Next.js 16 (App Router, ISR on Vercel) · React 19 · TypeScript · plain CSS with design tokens · Vitest.
**Content & orders:** a Google Sheet plus its Apps Script (`cms/`). The shop edits the sheet; orders,
bookings and newsletter sign-ups are written back to it and emailed to the shop.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests: pricing, parsing, validation, and the Apps Script itself
npm run lint       # type check
npm run build
```

Without `CMS_URL` the site runs on built-in sample content and ordering is switched off (customers
are told to message on Zalo). Set it in `src/lib/config.ts` (or `NEXT_PUBLIC_CMS_URL`) to the
Apps Script web-app URL.

## How content and orders flow

```
Google Sheet ──(Apps Script doGet, JSON)──▶ Next.js page (re-read ≤ once/min) ──▶ visitors
visitors ──(POST order/booking/newsletter)──▶ Apps Script doPost ──▶ new row + email to shop
```

- Tab and column names are defined once in `cms/schema.json`; the website parser, the Apps Script
  and the template generator all use it (a test checks the script against it).
- **Prices are recomputed in the Apps Script** from the sheet. Totals sent by the browser are ignored.
- Private settings (`order_email`) never leave the sheet. Drive image links are converted to direct
  URLs and the files are made link-viewable automatically.
- Shop-facing setup guide (Vietnamese): [`cms/HUONG-DAN.md`](cms/HUONG-DAN.md).

## Structure

```
cms/
  schema.json         sheet tabs & columns (single source of truth)
  apps-script/Code.gs backend pasted into the sheet's Apps Script
  export-defaults.ts  + build_template.py → starter workbook with today's content
  HUONG-DAN.md        setup & day-to-day guide for the shop
src/
  app/                layout (fonts, metadata), page (loads content, ISR), globals.css, icon
  components/         sections, bag drawer/checkout, BagProvider (bag + content context), ui
  lib/
    content.ts        content types, defaults, sheet parsing, bag repricing
    load-content.ts   server-side fetch from the sheet
    api.ts            browser → Apps Script POSTs
    logic.ts          pure rules: totals, season status, visit days, validation
    data.ts           built-in sample content (fallback)
design/               original HTML prototypes + handoff spec (reference only)
```

## What is real vs. still missing

| Area | Status |
|---|---|
| Layout, tokens, bilingual copy, all section interactions | Done, per handoff |
| Content editable from Google Sheets (text, prices, products, images, fees) | Done — needs the Apps Script deployed once |
| Orders → sheet + email, server-side pricing, COD & VietQR bank transfer | Done — same |
| Farm-visit bookings and newsletter → sheet | Done — same |
| Card / MoMo payments | Not built: needs a merchant account (MoMo Business / VNPay) |
| Stock / inventory, order status emails to customers | Not built |
| Logo | Text wordmark — `assets/logo-*.png` were not in the upload |

## Open items for the client / designer

1. **Logo files are missing.** The handoff references `assets/logo-plum.png` and `assets/logo-cream.png`
   but no `assets/` folder was uploaded. Put them in `public/assets/` and set `LOGO_FILES = true` in
   `src/components/ui.tsx`. Better: ask for an SVG.
2. **Instrument Serif has no Vietnamese glyphs.** It lacks ơ, ư, ạ, ế, ộ… (2 of 90 tone-marked letters), so in
   the prototype every Vietnamese subtitle silently mixes in a fallback font mid-word. This build sets
   Vietnamese text (`lang="vi"`) in **Newsreader** italic instead. The designer should confirm or pick another
   Vietnamese-capable serif (`--serif-vi` in `globals.css`).
3. Prices, non-client product names, story copy, address and visit experiences are placeholders —
   now editable in the sheet.
4. Photography (aspect ratios are in `cms/HUONG-DAN.md`).
5. Vietnamese headings typed into the sheet are set in Newsreader automatically (see 2); it is wider and
   heavier than Instrument Serif, so the designer should review a Vietnamese hero title.
