// Kept apart from ResultsMap so the search page can use it without
// importing Leaflet, which needs a browser.
import type { Piece, Shop } from "@/data/catalogue";
import { shopFor } from "@/lib/catalogue-store";

/** `label` replaces the count on the pin, e.g. on a single shop's map. */
export type MapShop = { shop: Shop; count: number; label?: string };

export function groupByShop(pieces: Piece[]): MapShop[] {
  const m = new Map<string, MapShop>();
  for (const p of pieces) {
    const s = shopFor(p);
    const cur = m.get(s.slug) ?? { shop: s, count: 0 };
    cur.count++;
    m.set(s.slug, cur);
  }
  return [...m.values()];
}

