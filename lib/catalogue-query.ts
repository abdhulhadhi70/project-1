// Search, filters, sorting and suggestions for the catalogue. Pure functions
// over the data, so they can be tested and later swapped for a database
// query with the same shape.
import {
  CATEGORIES, EMIRATES, OCCASIONS, STYLES, TABS, WEARERS, sectionOf,
  type Category, type Occasion, type Piece, type Purity, type Style, type Tab, type Wearer,
} from "@/data/catalogue";
import { areaFor, getCatalogue, shopFor } from "./catalogue-store";

const allPieces = () => getCatalogue().pieces;
import { effectiveMakingPerGram } from "./pricing";

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------------------------------------------------------------------------
// Ranges
// ---------------------------------------------------------------------------
type Band = { id: string; label: string; min: number; max: number };

export const PRICE_BANDS = [
  { id: "under-3000", label: "Under AED 3,000", min: 0, max: 3000 },
  { id: "3000-7500", label: "AED 3,000 – 7,500", min: 3000, max: 7500 },
  { id: "7500-15000", label: "AED 7,500 – 15,000", min: 7500, max: 15000 },
  { id: "15000-30000", label: "AED 15,000 – 30,000", min: 15000, max: 30000 },
  { id: "over-30000", label: "Over AED 30,000", min: 30000, max: Infinity },
] as const satisfies readonly Band[];
export type PriceBand = (typeof PRICE_BANDS)[number]["id"];

export const WEIGHT_BANDS = [
  { id: "under-5", label: "Under 5 g", min: 0, max: 5 },
  { id: "5-10", label: "5 – 10 g", min: 5, max: 10 },
  { id: "10-20", label: "10 – 20 g", min: 10, max: 20 },
  { id: "20-40", label: "20 – 40 g", min: 20, max: 40 },
  { id: "over-40", label: "Over 40 g", min: 40, max: Infinity },
] as const satisfies readonly Band[];
export type WeightBand = (typeof WEIGHT_BANDS)[number]["id"];

/** "Making charge up to": compared per gram, whichever way the shop quotes it. */
export const MAKING_LIMITS = [15, 20, 25, 30] as const;
export type MakingLimit = (typeof MAKING_LIMITS)[number];

export const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "weight-desc", label: "Weight: heaviest first" },
  { id: "weight-asc", label: "Weight: lightest first" },
  { id: "making-asc", label: "Lowest making charge" },
] as const;
export type Sort = (typeof SORTS)[number]["id"];

export const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// The query
// ---------------------------------------------------------------------------
export type Query = {
  tab: Tab;
  q: string;
  /** An emirate ("dubai") or an area ("deira-gold-souk"). */
  location: string | null;
  category: Category | null;
  purity: Purity[];
  price: PriceBand | null;
  weight: WeightBand | null;
  making: MakingLimit | null;
  occasion: Occasion | null;
  wearer: Wearer | null;
  style: Style | null;
  stones: "with" | "without" | null;
  shop: string | null;
  sort: Sort;
  page: number;
};

export const EMPTY_QUERY: Query = {
  tab: "jewellery", q: "", location: null, category: null, purity: [], price: null, weight: null,
  making: null, occasion: null, wearer: null, style: null, stones: null, shop: null, sort: "newest", page: 1,
};

// ---------------------------------------------------------------------------
// What the site offers is whatever has pieces behind it: a tab, area or
// emirate with nothing listed is not shown, and reappears when it has stock.
// ---------------------------------------------------------------------------
export const liveTabs = () => TABS.filter((t) => allPieces().some((p) => inTab(p, t.id)));
export const liveAreas = () => getCatalogue().areas.filter((a) => getCatalogue().shops.some((s) => s.area === a.slug));
export const liveEmirates = () => EMIRATES.filter((e) => liveAreas().some((a) => a.emirate === e));

// ---------------------------------------------------------------------------
// Locations: emirates and areas, for the location box and its filter.
// ---------------------------------------------------------------------------
export type Place = { id: string; label: string; detail: string; kind: "emirate" | "area" };

export const places = (): Place[] => [
  ...liveEmirates().map((e): Place => ({ id: slug(e), label: e, detail: "Emirate", kind: "emirate" })),
  ...liveAreas().map((a): Place => ({ id: a.slug, label: a.name, detail: a.emirate, kind: "area" })),
];
const placeById = (id: string) => places().find((p) => p.id === id);

export function locationLabel(id: string | null): string {
  if (!id) return "All UAE";
  const p = placeById(id);
  return p ? (p.kind === "area" ? `${p.label}, ${p.detail}` : p.label) : "All UAE";
}

function inLocation(piece: Piece, location: string): boolean {
  const shop = shopFor(piece);
  if (shop.area === location) return true;
  return slug(areaFor(shop).emirate) === location;
}

// ---------------------------------------------------------------------------
// URL <-> query
// ---------------------------------------------------------------------------
const oneOf = <T extends string>(list: readonly { id: T }[], v: string | null): T | null =>
  v !== null && list.some((x) => x.id === v) ? (v as T) : null;
const PURITY_ORDER: Purity[] = ["24K", "22K", "21K", "18K"];

export function parseQuery(params: URLSearchParams): Query {
  const making = Number(params.get("making"));
  const page = Math.max(1, Math.floor(Number(params.get("page")) || 1));
  const loc = params.get("location");
  const stones = params.get("stones");
  const shop = params.get("shop");
  return {
    tab: oneOf(TABS, params.get("tab")) ?? "jewellery",
    q: (params.get("q") ?? "").slice(0, 80),
    location: loc && placeById(loc) ? loc : null,
    category: oneOf(CATEGORIES, params.get("category")),
    purity: (params.get("purity") ?? "").split(",").map((s) => s.toUpperCase())
      .filter((s): s is Purity => (PURITY_ORDER as string[]).includes(s)),
    price: oneOf(PRICE_BANDS, params.get("price")),
    weight: oneOf(WEIGHT_BANDS, params.get("weight")),
    making: (MAKING_LIMITS as readonly number[]).includes(making) ? (making as MakingLimit) : null,
    occasion: oneOf(OCCASIONS, params.get("occasion")),
    wearer: oneOf(WEARERS, params.get("for")),
    style: oneOf(STYLES, params.get("style")),
    stones: stones === "with" || stones === "without" ? stones : null,
    shop: shop && getCatalogue().shops.some((s) => s.slug === shop) ? shop : null,
    sort: oneOf(SORTS, params.get("sort")) ?? "newest",
    page,
  };
}

export function toSearchParams(query: Query): URLSearchParams {
  const p = new URLSearchParams();
  if (query.tab !== "jewellery") p.set("tab", query.tab);
  if (query.q.trim()) p.set("q", query.q.trim());
  if (query.location) p.set("location", query.location);
  if (query.category) p.set("category", query.category);
  if (query.purity.length) p.set("purity", query.purity.join(","));
  if (query.price) p.set("price", query.price);
  if (query.weight) p.set("weight", query.weight);
  if (query.making) p.set("making", String(query.making));
  if (query.occasion) p.set("occasion", query.occasion);
  if (query.wearer) p.set("for", query.wearer);
  if (query.style) p.set("style", query.style);
  if (query.stones) p.set("stones", query.stones);
  if (query.shop) p.set("shop", query.shop);
  if (query.sort !== "newest") p.set("sort", query.sort);
  if (query.page > 1) p.set("page", String(query.page));
  return p;
}

export function searchHref(patch: Partial<Query>): string {
  const qs = toSearchParams({ ...EMPTY_QUERY, ...patch }).toString();
  return `/search${qs ? `?${qs}` : ""}`;
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------
const label = <T extends string>(list: readonly { id: T; label: string }[], id?: T) => list.find((x) => x.id === id)?.label;

function haystack(piece: Piece): string {
  const shop = shopFor(piece);
  const area = areaFor(shop);
  const cat = CATEGORIES.find((c) => c.id === piece.category);
  return [
    piece.name, piece.code, cat?.label, cat?.singular, piece.purity, piece.stones, piece.description,
    shop.name, area.name, area.emirate, label(WEARERS, piece.wearer), label(STYLES, piece.style),
    ...piece.occasions.map((o) => label(OCCASIONS, o)),
  ].filter(Boolean).join(" ").toLowerCase();
}

/** Every word must appear somewhere: "22k chain deira" narrows, it does not widen. */
export function matchesText(piece: Piece, q: string): boolean {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = haystack(piece);
  return words.every((w) => text.includes(w) || (w.endsWith("s") && text.includes(w.slice(0, -1))));
}

export function inTab(piece: Piece, tab: Tab): boolean {
  if (tab === "coins_bars") return sectionOf(piece) === "coins_bars";
  if (tab === "bridal") return piece.occasions.includes("bridal");
  return sectionOf(piece) === "jewellery";
}

const inBand = (v: number | undefined, band: Band) => v !== undefined && v >= band.min && v < band.max;
const priceOf = (p: Piece) => (p.price.kind === "on_request" ? null : p.price.aed);

export function makingPerGram(p: Piece): number | null {
  if (!p.makingCharge || !p.weightGrams || !p.purity) return null;
  // The rate cancels out for per-gram and fixed charges; for a percentage it
  // is needed, and any sensible rate gives the same ordering.
  const m = p.makingCharge;
  return effectiveMakingPerGram({
    ratePerGramAed: 450, weightGrams: p.weightGrams, makingChargeType: m.type,
    makingChargeValue: m.type === "percent" ? m.value : m.aed,
  });
}

export type FilterKey = Exclude<keyof Query, "sort" | "page">;

/** Apply every filter except `skip`, used to count what each option would show. */
export function filterPieces(list: Piece[], query: Query, skip?: FilterKey): Piece[] {
  return list.filter((p) => {
    if (skip !== "tab" && !inTab(p, query.tab)) return false;
    if (skip !== "q" && !matchesText(p, query.q)) return false;
    if (skip !== "location" && query.location && !inLocation(p, query.location)) return false;
    if (skip !== "category" && query.category && p.category !== query.category) return false;
    if (skip !== "purity" && query.purity.length && (!p.purity || !query.purity.includes(p.purity))) return false;
    if (skip !== "price" && query.price) {
      // A piece without a published price cannot be placed in a price range.
      const band = PRICE_BANDS.find((b) => b.id === query.price)!;
      if (!inBand(priceOf(p) ?? undefined, band)) return false;
    }
    if (skip !== "weight" && query.weight && !inBand(p.weightGrams, WEIGHT_BANDS.find((b) => b.id === query.weight)!)) return false;
    if (skip !== "making" && query.making) {
      const m = makingPerGram(p);
      if (m === null || m > query.making) return false;
    }
    if (skip !== "occasion" && query.occasion && !p.occasions.includes(query.occasion)) return false;
    if (skip !== "wearer" && query.wearer && p.wearer !== query.wearer && !(p.wearer === "unisex" && query.wearer !== "kids")) return false;
    if (skip !== "style" && query.style && p.style !== query.style) return false;
    if (skip !== "stones" && query.stones && (query.stones === "with") !== Boolean(p.stones)) return false;
    if (skip !== "shop" && query.shop && p.shop !== query.shop) return false;
    return true;
  });
}

export function sortPieces(list: Piece[], sort: Sort): Piece[] {
  const byName = (a: Piece, b: Piece) => a.name.localeCompare(b.name);
  // Pieces without the value being sorted on always go last.
  const by = (get: (p: Piece) => number | null | undefined, dir: 1 | -1) => (a: Piece, b: Piece) => {
    const va = get(a) ?? null, vb = get(b) ?? null;
    if (va === null && vb === null) return byName(a, b);
    if (va === null) return 1;
    if (vb === null) return -1;
    return (va - vb) * dir || byName(a, b);
  };
  const cmp = {
    newest: (a: Piece, b: Piece) => b.listedAt.localeCompare(a.listedAt) || byName(a, b),
    "price-asc": by(priceOf, 1),
    "price-desc": by(priceOf, -1),
    "weight-asc": by((p) => p.weightGrams, 1),
    "weight-desc": by((p) => p.weightGrams, -1),
    "making-asc": by(makingPerGram, 1),
  }[sort];
  return [...list].sort(cmp);
}

export function runQuery(query: Query, list: Piece[] = allPieces()): Piece[] {
  return sortPieces(filterPieces(list, query), query.sort);
}

export function paginate<T>(list: T[], page: number, size = PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(list.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { items: list.slice((current - 1) * size, current * size), page: current, pages, total: list.length };
}

/** Filters in the "More filters" panel, counted for its button. */
export function moreFilterCount(q: Query): number {
  return [q.weight, q.making, q.occasion, q.wearer, q.style, q.stones].filter(Boolean).length;
}

export function activeFilterCount(q: Query): number {
  return moreFilterCount(q) + (q.location ? 1 : 0) + (q.category ? 1 : 0) + q.purity.length + (q.price ? 1 : 0) + (q.shop ? 1 : 0);
}

// ---------------------------------------------------------------------------
// Options that exist in the data. A filter with nothing behind it is hidden.
// ---------------------------------------------------------------------------
export function optionsFor(tab: Tab) {
  const inThisTab = allPieces().filter((p) => inTab(p, tab));
  const has = <T,>(get: (p: Piece) => T | T[] | undefined, v: T) =>
    inThisTab.some((p) => { const x = get(p); return Array.isArray(x) ? x.includes(v) : x === v; });
  return {
    categories: CATEGORIES.filter((c) => has((p) => p.category, c.id)),
    purities: PURITY_ORDER.filter((x) => has((p) => p.purity, x)),
    occasions: OCCASIONS.filter((o) => has((p) => p.occasions, o.id)),
    wearers: WEARERS.filter((w) => w.id !== "unisex" && inThisTab.some((p) => p.wearer === w.id || (p.wearer === "unisex" && w.id !== "kids"))),
    styles: STYLES.filter((s) => has((p) => p.style, s.id)),
    hasStones: inThisTab.some((p) => p.stones) && inThisTab.some((p) => !p.stones),
  };
}

// ---------------------------------------------------------------------------
// Suggestions for the search box, like Property Finder's location box.
// ---------------------------------------------------------------------------
export type Suggestion =
  | { kind: "place"; id: string; label: string; detail: string }
  | { kind: "category"; id: Category; label: string; detail: string }
  | { kind: "shop"; id: string; label: string; detail: string };

export function suggest(text: string, limit = 7): Suggestion[] {
  const t = text.trim().toLowerCase();
  if (!t) return [];
  const starts = (s: string) => s.toLowerCase().split(/[\s&,-]+/).some((w) => w.startsWith(t)) || s.toLowerCase().startsWith(t);
  const out: Suggestion[] = [];
  for (const p of places()) if (starts(p.label)) out.push({ kind: "place", id: p.id, label: p.label, detail: p.detail });
  for (const c of CATEGORIES) if (starts(c.label) || starts(c.singular)) out.push({ kind: "category", id: c.id, label: c.label, detail: "Category" });
  for (const s of getCatalogue().shops) if (starts(s.name)) out.push({ kind: "shop", id: s.slug, label: s.name, detail: getCatalogue().areaBySlug.get(s.area)?.name ?? "" });
  return out.slice(0, limit);
}
