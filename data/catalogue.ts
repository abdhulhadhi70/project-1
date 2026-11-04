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
    slug: "qamar-gold-house", name: "Qamar Gold House", area: "karama",
    address: "Block 3, Karama Centre, Dubai", lat: 25.2464, lng: 55.3022,
    about: "Heavier everyday gold: curb chains, plain bands and bangles, sold by weight with the making charge stated up front.",
    hours: "Daily 10:00–22:30", languages: ["English", "Hindi", "Urdu"],
    speciality: "Everyday gold by weight", cover: "22k-plain-bangles", demo: true,
  },
  {
    slug: "layan-fine-jewellery", name: "Layan Fine Jewellery", area: "hamdan-street",
    address: "Hamdan Bin Mohammed Street, Abu Dhabi", lat: 24.4925, lng: 54.3712,
    about: "18K pieces with stones and pearls, for gifts and engagements. Most stone prices are given on request because stones vary.",
    hours: "Sat–Thu 10:00–21:30", languages: ["Arabic", "English", "Tagalog"],
    speciality: "Stones, pearls and engagement rings", cover: "18k-solitaire-ring", demo: true,
  },
  {
    slug: "falaj-goldsmiths", name: "Falaj Goldsmiths", area: "rolla",
    address: "Near Rolla Square, Sharjah", lat: 25.3569, lng: 55.3898,
    about: "A family goldsmith in Rolla working mostly in 21K and 22K: rope work, kadas and earrings made on the premises.",
    hours: "Sat–Thu 09:30–22:00 · Fri 16:30–22:00", languages: ["Arabic", "English", "Urdu"],
    speciality: "Made on the premises", cover: "22k-twisted-kada", demo: true,
  },
  {
    slug: "yasmeen-gold", name: "Yasmeen Gold", area: "meena-bazaar",
    address: "Meena Bazaar, Bur Dubai", lat: 25.2608, lng: 55.2959,
    about: "Bridal sets, coin necklaces and stacked bangles in 22K, with fittings for the wedding day booked in advance.",
    hours: "Daily 10:00–23:00", languages: ["English", "Hindi", "Malayalam", "Tamil"],
    speciality: "Bridal sets and coin necklaces", cover: "22k-coin-collar-necklace", demo: true,
  },
  {
    slug: "majlis-bullion", name: "Majlis Bullion", area: "gold-diamond-park",
    address: "Gold & Diamond Park, Al Quoz, Dubai", lat: 25.1376, lng: 55.2201,
    about: "Coins and bars only, from 5 g to the 10-tola bar, priced from the day's rate with the premium shown separately.",
    hours: "Sat–Thu 10:00–20:00", languages: ["Arabic", "English", "Hindi"],
    speciality: "Coins and bars", cover: "24k-gold-bar-10g", demo: true,
  },
  {
    slug: "ghaf-jewellers", name: "Ghaf Jewellers", area: "central-souk",
    address: "Ground floor, Central Souk, Sharjah", lat: 25.3271, lng: 55.3858,
    about: "Men's gold first: bracelets, wide bands and heavy chains, plus a short line of slim kadas.",
    hours: "Sat–Thu 10:00–22:00 · Fri 16:00–22:00", languages: ["Arabic", "English", "Persian"],
    speciality: "Men's gold", cover: "22k-mens-curb-bracelet", demo: true,
  },
  {
    slug: "bayan-gold", name: "Bayan Gold", area: "madinat-zayed",
    address: "First floor, Madinat Zayed Gold Centre, Abu Dhabi", lat: 24.4874, lng: 54.3784,
    about: "Light pieces for every day and for children: studs, anklets, small bangles and bracelets, most under 10 g.",
    hours: "Sat–Thu 10:00–22:00", languages: ["Arabic", "English", "Malayalam", "Bengali"],
    speciality: "Light everyday and kids' pieces", cover: "22k-twisted-hoop-earrings", demo: true,
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
    slug: "22k-classic-curb-chain", code: "QG-0318", name: "22K Classic Curb Chain", category: "chains",
    purity: "22K", weightGrams: 24.2, makingCharge: { type: "per_gram", aed: 18 },
    price: "listed", shop: "qamar-gold-house",
    occasions: ["daily"], wearer: "unisex", style: "italian",
    description: "Flat, interlocking curb links that lie close to the skin. 55 cm with a box clasp and safety catch.",
    images: ["curb-chain-22k-1", "curb-chain-22k-2"], listedAt: "2026-10-26", stockConfirmedAt: "2026-11-01",
  }),
  piece({
    slug: "18k-fine-cable-chain", code: "LF-0027", name: "18K Fine Cable Chain", category: "chains",
    purity: "18K", weightGrams: 6.1, makingCharge: { type: "fixed", aed: 260 },
    price: "listed", shop: "layan-fine-jewellery",
    occasions: ["daily", "gift"], style: "contemporary",
    description: "A light, open cable chain, 45 cm. Made to carry a small pendant without competing with it.",
    images: ["cable-chain-18k-1"], listedAt: "2026-10-09", stockConfirmedAt: "2026-10-28",
  }),
  piece({
    slug: "21k-heavy-rope-chain", code: "GJ-0104", name: "21K Heavy Rope Chain", category: "chains",
    purity: "21K", weightGrams: 42.0, makingCharge: { type: "per_gram", aed: 16 },
    price: "indicative", shop: "ghaf-jewellers",
    occasions: ["daily"], wearer: "men", style: "arabic",
    description: "A broad rope chain for men, 60 cm, with a reinforced box clasp.",
    images: ["mens-rope-chain-21k-1"], listedAt: "2026-11-01", stockConfirmedAt: "2026-11-03",
  }),

  // ---- Necklaces and sets ----------------------------------------------
  piece({
    slug: "22k-gold-bead-necklace", code: "SA-0156", name: "22K Gold Bead Necklace", category: "necklaces",
    purity: "22K", weightGrams: 21.4, makingCharge: { type: "percent", value: 8 },
    price: "indicative", shop: "sidra-atelier",
    occasions: ["festive", "daily"], style: "arabic",
    description: "Polished 5 mm beads strung close, 48 cm. A traditional piece that also works with everyday clothes.",
    images: ["bead-necklace-22k-1"], listedAt: "2026-11-02",
  }),
  piece({
    slug: "18k-pearl-and-gold-necklace", code: "LF-0031", name: "18K Pearl and Gold Necklace", category: "necklaces",
    purity: "18K", weightGrams: 9.8, stones: "Freshwater pearls, 6 mm",
    price: "on_request", shop: "layan-fine-jewellery",
    occasions: ["gift", "engagement"], style: "contemporary",
    description: "Freshwater pearls alternating with small 18K beads. Pearl quality varies between strands, so the shop prices each one in person.",
    images: ["pearl-gold-necklace-18k-1"], listedAt: "2026-10-15", stockConfirmedAt: "2026-10-30",
  }),
  piece({
    slug: "21k-rope-necklace", code: "FG-0204", name: "21K Rope Necklace", category: "necklaces",
    purity: "21K", weightGrams: 27.9, makingCharge: { type: "per_gram", aed: 20 },
    price: "indicative", shop: "falaj-goldsmiths",
    occasions: ["festive"], style: "arabic",
    description: "A broad, open-twist rope worn as a necklace rather than a chain. 46 cm, made in the shop's own workshop.",
    images: ["rope-necklace-21k-1"], listedAt: "2026-10-19", stockConfirmedAt: "2026-10-31",
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
    slug: "18k-solitaire-ring", code: "LF-0012", name: "18K Solitaire Ring", category: "rings",
    purity: "18K", weightGrams: 2.9, stones: "Round brilliant diamond, 0.30 ct, as described by the jeweller",
    makingCharge: { type: "fixed", aed: 450 }, stonesAed: 3200, price: "listed", shop: "layan-fine-jewellery",
    occasions: ["engagement", "bridal"], style: "contemporary",
    description: "A slim band with a four-claw basket setting. Resizing is done in the shop.",
    images: ["solitaire-ring-18k-1", "solitaire-ring-18k-2"], listedAt: "2026-11-01", stockConfirmedAt: "2026-11-03",
  }),
  piece({
    slug: "22k-plain-wedding-bands", code: "QG-0322", name: "22K Plain Wedding Bands, pair", category: "rings",
    purity: "22K", weightGrams: 11.2, makingCharge: { type: "per_gram", aed: 15 },
    price: "indicative", shop: "qamar-gold-house",
    occasions: ["bridal"], wearer: "unisex",
    description: "Two comfort-fit bands, 4 mm and 5 mm wide. Sized and engraved in the shop.",
    images: ["plain-band-22k-1"], listedAt: "2026-10-12", stockConfirmedAt: "2026-10-30",
  }),
  piece({
    slug: "21k-signet-ring", code: "FG-0211", name: "21K Signet Ring", category: "rings",
    purity: "21K", weightGrams: 8.4, makingCharge: { type: "fixed", aed: 420 },
    price: "listed", shop: "falaj-goldsmiths",
    occasions: ["gift"], wearer: "unisex", style: "arabic",
    description: "An oval signet with a polished, unengraved face, ready for initials.",
    images: ["signet-ring-21k-1"], listedAt: "2026-10-05", stockConfirmedAt: "2026-10-27",
  }),
  piece({
    slug: "21k-mens-wide-band", code: "GJ-0110", name: "21K Men's Wide Band", category: "rings",
    purity: "21K", weightGrams: 12.6, makingCharge: { type: "per_gram", aed: 14 },
    price: "listed", shop: "ghaf-jewellers",
    occasions: ["daily", "bridal"], wearer: "men",
    description: "A 7 mm flat-topped band with a comfort-fit inside. Engraving inside is free.",
    images: ["mens-band-21k-1"], listedAt: "2026-10-24", stockConfirmedAt: "2026-11-02",
  }),

  // ---- Earrings --------------------------------------------------------
  piece({
    slug: "22k-classic-hoop-earrings", code: "QG-0330", name: "22K Classic Hoop Earrings", category: "earrings",
    purity: "22K", weightGrams: 7.9, makingCharge: { type: "per_gram", aed: 22 },
    price: "listed", shop: "qamar-gold-house",
    occasions: ["daily"],
    description: "Rounded hoops, 22 mm across, with a hinged post. A pair.",
    images: ["hoop-earrings-22k-1"], listedAt: "2026-10-16", stockConfirmedAt: "2026-11-01",
  }),
  piece({
    slug: "22k-teardrop-earrings", code: "FG-0219", name: "22K Teardrop Earrings", category: "earrings",
    purity: "22K", weightGrams: 6.2, stones: "One small round stone above each drop", makingCharge: { type: "percent", value: 10 },
    price: "indicative", shop: "falaj-goldsmiths",
    occasions: ["festive", "gift"], style: "turkish",
    description: "Polished teardrops on fine hooks, with a small set stone at the top of each.",
    images: ["drop-earrings-22k-1"], listedAt: "2026-10-23", stockConfirmedAt: "2026-10-31",
  }),
  piece({
    slug: "18k-pearl-drop-earrings", code: "LF-0036", name: "18K Pearl Drop Earrings", category: "earrings",
    purity: "18K", weightGrams: 3.1, stones: "Freshwater pearls, 7 mm",
    makingCharge: { type: "fixed", aed: 180 }, stonesAed: 160, price: "listed", shop: "layan-fine-jewellery",
    occasions: ["gift", "daily"], style: "contemporary",
    description: "A single pearl on each hook, below a small set stone. Light enough for every day.",
    images: ["pearl-drop-earrings-18k-1"], listedAt: "2026-10-14", stockConfirmedAt: "2026-10-29",
  }),
  piece({
    slug: "22k-twisted-hoop-earrings", code: "BG-0041", name: "22K Twisted Hoop Earrings", category: "earrings",
    purity: "22K", weightGrams: 4.4, makingCharge: { type: "per_gram", aed: 26 },
    price: "listed", shop: "bayan-gold",
    occasions: ["daily", "gift"], style: "italian",
    description: "Small twisted hoops, 23 mm across, light enough to sleep in.",
    images: ["twisted-hoops-22k-1"], listedAt: "2026-10-27", stockConfirmedAt: "2026-11-02",
  }),
  piece({
    slug: "18k-gold-ball-studs", code: "BG-0045", name: "18K Gold Ball Studs", category: "earrings",
    purity: "18K", weightGrams: 1.6, makingCharge: { type: "fixed", aed: 90 },
    price: "listed", shop: "bayan-gold",
    occasions: ["daily", "gift"], wearer: "kids",
    description: "5 mm polished balls with screw backs, so they stay in. Sized for children and small ears.",
    images: ["ball-studs-18k-1"], listedAt: "2026-10-20", stockConfirmedAt: "2026-11-01",
  }),

  // ---- Pendants --------------------------------------------------------
  piece({
    slug: "22k-star-coin-pendant", code: "SA-0161", name: "22K Star Coin Pendant", category: "pendants",
    purity: "22K", weightGrams: 5.6, makingCharge: { type: "fixed", aed: 300 },
    price: "listed", shop: "sidra-atelier",
    occasions: ["gift"], style: "arabic",
    description: "A 20 mm coin with a raised rim and an eight-point star. The price is for the pendant; the chain is shown for scale.",
    images: ["coin-pendant-22k-1"], listedAt: "2026-10-11", stockConfirmedAt: "2026-10-30",
  }),
  piece({
    slug: "18k-emerald-oval-pendant", code: "LF-0040", name: "18K Emerald Oval Pendant", category: "pendants",
    purity: "18K", weightGrams: 3.8, stones: "Oval green emerald, as described by the jeweller",
    price: "on_request", shop: "layan-fine-jewellery",
    occasions: ["gift", "engagement"], style: "contemporary",
    description: "An oval green stone in a polished bezel, on a fine 18K chain. Priced on request because the stone is chosen in the shop.",
    images: ["emerald-pendant-18k-1"], listedAt: "2026-10-08", stockConfirmedAt: "2026-10-26",
  }),
  piece({
    slug: "18k-ruby-oval-pendant", code: "BG-0050", name: "18K Ruby Oval Pendant", category: "pendants",
    purity: "18K", weightGrams: 3.6, stones: "Oval red stone, as described by the jeweller",
    makingCharge: { type: "fixed", aed: 240 }, stonesAed: 520, price: "listed", shop: "bayan-gold",
    occasions: ["gift"], style: "contemporary",
    description: "A deep red oval in a polished bezel, on a fine cable chain. Chain included.",
    images: ["ruby-pendant-18k-1"], listedAt: "2026-10-31", stockConfirmedAt: "2026-11-03",
  }),

  // ---- Bangles, bracelets, anklets ------------------------------------
  piece({
    slug: "22k-plain-bangles", code: "QG-0341", name: "22K Plain Bangles, pair", category: "bangles",
    purity: "22K", weightGrams: 32.0, makingCharge: { type: "per_gram", aed: 14 },
    price: "indicative", shop: "qamar-gold-house",
    occasions: ["daily", "bridal"],
    description: "Two round, polished bangles, 2.6 inch size. Other sizes are made to order.",
    images: ["plain-bangles-22k-1"], listedAt: "2026-10-17", stockConfirmedAt: "2026-10-30",
  }),
  piece({
    slug: "22k-twisted-kada", code: "FG-0226", name: "22K Twisted Kada", category: "bangles",
    purity: "22K", weightGrams: 41.5, makingCharge: { type: "per_gram", aed: 26 },
    price: "indicative", shop: "falaj-goldsmiths",
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
  piece({
    slug: "21k-slim-kadas", code: "GJ-0118", name: "21K Slim Twisted Kadas, pair", category: "bangles",
    purity: "21K", weightGrams: 29.4, makingCharge: { type: "per_gram", aed: 18 },
    price: "listed", shop: "ghaf-jewellers",
    occasions: ["daily", "festive"], wearer: "unisex", style: "arabic",
    description: "Two slimmer kadas with a fine twist, worn as a pair or one on each wrist.",
    images: ["slim-kadas-21k-1"], listedAt: "2026-10-18", stockConfirmedAt: "2026-11-01",
  }),
  piece({
    slug: "22k-kids-bangles", code: "BG-0052", name: "22K Kids' Bangles, pair", category: "bangles",
    purity: "22K", weightGrams: 9.6, makingCharge: { type: "per_gram", aed: 18 },
    price: "listed", shop: "bayan-gold",
    occasions: ["gift"], wearer: "kids",
    description: "A pair of small round bangles, 1.8 inch, with rounded edges for small wrists.",
    images: ["kids-bangles-22k-1"], listedAt: "2026-10-25", stockConfirmedAt: "2026-11-02",
  }),
  piece({
    slug: "22k-mens-curb-bracelet", code: "GJ-0101", name: "22K Men's Curb Bracelet", category: "bracelets",
    purity: "22K", weightGrams: 34.8, makingCharge: { type: "per_gram", aed: 16 },
    price: "indicative", shop: "ghaf-jewellers",
    occasions: ["daily"], wearer: "men", style: "italian",
    description: "Heavy flat curb links, 21 cm, with a box clasp and two safety catches.",
    images: ["mens-curb-bracelet-22k-1"], listedAt: "2026-11-02", stockConfirmedAt: "2026-11-03",
  }),
  piece({
    slug: "18k-link-bracelet", code: "BG-0058", name: "18K Link Bracelet", category: "bracelets",
    purity: "18K", weightGrams: 5.2, makingCharge: { type: "fixed", aed: 240 },
    price: "listed", shop: "bayan-gold",
    occasions: ["daily", "gift"], style: "contemporary",
    description: "An open cable bracelet, 18 cm with an extender, light enough for every day.",
    images: ["link-bracelet-18k-1"], listedAt: "2026-10-21", stockConfirmedAt: "2026-10-31",
  }),
  piece({
    slug: "22k-ball-anklet", code: "BG-0061", name: "22K Ball Anklet", category: "anklets",
    purity: "22K", weightGrams: 6.8, makingCharge: { type: "per_gram", aed: 24 },
    price: "listed", shop: "bayan-gold",
    occasions: ["daily", "festive"], style: "indian",
    description: "Small polished balls on a fine wire, 25 cm. Sold singly; pairs to order.",
    images: ["ball-anklet-22k-1"], listedAt: "2026-10-19", stockConfirmedAt: "2026-10-30",
  }),

  // ---- Coins and bars --------------------------------------------------
  piece({
    slug: "24k-gold-bar-10g", code: "MB-0010", name: "24K Gold Bar, 10 g", category: "bars",
    purity: "24K", fineness: "999.9", weightGrams: 10, makingCharge: { type: "fixed", aed: 95 },
    price: "indicative", shop: "majlis-bullion",
    occasions: ["investment", "gift"], wearer: "unisex",
    description: "A minted 10 g bar in a sealed card with its serial number. The premium over the gold value is shown as the making charge.",
    images: ["minted-bar-10g-24k-1"], listedAt: "2026-11-03",
  }),
  piece({
    slug: "24k-gold-bar-1oz", code: "MB-0031", name: "24K Gold Bar, 1 oz", category: "bars",
    purity: "24K", fineness: "999.9", weightGrams: 31.1, makingCharge: { type: "fixed", aed: 160 },
    price: "indicative", shop: "majlis-bullion",
    occasions: ["investment"], wearer: "unisex",
    description: "A minted one-ounce bar (31.1 g) in a sealed card with its serial number.",
    images: ["minted-bar-1oz-24k-1"], listedAt: "2026-11-03",
  }),
  piece({
    slug: "24k-gold-bars-5g-pair", code: "MB-0005", name: "24K Gold Bars, 5 g, pair", category: "bars",
    purity: "24K", fineness: "999.9", weightGrams: 10, makingCharge: { type: "fixed", aed: 140 },
    price: "indicative", shop: "majlis-bullion",
    occasions: ["gift", "investment"], wearer: "unisex",
    description: "Two 5 g minted bars, each sealed. Often bought as a wedding or newborn gift.",
    images: ["minted-bars-5g-24k-1"], listedAt: "2026-10-29", stockConfirmedAt: "2026-11-03",
  }),
  piece({
    slug: "24k-ten-tola-bar", code: "MB-0116", name: "24K Ten Tola Bar (116.6 g)", category: "bars",
    purity: "24K", fineness: "999", weightGrams: 116.64, makingCharge: { type: "fixed", aed: 280 },
    price: "indicative", shop: "majlis-bullion",
    occasions: ["investment"], wearer: "unisex",
    description: "The traditional cast 10-tola bar, the standard trading size in the Gulf. Sold against the day's rate.",
    images: ["tt-bar-24k-1"], listedAt: "2026-10-27", stockConfirmedAt: "2026-11-03",
  }),
  piece({
    slug: "22k-gold-coin-8g", code: "MB-0208", name: "22K Gold Coin, 8 g", category: "coins",
    purity: "22K", weightGrams: 8, makingCharge: { type: "fixed", aed: 110 },
    price: "indicative", shop: "majlis-bullion",
    occasions: ["gift", "investment"], wearer: "unisex",
    description: "An 8 g coin with a reeded edge, the size traditionally given at weddings and births.",
    images: ["bullion-coin-22k-1"], listedAt: "2026-10-31", stockConfirmedAt: "2026-11-03",
  }),
  piece({
    slug: "24k-gold-coins-quarter-oz", code: "MB-0225", name: "24K Gold Coins, ¼ oz, set of 4", category: "coins",
    purity: "24K", fineness: "999.9", weightGrams: 31.1, makingCharge: { type: "fixed", aed: 360 },
    price: "indicative", shop: "majlis-bullion",
    occasions: ["investment", "gift"], wearer: "unisex",
    description: "Four quarter-ounce coins (7.78 g each). Sold together or one at a time.",
    images: ["bullion-coins-24k-1"], listedAt: "2026-10-24", stockConfirmedAt: "2026-11-02",
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
