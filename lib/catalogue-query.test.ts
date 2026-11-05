import { describe, expect, it } from "vitest";
import { areas, pieces, sampleRates, shops } from "@/data/catalogue";
import type { Tab } from "@/data/catalogue";
import {
  EMPTY_QUERY, filterPieces, inTab, liveAreas, liveEmirates, liveTabs, makingPerGram, optionsFor, paginate,
  parseQuery, runQuery, searchHref, suggest, toSearchParams, type Query,
} from "./catalogue-query";
import { estimatePrice } from "./pricing";

const q = (over: Partial<Query>): Query => ({ ...EMPTY_QUERY, ...over });
const all = (over: Partial<Query> = {}) => runQuery(q(over));

describe("catalogue data", () => {
  it("is all demonstration data, with unique slugs and codes", () => {
    expect(pieces.every((p) => p.demo) && shops.every((s) => s.demo)).toBe(true);
    expect(new Set(pieces.map((p) => p.slug)).size).toBe(pieces.length);
    expect(new Set(pieces.map((p) => p.code)).size).toBe(pieces.length);
  });

  it("links every piece to a shop and every shop to an area", () => {
    const shopSlugs = new Set(shops.map((s) => s.slug));
    const areaSlugs = new Set(areas.map((a) => a.slug));
    expect(pieces.every((p) => shopSlugs.has(p.shop))).toBe(true);
    expect(shops.every((s) => areaSlugs.has(s.area))).toBe(true);
    expect(shops.every((s) => pieces.some((p) => p.slug === s.cover && p.shop === s.slug))).toBe(true);
  });

  it("never prices a piece below the gold it contains", () => {
    for (const p of pieces) {
      if (p.price.kind === "on_request") continue;
      const gold = sampleRates.perGram[p.purity!] * p.weightGrams!;
      expect(p.price.aed, p.slug).toBeGreaterThan(gold);
    }
  });

  it("prices indicative pieces exactly by the formula", () => {
    const chain = pieces.find((p) => p.slug === "22k-rope-chain")!;
    const est = estimatePrice({ ratePerGramAed: sampleRates.perGram["22K"], weightGrams: 18.6, makingChargeType: "per_gram", makingChargeValue: 24 });
    expect(chain.price).toMatchObject({ kind: "indicative", aed: Math.round(est.total) });
  });
});

describe("tabs", () => {
  it("splits jewellery from coins and bars, with bridal across jewellery", () => {
    const jewellery = all({ tab: "jewellery" });
    const coins = all({ tab: "coins_bars" });
    const bridal = all({ tab: "bridal" });
    expect(jewellery.length + coins.length).toBe(pieces.length);
    expect(coins.every((p) => p.category === "coins" || p.category === "bars")).toBe(true);
    expect(bridal.length).toBeGreaterThan(4);
    expect(bridal.every((p) => p.occasions.includes("bridal"))).toBe(true);
  });

  it("only shows tabs, areas and emirates that have pieces", () => {
    expect(liveTabs.map((t) => t.id)).toEqual(
      ["jewellery", "bridal", "coins_bars"].filter((t) => pieces.some((p) => inTab(p, t as Tab))),
    );
    expect(liveAreas.every((a) => shops.some((s) => s.area === a.slug))).toBe(true);
    expect(liveEmirates.every((e) => liveAreas.some((a) => a.emirate === e))).toBe(true);
    expect(suggest("kara")).toEqual([]); // Karama has no shop in the demo
  });

  it("only offers options that exist in the tab", () => {
    const o = optionsFor("jewellery");
    expect(o.categories.every((c) => pieces.some((p) => p.category === c.id))).toBe(true);
    expect(o.purities.every((x) => pieces.some((p) => p.purity === x))).toBe(true);
  });
});

describe("search", () => {
  it("matches name, shop and area, every word required", () => {
    expect(all({ q: "rope" }).map((p) => p.slug).sort()).toEqual(["22k-layered-necklace", "22k-rope-chain"]);
    expect(all({ q: "curb deira" }).map((p) => p.slug)).toEqual(["22k-classic-curb-chain"]);
    expect(all({ q: "Yasmeen" }).length).toBe(6);
  });

  it("searches the tab it is in", () => {
    expect(all({ tab: "bridal", q: "coin" }).every((p) => p.occasions.includes("bridal"))).toBe(true);
    expect(all({ tab: "bridal", q: "rope chain" })).toEqual([]);
  });
});

describe("filters", () => {
  it("filters by emirate and by area", () => {
    const dubai = all({ location: "dubai" });
    expect(dubai.length).toBe(all().length); // both demo jewellers are in Dubai
    expect(all({ location: "meena-bazaar" }).every((p) => p.shop === "yasmeen-gold")).toBe(true);
    expect(all({ location: "meena-bazaar" }).length).toBeLessThan(dubai.length);
  });

  it("drops price-on-request pieces once a price range is chosen", () => {
    const res = all({ price: "3000-7500" });
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((p) => p.price.kind !== "on_request" && p.price.aed >= 3000 && p.price.aed < 7500)).toBe(true);
  });

  it("filters by weight and by making charge per gram", () => {
    expect(all({ weight: "over-40" }).every((p) => p.weightGrams! >= 40)).toBe(true);
    const cheap = all({ making: 20 });
    expect(cheap.length).toBeGreaterThan(0);
    expect(cheap.every((p) => makingPerGram(p)! <= 20)).toBe(true);
  });

  it("treats 'anyone' pieces as for women and men, but not kids", () => {
    expect(all({ wearer: "men" }).length).toBeGreaterThan(0);
    expect(all({ wearer: "men" }).every((p) => p.wearer === "men" || p.wearer === "unisex")).toBe(true);
    expect(all({ wearer: "kids" }).every((p) => p.wearer === "kids")).toBe(true);
  });

  it("filters by stones", () => {
    expect(all({ stones: "with" }).every((p) => p.stones)).toBe(true);
    expect(all({ stones: "without" }).every((p) => !p.stones)).toBe(true);
    expect(all({ stones: "with" }).length + all({ stones: "without" }).length).toBe(all().length);
  });

  it("can skip one filter to count what its options would show", () => {
    const query = q({ category: "necklaces", location: "deira-gold-souk" });
    expect(filterPieces(pieces, query, "location").length).toBeGreaterThan(filterPieces(pieces, query).length);
  });
});

describe("sorting and pages", () => {
  it("puts unpriced pieces last in both price directions", () => {
    for (const sort of ["price-asc", "price-desc"] as const) {
      const res = all({ sort });
      const first = res.findIndex((p) => p.price.kind === "on_request");
      expect(res.slice(first).every((p) => p.price.kind === "on_request")).toBe(true);
    }
  });

  it("orders by weight and by making charge", () => {
    const w = all({ sort: "weight-desc" }).map((p) => p.weightGrams!);
    expect(w).toEqual([...w].sort((a, b) => b - a));
    const m = all({ sort: "making-asc" }).map(makingPerGram).filter((x) => x !== null);
    expect(m).toEqual([...m].sort((a, b) => a - b));
  });

  it("paginates and clamps the page", () => {
    const list = all();
    expect(paginate(list, 1).items.length).toBe(Math.min(12, list.length));
    expect(paginate([...list, ...list], 2).items.length).toBe(Math.min(12, list.length * 2 - 12));
    expect(paginate(list, 99).page).toBe(paginate(list, 99).pages);
  });
});

describe("URL state", () => {
  it("round-trips every field", () => {
    const query = q({
      tab: "bridal", q: "coin", location: "meena-bazaar", category: "necklaces", purity: ["22K"], price: "15000-30000",
      weight: "20-40", making: 30, occasion: "bridal", wearer: "women", style: "indian", stones: "without",
      shop: "yasmeen-gold", sort: "price-desc", page: 2,
    });
    expect(parseQuery(toSearchParams(query))).toEqual(query);
  });

  it("ignores values it does not recognise", () => {
    const parsed = parseQuery(new URLSearchParams("tab=rent&category=watches&price=free&purity=99k,22k&location=mars&making=3&page=-4"));
    expect(parsed).toEqual(q({ purity: ["22K"] }));
  });

  it("builds clean links", () => {
    expect(searchHref({ category: "chains", location: "karama" })).toBe("/search?location=karama&category=chains");
    expect(searchHref({})).toBe("/search");
  });
});

describe("suggestions", () => {
  it("suggests places, categories and shops by word start", () => {
    expect(suggest("dei")[0]).toMatchObject({ kind: "place", id: "deira-gold-souk" });
    expect(suggest("ban").some((s) => s.kind === "category" && s.id === "bangles")).toBe(true);
    expect(suggest("yas").some((s) => s.kind === "shop")).toBe(true);
    expect(suggest("")).toEqual([]);
  });

  it("keeps 'gold' from matching everything in the wrong way", () => {
    expect(suggest("gold").every((s) => s.label.toLowerCase().includes("gold"))).toBe(true);
  });
});

it("inTab never puts a piece in two sections", () => {
  expect(pieces.every((p) => inTab(p, "jewellery") !== inTab(p, "coins_bars"))).toBe(true);
});
