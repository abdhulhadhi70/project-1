// Search, filters and sorting for the catalogue. Pure functions over the
// data so they can be tested and later swapped for a database query with
// the same shape.
import {
  CATEGORIES, EMIRATES, type Category, type Piece, type Purity, type Shop, pieces as allPieces, shopFor, shops,
} from "@/data/catalogue";

export const PRICE_BANDS = [
  { id: "under-2000", label: "Under AED 2,000", min: 0, max: 2000 },
  { id: "2000-5000", label: "AED 2,000 – 5,000", min: 2000, max: 5000 },
  { id: "5000-10000", label: "AED 5,000 – 10,000", min: 5000, max: 10000 },
  { id: "over-10000", label: "Over AED 10,000", min: 10000, max: Infinity },
] as const;
export type PriceBand = (typeof PRICE_BANDS)[number]["id"];

export const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
] as const;
export type Sort = (typeof SORTS)[number]["id"];

export type Query = {
  q: string;
  category: Category | null;
  price: PriceBand | null;
  purity: Purity[];
  /** "dubai", or an area within it: "dubai/deira" */
  location: string | null;
  shop: string | null;
  sort: Sort;
};

export const EMPTY_QUERY: Query = {
  q: "", category: null, price: null, purity: [], location: null, shop: null, sort: "newest",
};

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------------------------------------------------------------------------
// Options that exist in the data. A filter with nothing behind it is not shown.
// ---------------------------------------------------------------------------
const PURITY_ORDER: Purity[] = ["24K", "22K", "21K", "18K"];
export const purityOptions: Purity[] = PURITY_ORDER.filter((p) => allPieces.some((x) => x.purity === p));

export type LocationOption = { id: string; label: string; areas: { id: string; label: string }[] };
export const locationOptions: LocationOption[] = EMIRATES
  .map((emirate) => {
    const areas = [...new Set(shops.filter((s) => s.emirate === emirate).map((s) => s.area))];
    return {
      id: slug(emirate),
      label: emirate,
      areas: areas.map((a) => ({ id: `${slug(emirate)}/${slug(a)}`, label: a })),
    };
  })
  .filter((o) => o.areas.length > 0);

export function locationLabel(id: string | null): string {
  if (!id) return "All UAE";
  for (const e of locationOptions) {
    if (e.id === id) return e.label;
    const a = e.areas.find((x) => x.id === id);
    if (a) return `${a.label}, ${e.label}`;
  }
  return "All UAE";
}

export const priceBandsInUse = PRICE_BANDS.filter((b) =>
  allPieces.some((p) => p.price.kind !== "on_request" && p.price.aed >= b.min && p.price.aed < b.max),
);

// ---------------------------------------------------------------------------
// URL <-> query
// ---------------------------------------------------------------------------
const isCategory = (v: string | null): v is Category => CATEGORIES.some((c) => c.id === v);
const isBand = (v: string | null): v is PriceBand => PRICE_BANDS.some((b) => b.id === v);
const isSort = (v: string | null): v is Sort => SORTS.some((s) => s.id === v);
const isPurity = (v: string): v is Purity => (PURITY_ORDER as string[]).includes(v);

export function parseQuery(params: URLSearchParams): Query {
  const cat = params.get("category");
  const price = params.get("price");
  const sort = params.get("sort");
  const loc = params.get("location");
  const shop = params.get("shop");
  return {
    q: (params.get("q") ?? "").slice(0, 80),
    category: isCategory(cat) ? cat : null,
    price: isBand(price) ? price : null,
    purity: (params.get("purity") ?? "").split(",").map((s) => s.toUpperCase()).filter(isPurity),
    location: loc && locationLabel(loc) !== "All UAE" ? loc : null,
    shop: shop && shops.some((s) => s.slug === shop) ? shop : null,
    sort: isSort(sort) ? sort : "newest",
  };
}

export function toSearchParams(query: Query): URLSearchParams {
  const p = new URLSearchParams();
  if (query.q.trim()) p.set("q", query.q.trim());
  if (query.category) p.set("category", query.category);
  if (query.price) p.set("price", query.price);
  if (query.purity.length) p.set("purity", query.purity.join(","));
  if (query.location) p.set("location", query.location);
  if (query.shop) p.set("shop", query.shop);
  if (query.sort !== "newest") p.set("sort", query.sort);
  return p;
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------
function inLocation(shop: Shop, location: string): boolean {
  const [emirate, area] = location.split("/");
  if (slug(shop.emirate) !== emirate) return false;
  return !area || slug(shop.area) === area;
}

function haystack(piece: Piece): string {
  const shop = shopFor(piece);
  const cat = CATEGORIES.find((c) => c.id === piece.category);
  return [piece.name, piece.code, cat?.label, cat?.singular, piece.purity, piece.stones, piece.description,
    shop.name, shop.area, shop.emirate].filter(Boolean).join(" ").toLowerCase();
}

/** Every word must appear somewhere: "22k chain deira" narrows, it does not widen. */
export function matchesText(piece: Piece, q: string): boolean {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = haystack(piece);
  return words.every((w) => text.includes(w) || (w.endsWith("s") && text.includes(w.slice(0, -1))));
}

export type FilterKey = "category" | "price" | "purity" | "location" | "shop" | "q";

/** Apply every filter except `skip`, used to count what each option would show. */
export function filterPieces(list: Piece[], query: Query, skip?: FilterKey): Piece[] {
  return list.filter((p) => {
    const shop = shopFor(p);
    if (skip !== "q" && !matchesText(p, query.q)) return false;
    if (skip !== "category" && query.category && p.category !== query.category) return false;
    if (skip !== "purity" && query.purity.length && (!p.purity || !query.purity.includes(p.purity))) return false;
    if (skip !== "location" && query.location && !inLocation(shop, query.location)) return false;
    if (skip !== "shop" && query.shop && p.shop !== query.shop) return false;
    if (skip !== "price" && query.price) {
      // A piece without a published price cannot be placed in a price range.
      if (p.price.kind === "on_request") return false;
      const band = PRICE_BANDS.find((b) => b.id === query.price)!;
      if (p.price.aed < band.min || p.price.aed >= band.max) return false;
    }
    return true;
  });
}

export function sortPieces(list: Piece[], sort: Sort): Piece[] {
  const priced = (p: Piece) => (p.price.kind === "on_request" ? null : p.price.aed);
  return [...list].sort((a, b) => {
    if (sort === "newest") return b.listedAt.localeCompare(a.listedAt) || a.name.localeCompare(b.name);
    const pa = priced(a), pb = priced(b);
    // "Price on request" always goes last: it is neither cheap nor expensive.
    if (pa === null && pb === null) return a.name.localeCompare(b.name);
    if (pa === null) return 1;
    if (pb === null) return -1;
    return sort === "price-asc" ? pa - pb : pb - pa;
  });
}

export function runQuery(query: Query, list: Piece[] = allPieces): Piece[] {
  return sortPieces(filterPieces(list, query), query.sort);
}

export function activeFilterCount(query: Query): number {
  return (query.price ? 1 : 0) + query.purity.length + (query.location ? 1 : 0) + (query.shop ? 1 : 0);
}
