# Tibr — jewellery discovery prototype

A visual prototype of a UAE jewellery discovery site. Customers browse pieces
from different jewellers, see the price and the shop, and contact the shop
directly. There is no cart, no checkout and no payment: the sale happens in
the shop.

**Everything in the catalogue is demonstration data.** The jewellers are
invented, the prices are illustrative, the images are 3D renders and no
contact detail reaches a real person. The site says so at the top of every
page.

"Tibr" is a placeholder name. Change it in `data/site.ts`.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Build the static site, which is plain HTML, CSS and JS in `out/`:

```bash
npm run build
```

`out/` can be hosted on any static host. On Cloudflare Pages, connect the
repository and set the build command to `npm run build` and the output
directory to `out`.

## What's on the site

The layout follows Property Finder's: search first, then results you can
narrow fast, listings with the key facts up front, and a contact panel.

| Page | What it does |
|---|---|
| `/` | Hero search with **Jewellery · Bridal · Coins & bars** tabs, sample gold rates, categories, newest pieces, bridal, coins and bars, gold districts, jewellers, a quick estimator, popular searches |
| `/search` | Sticky filter bar (search box with suggestions, category, purity, price, more filters), dynamic title, sort, list / grid / map, active filter chips, pages, Save search, related searches |
| `/pieces/[slug]` | Gallery with full-screen viewer, price and key facts, price breakdown, details, map and directions, jeweller panel with WhatsApp / Call / "I'll visit to see this", similar pieces |
| `/jewellers` | Find a jeweller by name, area or language, as a list or on a map |
| `/jewellers/[slug]` | Profile, hours, languages, map, all their pieces |
| `/gold-price` | Price estimator: grams, tola or ounces, any making-charge type, VAT 0% for investment gold |
| `/saved` | Saved pieces and saved searches, kept in this browser |

Search state lives in the URL (`/search?location=karama&category=chains&purity=22K`),
so every view can be shared and the back button works.

## Change the catalogue

All data is in `data/catalogue.ts`, separate from the components:

- `areas`: real gold districts (Deira Gold Souk, Meena Bazaar, Karama, Gold &
  Diamond Park, Hamdan Street, Madinat Zayed Gold Centre, Rolla, Central
  Souk) with map coordinates.
- `shops`: the jewellers, each in an area, with hours, languages, a
  speciality and a cover piece.
- `pieces`: what is listed. Each piece has a category, purity, weight,
  making charge, occasions, who it is for, style, the shop, images, the
  date it was listed and the date its stock was last confirmed.
- `sampleRates`: the demo gold rates.

**Prices are worked out, not typed.** Set a piece's `price` to `"listed"`,
`"indicative"` or `"on_request"`. The figure comes from the sample rate ×
weight, plus the making charge, plus VAT (0% for 24K bullion of 999 or more,
5% otherwise), plus `stonesAed` if it has stones. So no demo price can be
below the gold it contains, and a test checks this.

**Images:** each one is four files in `public/images/pieces/`: `name.jpg`,
`name.webp`, `name-600.jpg` and `name-600.webp`, at a 4:5 ratio. List it as
`images: ["name"]`.

**Contact buttons:** give a shop a real `whatsapp` (digits only) and `phone`,
and set `demo: false`. Until then, the buttons and the visit form say
plainly that the listing is a demonstration, and nothing is sent.

**Map:** Leaflet with CARTO's free light basemap (attribution shown). For
heavy traffic, move to a paid tile plan or self-hosted tiles.

## The images

The catalogue images are rendered in 3D by `scripts/render/`, not
photographed and not AI-generated. Each piece is modelled at real size: a
cable chain from interlocking links, a solitaire with four claws and a
faceted stone, a kada with a continuous twist. Each one is lit by the same
studio on the same limestone surface, so the set reads as one shoot.

```bash
npm run render                    # every image (about 5 minutes)
npm run render -- --fast ring     # quick half-resolution preview of matching shots
```

Shots are defined in `scripts/render/shots.js`, models in `pieces.js` and
the lights and surface in `studio.js`. When real shop photography arrives,
it replaces these files one for one. Keep the same 4:5 crop and a plain,
light background so the grid stays coherent.

## Checks

```bash
npm test             # catalogue search, filters, sorting and URL state; pricing formula
npm run typecheck
npm run lint
```

## Groundwork for later

The prototype has no backend, by design. The previous phase's work is kept
for when it gets one:

- `supabase/` holds a Postgres schema with row-level security, for
  jewellers managing their own listings, gold rates, contact logging and
  visit requests. `npm run test:db` checks it against a local Postgres.
- `lib/pricing.ts` holds the estimated-price formula (gold rate × weight,
  plus making charge, plus 5% VAT), with tests.

The fields in `data/catalogue.ts` match that schema, so the catalogue can
later be read from the database without changing the components.
