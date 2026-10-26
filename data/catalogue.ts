// The demonstration catalogue.
//
// EVERYTHING IN THIS FILE IS DEMONSTRATION DATA. The jewellers are invented,
// the prices are illustrative and the images are 3D renders, not photographs
// of real stock. None of it is a real UAE business or a verified offer.
//
// To change the catalogue, edit the two arrays below. Images live in
// public/images/pieces/<image>.jpg (+ .webp and -600 sizes); see README.

export type Category = "chains" | "necklaces" | "rings" | "earrings" | "pendants" | "bangles";
export type Purity = "24K" | "22K" | "21K" | "18K";

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

export type Shop = {
  slug: string;
  name: string;
  area: string;
  emirate: Emirate;
  about: string;
  hours?: string;
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
  weightGrams?: number;
  makingCharge?: MakingCharge;
  stones?: string;
  price: Price;
  shop: string;
  description: string;
  /** Base names in public/images/pieces, first is the cover. */
  images: string[];
  /** ISO date the piece was listed; drives "Newest". */
  listedAt: string;
  demo: boolean;
};

export const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah"] as const;
export type Emirate = (typeof EMIRATES)[number];

export const CATEGORIES: { id: Category; label: string; singular: string }[] = [
  { id: "chains", label: "Chains", singular: "Chain" },
  { id: "necklaces", label: "Necklaces", singular: "Necklace" },
  { id: "rings", label: "Rings", singular: "Ring" },
  { id: "earrings", label: "Earrings", singular: "Earrings" },
  { id: "pendants", label: "Pendants", singular: "Pendant" },
  { id: "bangles", label: "Bangles", singular: "Bangle" },
];

export const shops: Shop[] = [
  {
    slug: "sidra-atelier",
    name: "Sidra Atelier",
    area: "Deira",
    emirate: "Dubai",
    about: "A small workshop near the gold souk making traditional 22K chains and bead work, alongside a few lighter pieces in 18K.",
    hours: "Sat–Thu 10:00–22:00 · Fri 16:00–22:00",
    cover: "22k-star-coin-pendant",
    demo: true,
  },
  {
    slug: "qamar-gold-house",
    name: "Qamar Gold House",
    area: "Karama",
    emirate: "Dubai",
    about: "Heavier everyday gold: curb chains, plain bands and bangles, sold by weight with the making charge stated up front.",
    hours: "Daily 10:00–22:30",
    cover: "22k-plain-bangles",
    demo: true,
  },
  {
    slug: "layan-fine-jewellery",
    name: "Layan Fine Jewellery",
    area: "Hamdan Street",
    emirate: "Abu Dhabi",
    about: "18K pieces with stones and pearls, for gifts and engagements. Most prices are given on request because stones vary.",
    hours: "Sat–Thu 10:00–21:30",
    cover: "18k-solitaire-ring",
    demo: true,
  },
  {
    slug: "falaj-goldsmiths",
    name: "Falaj Goldsmiths",
    area: "Rolla",
    emirate: "Sharjah",
    about: "A family goldsmith in Rolla working mostly in 21K and 22K: rope work, kadas and earrings made on the premises.",
    hours: "Sat–Thu 09:30–22:00 · Fri 16:30–22:00",
    cover: "22k-twisted-kada",
    demo: true,
  },
];

export const pieces: Piece[] = [
  {
    slug: "22k-rope-chain",
    code: "SA-0142",
    name: "22K Rope Chain",
    category: "chains",
    purity: "22K",
    weightGrams: 18.6,
    makingCharge: { type: "per_gram", aed: 24 },
    price: { kind: "indicative", aed: 8450, asOf: "2026-10-20" },
    shop: "sidra-atelier",
    description: "A tightly twisted rope chain, 50 cm, with a lobster clasp. Heavy enough to wear on its own, fine enough to take a pendant.",
    images: ["rope-chain-22k-1", "rope-chain-22k-2"],
    listedAt: "2026-10-20",
    demo: true,
  },
  {
    slug: "22k-classic-curb-chain",
    code: "QG-0318",
    name: "22K Classic Curb Chain",
    category: "chains",
    purity: "22K",
    weightGrams: 24.2,
    makingCharge: { type: "per_gram", aed: 18 },
    price: { kind: "listed", aed: 11200 },
    shop: "qamar-gold-house",
    description: "Flat, interlocking curb links that lie close to the skin. 55 cm with a box clasp and safety catch.",
    images: ["curb-chain-22k-1", "curb-chain-22k-2"],
    listedAt: "2026-10-18",
    demo: true,
  },
  {
    slug: "18k-fine-cable-chain",
    code: "LF-0027",
    name: "18K Fine Cable Chain",
    category: "chains",
    purity: "18K",
    weightGrams: 6.1,
    makingCharge: { type: "fixed", aed: 260 },
    price: { kind: "listed", aed: 2380 },
    shop: "layan-fine-jewellery",
    description: "A light, open cable chain, 45 cm. Made to carry a small pendant without competing with it.",
    images: ["cable-chain-18k-1"],
    listedAt: "2026-10-09",
    demo: true,
  },
  {
    slug: "22k-gold-bead-necklace",
    code: "SA-0156",
    name: "22K Gold Bead Necklace",
    category: "necklaces",
    purity: "22K",
    weightGrams: 21.4,
    makingCharge: { type: "percent", value: 8 },
    price: { kind: "indicative", aed: 9750, asOf: "2026-10-20" },
    shop: "sidra-atelier",
    description: "Polished 5 mm beads strung close, 48 cm. A traditional piece that also works with everyday clothes.",
    images: ["bead-necklace-22k-1"],
    listedAt: "2026-10-21",
    demo: true,
  },
  {
    slug: "18k-pearl-and-gold-necklace",
    code: "LF-0031",
    name: "18K Pearl and Gold Necklace",
    category: "necklaces",
    purity: "18K",
    weightGrams: 9.8,
    stones: "Freshwater pearls, 6 mm",
    price: { kind: "on_request" },
    shop: "layan-fine-jewellery",
    description: "Freshwater pearls alternating with small 18K beads. Pearl quality varies between strands, so the shop prices each one in person.",
    images: ["pearl-gold-necklace-18k-1"],
    listedAt: "2026-10-15",
    demo: true,
  },
  {
    slug: "21k-rope-necklace",
    code: "FG-0204",
    name: "21K Rope Necklace",
    category: "necklaces",
    purity: "21K",
    weightGrams: 27.9,
    makingCharge: { type: "per_gram", aed: 20 },
    price: { kind: "indicative", aed: 11900, asOf: "2026-10-19" },
    shop: "falaj-goldsmiths",
    description: "A broad, open-twist rope worn as a necklace rather than a chain. 46 cm, made in the shop's own workshop.",
    images: ["rope-necklace-21k-1"],
    listedAt: "2026-10-19",
    demo: true,
  },
  {
    slug: "18k-solitaire-ring",
    code: "LF-0012",
    name: "18K Solitaire Ring",
    category: "rings",
    purity: "18K",
    weightGrams: 2.9,
    stones: "Round brilliant diamond, 0.30 ct, as described by the jeweller",
    price: { kind: "listed", aed: 4950 },
    shop: "layan-fine-jewellery",
    description: "A slim band with a four-claw basket setting. Resizing is done in the shop.",
    images: ["solitaire-ring-18k-1", "solitaire-ring-18k-2"],
    listedAt: "2026-10-22",
    demo: true,
  },
  {
    slug: "22k-plain-wedding-bands",
    code: "QG-0322",
    name: "22K Plain Wedding Bands, pair",
    category: "rings",
    purity: "22K",
    weightGrams: 11.2,
    makingCharge: { type: "per_gram", aed: 15 },
    price: { kind: "indicative", aed: 4880, asOf: "2026-10-18" },
    shop: "qamar-gold-house",
    description: "Two comfort-fit bands, 4 mm and 5 mm wide. Sized and engraved in the shop.",
    images: ["plain-band-22k-1"],
    listedAt: "2026-10-12",
    demo: true,
  },
  {
    slug: "21k-signet-ring",
    code: "FG-0211",
    name: "21K Signet Ring",
    category: "rings",
    purity: "21K",
    weightGrams: 8.4,
    makingCharge: { type: "fixed", aed: 420 },
    price: { kind: "listed", aed: 3690 },
    shop: "falaj-goldsmiths",
    description: "An oval signet with a polished, unengraved face, ready for initials.",
    images: ["signet-ring-21k-1"],
    listedAt: "2026-10-05",
    demo: true,
  },
  {
    slug: "22k-classic-hoop-earrings",
    code: "QG-0330",
    name: "22K Classic Hoop Earrings",
    category: "earrings",
    purity: "22K",
    weightGrams: 7.9,
    makingCharge: { type: "per_gram", aed: 22 },
    price: { kind: "listed", aed: 3450 },
    shop: "qamar-gold-house",
    description: "Rounded hoops, 22 mm across, with a hinged post. A pair.",
    images: ["hoop-earrings-22k-1"],
    listedAt: "2026-10-16",
    demo: true,
  },
  {
    slug: "22k-teardrop-earrings",
    code: "FG-0219",
    name: "22K Teardrop Earrings",
    category: "earrings",
    purity: "22K",
    weightGrams: 6.2,
    stones: "One small round stone above each drop",
    makingCharge: { type: "percent", value: 10 },
    price: { kind: "indicative", aed: 2790, asOf: "2026-10-19" },
    shop: "falaj-goldsmiths",
    description: "Polished teardrops on fine hooks, with a small set stone at the top of each.",
    images: ["drop-earrings-22k-1"],
    listedAt: "2026-10-23",
    demo: true,
  },
  {
    slug: "18k-pearl-drop-earrings",
    code: "LF-0036",
    name: "18K Pearl Drop Earrings",
    category: "earrings",
    purity: "18K",
    weightGrams: 3.1,
    stones: "Freshwater pearls, 7 mm",
    price: { kind: "listed", aed: 1640 },
    shop: "layan-fine-jewellery",
    description: "A single pearl on each hook, below a small set stone. Light enough for every day.",
    images: ["pearl-drop-earrings-18k-1"],
    listedAt: "2026-10-14",
    demo: true,
  },
  {
    slug: "22k-star-coin-pendant",
    code: "SA-0161",
    name: "22K Star Coin Pendant",
    category: "pendants",
    purity: "22K",
    weightGrams: 5.6,
    makingCharge: { type: "fixed", aed: 300 },
    price: { kind: "listed", aed: 2560 },
    shop: "sidra-atelier",
    description: "A 20 mm coin with a raised rim and an eight-point star. The price is for the pendant; the chain is shown for scale.",
    images: ["coin-pendant-22k-1"],
    listedAt: "2026-10-11",
    demo: true,
  },
  {
    slug: "18k-emerald-oval-pendant",
    code: "LF-0040",
    name: "18K Emerald Oval Pendant",
    category: "pendants",
    purity: "18K",
    weightGrams: 3.8,
    stones: "Oval green emerald, as described by the jeweller",
    price: { kind: "on_request" },
    shop: "layan-fine-jewellery",
    description: "An oval green stone in a polished bezel, on a fine 18K chain. Priced on request because the stone is chosen in the shop.",
    images: ["emerald-pendant-18k-1"],
    listedAt: "2026-10-08",
    demo: true,
  },
  {
    slug: "22k-plain-bangles",
    code: "QG-0341",
    name: "22K Plain Bangles, pair",
    category: "bangles",
    purity: "22K",
    weightGrams: 32.0,
    makingCharge: { type: "per_gram", aed: 14 },
    price: { kind: "indicative", aed: 14300, asOf: "2026-10-18" },
    shop: "qamar-gold-house",
    description: "Two round, polished bangles, 2.6 inch size. Other sizes are made to order.",
    images: ["plain-bangles-22k-1"],
    listedAt: "2026-10-17",
    demo: true,
  },
  {
    slug: "22k-twisted-kada",
    code: "FG-0226",
    name: "22K Twisted Kada",
    category: "bangles",
    purity: "22K",
    weightGrams: 41.5,
    makingCharge: { type: "per_gram", aed: 26 },
    price: { kind: "indicative", aed: 18600, asOf: "2026-10-19" },
    shop: "falaj-goldsmiths",
    description: "A heavy kada with a hand-finished twist running all the way round. Single piece.",
    images: ["kada-bangle-22k-1"],
    listedAt: "2026-10-13",
    demo: true,
  },
];

export const heroImage = {
  src: "hero",
  alt: "A 22K rope chain curving across pale stone, with an 18K solitaire ring standing in front of it and a plain bangle out of focus behind.",
  caption: "22K rope chain, Sidra Atelier · 18K solitaire, Layan Fine Jewellery",
};

export const shopBySlug = new Map(shops.map((s) => [s.slug, s]));
export const pieceBySlug = new Map(pieces.map((p) => [p.slug, p]));

export function shopFor(piece: Piece): Shop {
  const shop = shopBySlug.get(piece.shop);
  if (!shop) throw new Error(`Piece ${piece.slug} names unknown shop ${piece.shop}`);
  return shop;
}
