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

## Change the catalogue

All data is in two files, separate from the components:

| File | Holds |
|---|---|
| `data/catalogue.ts` | Jewellers (`shops`) and pieces (`pieces`) |
| `data/site.ts` | Site name, description, contact email, the demo notice |

**Add a piece:** add an object to `pieces`. Each one needs a unique `slug`
(its URL) and `code` (the reference customers quote). It also needs a
`category`, a `shop` (a shop's `slug`), a `price`, and one or more `images`.
`purity`, `weightGrams`, `makingCharge` and `stones` are optional, and the
page shows only what is filled in.

**Prices** come in three kinds, and the site labels each one differently:

```ts
price: { kind: "listed", aed: 3450 }                            // set by the jeweller
price: { kind: "indicative", aed: 8450, asOf: "2026-10-20" }    // from the day's gold rate
price: { kind: "on_request" }                                   // shown as "Request price"
```

**Images** live in `public/images/pieces/`. Each image is four files: a 4:5
ratio at 1200 × 1500 and 600 × 750, as both `.jpg` and `.webp`. For example:
`my-ring-1.jpg`, `my-ring-1.webp`, `my-ring-1-600.jpg`, `my-ring-1-600.webp`.
List it in the piece as `images: ["my-ring-1"]`, without the extension.
Strip location data from real photos before adding them.

**Contact buttons:** give a shop a real `whatsapp` (digits only,
international format, such as `9715…`) and `phone`, and set `demo: false`.
The buttons then open WhatsApp, with a message naming the piece and its
reference, or the phone's dialler. Without a number they show what would
happen instead of calling anyone.

**Register your interest:** set `contactEmail` in `data/site.ts`. Until then
the For jewellers and Contact pages say that registration is not open,
rather than showing a form that goes nowhere.

## What works

- **Search:** across name, category, purity, stones, shop and area. Every
  word must match.
- **Category index:** text controls, each showing a live count.
- **Filters:** price range, purity and location. Each option shows how many
  pieces it would leave, and options with nothing behind them are disabled.
  Purity shows only the values that exist in the data. On a phone, the
  filters open in a bottom sheet.
- **Sort:** newest, price low to high, price high to low. Price on request
  always sorts last.
- **Shareable views:** filters live in the URL, so a filtered view can be
  shared and the back button works.
- **Saved:** pieces are kept in this browser's local storage. There are no
  accounts.
- **Pages:** product pages with a gallery, shop pages, Saved, and the five
  footer pages.

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
