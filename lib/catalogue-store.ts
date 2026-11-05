// The catalogue the site shows, wherever it comes from.
//
// It starts as the built-in demo (so every page renders at build time and
// never appears empty), then, in the browser, is replaced by the live
// catalogue from Supabase once that loads. Anything that reads the
// catalogue goes through here, so swapping the source changes nothing else.
import { useEffect, useSyncExternalStore } from "react";
import {
  areas as demoAreas, pieces as demoPieces, sampleRates, shops as demoShops,
  type Area, type Piece, type Purity, type Shop,
} from "@/data/catalogue";

export type Rates = {
  asOf: string;
  perGram: Record<Purity, number>;
  /** "sample" for the built-in demo figures; "set" for rates entered in the admin portal. */
  source: "sample" | "set";
};

export type SiteSettings = {
  siteName: string;
  contactEmail: string | null;
  contactWhatsapp: string | null;
  noticeText: string | null;
  showNotice: boolean;
  sections: Record<string, boolean>;
};

export type CatalogueData = {
  areas: Area[];
  shops: Shop[];
  pieces: Piece[];
  rates: Rates;
  settings: SiteSettings | null;
  source: "demo" | "live";
};

export type Catalogue = CatalogueData & {
  areaBySlug: Map<string, Area>;
  shopBySlug: Map<string, Shop>;
  pieceBySlug: Map<string, Piece>;
};

function build(d: CatalogueData): Catalogue {
  return {
    ...d,
    areaBySlug: new Map(d.areas.map((a) => [a.slug, a])),
    shopBySlug: new Map(d.shops.map((s) => [s.slug, s])),
    pieceBySlug: new Map(d.pieces.map((p) => [p.slug, p])),
  };
}

export const DEMO: CatalogueData = {
  areas: demoAreas,
  shops: demoShops,
  pieces: demoPieces,
  rates: { ...sampleRates, source: "sample" },
  settings: null,
  source: "demo",
};

let current: Catalogue = build(DEMO);
let version = 0;
const listeners = new Set<() => void>();

export const getCatalogue = (): Catalogue => current;

export function setCatalogue(next: CatalogueData) {
  current = build(next);
  version++;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// ---------------------------------------------------------------------------
// Loading the live catalogue, once per page load.
// ---------------------------------------------------------------------------
let loading: Promise<void> | null = null;
type Loader = () => Promise<CatalogueData | null>;
let loader: Loader | null = null;

/** Set by lib/live-catalogue.ts in the browser; tests and the build never set it. */
export function registerLoader(l: Loader) {
  loader = l;
}

let settled = false;

/** True once the live catalogue has loaded, failed, or isn't configured. */
export const catalogueSettled = () => settled || !loader;

export function loadLiveCatalogue(force = false): Promise<void> {
  if (!loader) return Promise.resolve();
  if (loading && !force) return loading;
  loading = loader()
    .then((d) => { if (d) setCatalogue(d); })
    .catch(() => { /* keep showing what we have */ })
    .finally(() => { settled = true; version++; listeners.forEach((l) => l()); });
  return loading;
}

/** Re-renders when the live catalogue arrives. */
export function useCatalogue(): Catalogue {
  useSyncExternalStore(subscribe, () => version, () => 0);
  useEffect(() => { void loadLiveCatalogue(); }, []);
  return current;
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------
export function shopFor(piece: Piece, c: Catalogue = current): Shop {
  const shop = c.shopBySlug.get(piece.shop);
  if (!shop) throw new Error(`Piece ${piece.slug} names unknown shop ${piece.shop}`);
  return shop;
}

export function areaFor(shop: Shop, c: Catalogue = current): Area {
  return c.areaBySlug.get(shop.area) ?? { slug: shop.area, name: shop.area, emirate: "Dubai", note: "", lat: shop.lat, lng: shop.lng };
}

/** A shop's cover image: its chosen piece, or its newest one. */
export function coverFor(shop: Shop, c: Catalogue = current): Piece | undefined {
  return c.pieceBySlug.get(shop.cover) ?? c.pieces.find((p) => p.shop === shop.slug);
}
