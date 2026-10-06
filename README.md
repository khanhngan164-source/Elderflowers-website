# Elderflowers Garden — Website

Responsive single-page editorial shop for Elderflowers Garden (Madagui, Lâm Đồng), built from the design handoff in [`design/HANDOFF.md`](design/HANDOFF.md).

**Stack:** Next.js 16 (App Router, static export) · React 19 · TypeScript · plain CSS with design tokens · Vitest.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests for pricing, seasonality, checkout validation
npm run lint       # type check
npm run build      # static site in out/
```

`out/` is plain HTML/CSS/JS: deploy it to Vercel, Netlify or GitHub Pages. For GitHub Pages under
`/<repo>/`, build with `NEXT_PUBLIC_BASE_PATH=/Elderflowers-website npm run build`.

## Structure

```
src/
  app/            layout (fonts, metadata), page, globals.css (all tokens + styles), icon
  components/
    HomePage.tsx  composes the sections; owns the selected ingredient
    BagProvider   bag state (persisted to localStorage), toast
    BagDrawer     bag → checkout form (validated) → confirmation
    Header        announcement bar, sticky header, footer
    Editorial     hero, story, ingredients panel
    Commerce      shop, harvest calendar, flower box, recipes, farm visit
    ui.tsx        photo placeholder, stepper, toggle, logo, useToday
  lib/
    data.ts       products, ingredients, copy (placeholder — move to a CMS)
    logic.ts      pure rules: totals, delivery threshold, season status, visit days, validation
design/           original HTML prototypes + handoff spec (reference only)
```

## What is real vs. still mocked

| Area | Status |
|---|---|
| Layout, tokens, bilingual copy, all section interactions | Done, per handoff |
| Bag: add/merge, steppers, gift wrap + 160-char note, free delivery ≥ 1.000.000₫ | Done, persisted in localStorage |
| Checkout form + validation (name ≥ 2, phone `0xxxxxxxxx`, address ≥ 8) | Done (front end) |
| **Placing an order** | **Mocked** — shows a confirmation, nothing is sent. Needs a backend (e.g. Shopify / Haravan / Sapo + MoMo). |
| **Farm visit booking, newsletter** | **Mocked** — toast only. |
| Photography | Striped placeholders with shot descriptions |
| Logo | Text wordmark — `assets/logo-*.png` were not in the upload (see below) |

## Open items for the client / designer

1. **Logo files are missing.** The handoff references `assets/logo-plum.png` and `assets/logo-cream.png`
   but no `assets/` folder was uploaded. Put them in `public/assets/` and set `LOGO_FILES = true` in
   `src/components/ui.tsx`. Better: ask for an SVG.
2. **Instrument Serif has no Vietnamese glyphs.** It lacks ơ, ư, ạ, ế, ộ… (2 of 90 tone-marked letters), so in
   the prototype every Vietnamese subtitle silently mixes in a fallback font mid-word. This build sets
   Vietnamese text (`lang="vi"`) in **Newsreader** italic instead. The designer should confirm or pick another
   Vietnamese-capable serif (`--serif-vi` in `globals.css`).
3. Prices, non-client product names, story copy, address and visit experiences are placeholders.
4. Photography (aspect ratios are in the handoff).
