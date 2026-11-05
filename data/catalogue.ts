// The demonstration catalogue.
//
// EVERYTHING IN THIS FILE IS DEMONSTRATION DATA. The jewellers are invented,
// the prices are illustrative and the images are 3D renders, not photographs
// of real stock. None of it is a real UAE business or a verified offer.
// The areas are real places, so customers recognise them; no shop in this
// file trades there.
//
// The shapes here mirror the database tables in supabase/migrations, so the
// site can read the same fields from Supabase later.

import { estimatePrice, vatRateFor } from "@/lib/pricing";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Category =
  | "chains" | "necklaces" | "sets" | "rings" | "earrings" | "pendants"
  | "bangles" | "bracelets" | "anklets" | "coins" | "bars";
export type Purity = "24K" | "22K" | "21K" | "18K";
export type Occasion = "bridal" | "daily" | "gift" | "festive" | "engagement" | "investment";
export type Wearer = "women" | "men" | "kids" | "unisex";
export type Style = "arabic" | "indian" | "italian" | "turkish" | "contemporary";

/**
 * listed      a price the jeweller has set for this piece
 * indicative  worked out from the jeweller's gold rate on the day it was
 *             listed; it moves with the gold price
 * on_request  no price published
 */
export type Price =
  | { kind: "listed"; aed: number }
  | { kind: "indicative"; aed: number; asOf: string }
  | { kind: "on_request" };

export type MakingCharge =
  | { type: "per_gram"; aed: number }
  | { type: "percent"; value: number }
  | { type: "fixed"; aed: number };

export const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah"] as const;
export type Emirate = (typeof EMIRATES)[number];

export type Area = {
  slug: string;
  name: string;
  emirate: Emirate;
  /** One line about the place, for area pages and the souk list. */
  note: string;
  lat: number;
  lng: number;
};

export type Shop = {
  slug: string;
  name: string;
  area: string; // Area slug
  address: string;
  lat: number;
  lng: number;
  about: string;
  hours?: string;
  languages: string[];
  /** What the shop is best known for, shown on its card. */
  speciality: string;
  /** Slug of the piece whose image represents the shop. */
  cover: string;
  /** Digits only, international format, e.g. "9715xxxxxxxx". Empty for demo shops. */
  whatsapp?: string;
  /** As dialled, e.g. "+971 4 xxx xxxx". Empty for demo shops. */
  phone?: string;
  demo: boolean;
};

export type Piece = {
  slug: string;
  /** The reference a customer can quote to the shop. */
  code: string;
  name: string;
  category: Category;
  purity?: Purity;
  /** Bullion only, e.g. "999.9". */
  fineness?: string;
  weightGrams?: number;
  makingCharge?: MakingCharge;
  stones?: string;
  occasions: Occasion[];
  wearer: Wearer;
  style?: Style;
  price: Price;
  shop: string;
  description: string;
  /** Base names in public/images/pieces, first is the cover. */
  images: string[];
  /** ISO date the piece was listed; drives "Newest". */
  listedAt: string;
  /** ISO date the shop last confirmed it is still in stock. */
  stockConfirmedAt: string;
  demo: boolean;
};

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------
export const CATEGORIES: { id: Category; label: string; singular: string; section: Section }[] = [
  { id: "chains", label: "Chains", singular: "Chain", section: "jewellery" },
  { id: "necklaces", label: "Necklaces", singular: "Necklace", section: "jewellery" },
  { id: "sets", label: "Sets", singular: "Set", section: "jewellery" },
  { id: "rings", label: "Rings", singular: "Ring", section: "jewellery" },
  { id: "earrings", label: "Earrings", singular: "Earrings", section: "jewellery" },
  { id: "pendants", label: "Pendants", singular: "Pendant", section: "jewellery" },
  { id: "bangles", label: "Bangles", singular: "Bangle", section: "jewellery" },
  { id: "bracelets", label: "Bracelets", singular: "Bracelet", section: "jewellery" },
  { id: "anklets", label: "Anklets", singular: "Anklet", section: "jewellery" },
  { id: "coins", label: "Coins", singular: "Coin", section: "coins_bars" },
  { id: "bars", label: "Bars", singular: "Bar", section: "coins_bars" },
];

/** The three tabs on the main search, like Buy / Rent / New projects. */
export type Section = "jewellery" | "coins_bars";
export type Tab = "jewellery" | "bridal" | "coins_bars";
export const TABS: { id: Tab; label: string }[] = [
  { id: "jewellery", label: "Jewellery" },
  { id: "bridal", label: "Bridal" },
  { id: "coins_bars", label: "Coins & bars" },
];

export const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: "bridal", label: "Bridal" },
  { id: "engagement", label: "Engagement" },
  { id: "daily", label: "Daily wear" },
  { id: "festive", label: "Festive" },
  { id: "gift", label: "Gift" },
  { id: "investment", label: "Investment" },
];

export const WEARERS: { id: Wearer; label: string }[] = [
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
  { id: "kids", label: "Kids" },
  { id: "unisex", label: "Anyone" },
];

export const STYLES: { id: Style; label: string }[] = [
  { id: "arabic", label: "Arabic" },
  { id: "indian", label: "Indian" },
  { id: "italian", label: "Italian" },
  { id: "turkish", label: "Turkish" },
  { id: "contemporary", label: "Contemporary" },
];

// ---------------------------------------------------------------------------
// Areas: real gold-trading districts. Coordinates are approximate centres.
// ---------------------------------------------------------------------------
export const areas: Area[] = [
  { slug: "deira-gold-souk", name: "Deira Gold Souk", emirate: "Dubai", lat: 25.2697, lng: 55.2966, note: "The covered lanes off Sikkat Al Khail, with the densest run of jewellers in the country." },
  { slug: "meena-bazaar", name: "Meena Bazaar", emirate: "Dubai", lat: 25.2603, lng: 55.2966, note: "Bur Dubai's textile and gold streets, known for Indian bridal work." },
  { slug: "karama", name: "Karama", emirate: "Dubai", lat: 25.2459, lng: 55.3030, note: "Everyday gold at street-front shops, popular for chains and plain bangles." },
  { slug: "gold-diamond-park", name: "Gold & Diamond Park", emirate: "Dubai", lat: 25.1372, lng: 55.2196, note: "Al Quoz showrooms, with workshops on site and bullion dealers alongside." },
  { slug: "hamdan-street", name: "Hamdan Street", emirate: "Abu Dhabi", lat: 24.4919, lng: 54.3720, note: "Abu Dhabi's long-standing high street for gold and watches." },
  { slug: "madinat-zayed", name: "Madinat Zayed Gold Centre", emirate: "Abu Dhabi", lat: 24.4878, lng: 54.3779, note: "A dedicated gold centre in the city, with family jewellers on every floor." },
  { slug: "rolla", name: "Rolla", emirate: "Sharjah", lat: 25.3574, lng: 55.3891, note: "Busy streets round Rolla Square, with workshops making to order." },
  { slug: "central-souk", name: "Central Souk", emirate: "Sharjah", lat: 25.3268, lng: 55.3853, note: "The Blue Souk by Khalid Lagoon, with gold on the ground floor." },
];

// ---------------------------------------------------------------------------
// Jewellers (all invented)
// ---------------------------------------------------------------------------
export const shops: Shop[] = [
  {
    slug: "sidra-atelier", name: "Sidra Atelier", area: "deira-gold-souk",
    address: "Lane 4, Deira Gold Souk, Dubai", lat: 25.2701, lng: 55.2972,
    about: "A small workshop near the gold souk making traditional 22K chains and bead work, alongside a few lighter pieces in 18K.",
    hours: "Sat–Thu 10:00–22:00 · Fri 16:00–22:00", languages: ["Arabic", "English", "Malayalam"],
    speciality: "Rope chains and bead work", cover: "22k-star-coin-pendant", demo: true,
  },
  {
    slug: "yasmeen-gold", name: "Yasmeen Gold", area: "meena-bazaar",
    address: "Meena Bazaar, Bur Dubai", lat: 25.2608, lng: 55.2959,
    about: "Bridal sets, coin necklaces and stacked bangles in 22K, with fittings for the wedding day booked in advance.",
    hours: "Daily 10:00–23:00", languages: ["English", "Hindi", "Malayalam", "Tamil"],
    speciality: "Bridal sets and coin necklaces", cover: "22k-coin-collar-necklace", demo: true,
  },
];

// ---------------------------------------------------------------------------
// Sample rates and pieces
// ---------------------------------------------------------------------------
/**
 * SAMPLE gold rates for the demo, AED per gram. Not live and not a quote:
 * the page says so wherever they appear. In the real site these come from
 * the gold_rates table, entered by our team each morning.
 */
export const sampleRates = {
  asOf: "2026-11-03T09:00:00+04:00",
  perGram: { "24K": 492.5, "22K": 456.0, "21K": 437.25, "18K": 374.75 } as Record<Purity, number>,
};

// ---------------------------------------------------------------------------
type Draft = Omit<Piece, "demo" | "stockConfirmedAt" | "occasions" | "wearer" | "price"> &
  Partial<Pick<Piece, "stockConfirmedAt" | "occasions" | "wearer">> & {
    /** How the price is published; the figure itself is worked out below. */
    price: Price["kind"];
    /** Stones or pearls, priced by the shop on top of gold and making. */
    stonesAed?: number;
  };

/**
 * Fills the defaults every demo piece shares, and prices it from the sample
 * rate with the same formula the real site uses, so no demo price is below
 * the gold it contains. A "listed" price is that figure rounded up to AED 10,
 * as a shop would set it.
 */
const piece = ({ price, stonesAed = 0, ...d }: Draft): Piece => {
  let p: Price = { kind: "on_request" };
  if (price !== "on_request") {
    if (!d.purity || !d.weightGrams || !d.makingCharge) throw new Error(`${d.slug}: a priced piece needs purity, weight and making charge`);
    const est = estimatePrice({
      ratePerGramAed: sampleRates.perGram[d.purity],
      weightGrams: d.weightGrams,
      makingChargeType: d.makingCharge.type,
      makingChargeValue: d.makingCharge.type === "percent" ? d.makingCharge.value : d.makingCharge.aed,
      vatRate: vatRateFor(d.purity, d.fineness),
    });
    const total = est.total + stonesAed * 1.05;
    p = price === "listed"
      ? { kind: "listed", aed: Math.ceil(total / 10) * 10 }
      : { kind: "indicative", aed: Math.round(total), asOf: sampleRates.asOf.slice(0, 10) };
  }
  return { occasions: [], wearer: "women", stockConfirmedAt: d.listedAt, demo: true, ...d, price: p };
};

export const pieces: Piece[] = [
  // ---- Chains ----------------------------------------------------------
  piece({
    slug: "22k-rope-chain", code: "SA-0142", name: "22K Rope Chain", category: "chains",
    purity: "22K", weightGrams: 18.6, makingCharge: { type: "per_gram", aed: 24 },
    price: "indicative", shop: "sidra-atelier",
    occasions: ["daily", "gift"], wearer: "unisex", style: "italian",
    description: "A tightly twisted rope chain, 50 cm, with a lobster clasp. Heavy enough to wear on its own, fine enough to take a pendant.",
    images: ["rope-chain-22k-1", "rope-chain-22k-2"], listedAt: "2026-10-30", stockConfirmedAt: "2026-11-03",
  }),
  piece({
    slug: "22k-classic-curb-chain", code: "SA-0170", name: "22K Classic Curb Chain", category: "chains",
    purity: "22K", weightGrams: 24.2, makingCharge: { type: "per_gram", aed: 18 },
    price: "listed", shop: "sidra-atelier",
    occasions: ["daily"], wearer: "unisex", style: "italian",
    description: "Flat, interlocking curb links that lie close to the skin. 55 cm with a box clasp and safety catch.",
    images: ["curb-chain-22k-1", "curb-chain-22k-2"], listedAt: "2026-10-26", stockConfirmedAt: "2026-11-01",
  }),
  piece({
    slug: "22k-gold-bead-necklace", code: "SA-0156", name: "22K Gold Bead Necklace", category: "necklaces",
    purity: "22K", weightGrams: 21.4, makingCharge: { type: "percent", value: 8 },
    price: "indicative", shop: "sidra-atelier",
    occasions: ["festive", "daily"], style: "arabic",
    description: "Polished 5 mm beads strung close, 48 cm. A traditional piece that also works with everyday clothes.",
    images: ["bead-necklace-22k-1"], listedAt: "2026-11-02",
  }),
  piece({
    slug: "22k-coin-collar-necklace", code: "YG-0012", name: "22K Coin Collar Necklace", category: "necklaces",
    purity: "22K", weightGrams: 38.5, makingCharge: { type: "per_gram", aed: 28 },
    price: "indicative", shop: "yasmeen-gold",
    occasions: ["bridal", "festive"], style: "indian",
    description: "Nineteen small coins hung edge to edge below a bead strand: the coin necklace worn at Kerala and Gulf weddings.",
    images: ["bridal-collar-22k-1"], listedAt: "2026-11-03",
  }),
  piece({
    slug: "22k-layered-necklace", code: "YG-0019", name: "22K Two-Strand Layered Necklace", category: "necklaces",
    purity: "22K", weightGrams: 19.2, makingCharge: { type: "per_gram", aed: 22 },
    price: "listed", shop: "yasmeen-gold",
    occasions: ["bridal", "festive"], style: "contemporary",
    description: "A rope strand inside a fine cable strand, joined at one clasp, so they always sit apart.",
    images: ["layered-necklace-22k-1"], listedAt: "2026-10-28", stockConfirmedAt: "2026-11-02",
  }),
  piece({
    slug: "22k-long-haram-with-coin", code: "YG-0023", name: "22K Long Haram with Coin", category: "sets",
    purity: "22K", weightGrams: 46.8, makingCharge: { type: "percent", value: 10 },
    price: "on_request", shop: "yasmeen-gold",
    occasions: ["bridal"], style: "indian",
    description: "A long bead haram, 76 cm, ending in a star coin. Matching earrings are made to order, so the shop prices the set in person.",
    images: ["haram-necklace-22k-1"], listedAt: "2026-10-22", stockConfirmedAt: "2026-11-01",
  }),

  // ---- Rings -----------------------------------------------------------
  piece({
    slug: "22k-plain-wedding-bands", code: "YG-0036", name: "22K Plain Wedding Bands, pair", category: "rings",
    purity: "22K", weightGrams: 11.2, makingCharge: { type: "per_gram", aed: 15 },
    price: "indicative", shop: "yasmeen-gold",
    occasions: ["bridal"], wearer: "unisex",
    description: "Two comfort-fit bands, 4 mm and 5 mm wide. Sized and engraved in the shop.",
    images: ["plain-band-22k-1"], listedAt: "2026-10-12", stockConfirmedAt: "2026-10-30",
  }),
  piece({
    slug: "22k-teardrop-earrings", code: "YG-0041", name: "22K Teardrop Earrings", category: "earrings",
    purity: "22K", weightGrams: 6.2, stones: "One small round stone above each drop", makingCharge: { type: "percent", value: 10 },
    price: "indicative", shop: "yasmeen-gold",
    occasions: ["festive", "gift"], style: "turkish",
    description: "Polished teardrops on fine hooks, with a small set stone at the top of each.",
    images: ["drop-earrings-22k-1"], listedAt: "2026-10-23", stockConfirmedAt: "2026-10-31",
  }),
  piece({
    slug: "22k-twisted-hoop-earrings", code: "SA-0174", name: "22K Twisted Hoop Earrings", category: "earrings",
    purity: "22K", weightGrams: 4.4, makingCharge: { type: "per_gram", aed: 26 },
    price: "listed", shop: "sidra-atelier",
    occasions: ["daily", "gift"], style: "italian",
    description: "Small twisted hoops, 23 mm across, light enough to sleep in.",
    images: ["twisted-hoops-22k-1"], listedAt: "2026-10-27", stockConfirmedAt: "2026-11-02",
  }),
  piece({
    slug: "22k-star-coin-pendant", code: "SA-0161", name: "22K Star Coin Pendant", category: "pendants",
    purity: "22K", weightGrams: 5.6, makingCharge: { type: "fixed", aed: 300 },
    price: "listed", shop: "sidra-atelier",
    occasions: ["gift"], style: "arabic",
    description: "A 20 mm coin with a raised rim and an eight-point star. The price is for the pendant; the chain is shown for scale.",
    images: ["coin-pendant-22k-1"], listedAt: "2026-10-11", stockConfirmedAt: "2026-10-30",
  }),
  piece({
    slug: "22k-twisted-kada", code: "SA-0178", name: "22K Twisted Kada", category: "bangles",
    purity: "22K", weightGrams: 41.5, makingCharge: { type: "per_gram", aed: 26 },
    price: "indicative", shop: "sidra-atelier",
    occasions: ["festive"], wearer: "unisex", style: "indian",
    description: "A heavy kada with a hand-finished twist running all the way round. Single piece.",
    images: ["kada-bangle-22k-1"], listedAt: "2026-10-13", stockConfirmedAt: "2026-10-31",
  }),
  piece({
    slug: "22k-bridal-bangle-stack", code: "YG-0031", name: "22K Bridal Bangle Stack, set of 4", category: "bangles",
    purity: "22K", weightGrams: 54.0, makingCharge: { type: "per_gram", aed: 20 },
    price: "indicative", shop: "yasmeen-gold",
    occasions: ["bridal"], style: "indian",
    description: "Four slim polished bangles made as a set, sized together so they stack evenly.",
    images: ["bridal-bangle-stack-22k-1"], listedAt: "2026-10-29", stockConfirmedAt: "2026-11-03",
  }),
];

// ---------------------------------------------------------------------------
// The opening image
// ---------------------------------------------------------------------------
export const heroImage = {
  src: "hero",
  alt: "A 22K rope chain curving across pale stone, with an 18K solitaire ring standing in front of it and a plain bangle out of focus behind.",
  caption: "22K rope chain, Sidra Atelier · 18K solitaire, Layan Fine Jewellery",
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------
export const shopBySlug = new Map(shops.map((s) => [s.slug, s]));
export const pieceBySlug = new Map(pieces.map((p) => [p.slug, p]));
export const areaBySlug = new Map(areas.map((a) => [a.slug, a]));

export function shopFor(piece: Piece): Shop {
  const shop = shopBySlug.get(piece.shop);
  if (!shop) throw new Error(`Piece ${piece.slug} names unknown shop ${piece.shop}`);
  return shop;
}

export function areaFor(shop: Shop): Area {
  const area = areaBySlug.get(shop.area);
  if (!area) throw new Error(`Shop ${shop.slug} names unknown area ${shop.area}`);
  return area;
}

export const sectionOf = (p: Piece): Section => CATEGORIES.find((c) => c.id === p.category)!.section;
