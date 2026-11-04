import { describe, expect, it } from "vitest";
import { areas, pieces, sampleRates, shops } from "@/data/catalogue";
import {
  EMPTY_QUERY, filterPieces, inTab, makingPerGram, optionsFor, paginate, parseQuery, runQuery, searchHref,
  suggest, toSearchParams, type Query,
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
    const bar = pieces.find((p) => p.slug === "24k-gold-bar-10g")!;
    const est = estimatePrice({ ratePerGramAed: sampleRates.perGram["24K"], weightGrams: 10, makingChargeType: "fixed", makingChargeValue: 95, vatRate: 0 });
    expect(bar.price).toMatchObject({ kind: "indicative", aed: Math.round(est.total) });
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

  it("only offers options that exist in the tab", () => {
    const coins = optionsFor("coins_bars");
    expect(coins.categories.map((c) => c.id)).toEqual(["coins", "bars"]);
    expect(coins.styles).toEqual([]);
    expect(optionsFor("jewellery").purities).not.toContain("24K");
  });
});

describe("search", () => {
  it("matches name, shop and area, every word required", () => {
    expect(all({ q: "rope" }).map((p) => p.slug).sort()).toEqual(["21k-heavy-rope-chain", "21k-rope-necklace", "22k-layered-necklace", "22k-rope-chain"]);
    expect(all({ q: "curb karama" }).map((p) => p.slug)).toEqual(["22k-classic-curb-chain"]);
    expect(all({ q: "Ghaf" }).length).toBeGreaterThan(0);
  });

  it("searches the tab it is in", () => {
    expect(all({ tab: "coins_bars", q: "bar" }).length).toBe(4);
    expect(all({ tab: "jewellery", q: "tola" })).toEqual([]);
  });
});

describe("filters", () => {
  it("filters by emirate and by area", () => {
    const dubai = all({ location: "dubai" });
    expect(dubai.length).toBeGreaterThan(0);
    expect(all({ location: "karama" }).every((p) => p.shop === "qamar-gold-house")).toBe(true);
    expect(all({ location: "karama" }).length).toBeLessThan(dubai.length);
  });

  it("drops price-on-request pieces once a price range is chosen", () => {
    const res = all({ price: "7500-15000" });
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((p) => p.price.kind !== "on_request" && p.price.aed >= 7500 && p.price.aed < 15000)).toBe(true);
  });

  it("filters by weight and by making charge per gram", () => {
    expect(all({ weight: "over-40" }).every((p) => p.weightGrams! >= 40)).toBe(true);
    const cheap = all({ making: 15 });
    expect(cheap.length).toBeGreaterThan(0);
    expect(cheap.every((p) => makingPerGram(p)! <= 15)).toBe(true);
  });

  it("treats 'anyone' pieces as for women and men, but not kids", () => {
    expect(all({ wearer: "men" }).some((p) => p.wearer === "unisex")).toBe(true);
    expect(all({ wearer: "kids" }).every((p) => p.wearer === "kids")).toBe(true);
  });

  it("filters by stones", () => {
    expect(all({ stones: "with" }).every((p) => p.stones)).toBe(true);
    expect(all({ stones: "without" }).every((p) => !p.stones)).toBe(true);
  });

  it("can skip one filter to count what its options would show", () => {
    const query = q({ category: "rings", purity: ["22K"] });
    expect(filterPieces(pieces, query, "purity").length).toBeGreaterThan(filterPieces(pieces, query).length);
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
    expect(paginate(list, 1).items.length).toBe(12);
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
    expect(suggest("qam").some((s) => s.kind === "shop")).toBe(true);
    expect(suggest("")).toEqual([]);
  });

  it("keeps 'gold' from matching everything in the wrong way", () => {
    expect(suggest("gold").every((s) => s.label.toLowerCase().includes("gold"))).toBe(true);
  });
});

it("inTab never puts a piece in two sections", () => {
  expect(pieces.every((p) => inTab(p, "jewellery") !== inTab(p, "coins_bars"))).toBe(true);
});
