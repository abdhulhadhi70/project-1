import { describe, expect, it } from "vitest";
import { pieces } from "@/data/catalogue";
import {
  EMPTY_QUERY, filterPieces, locationOptions, parseQuery, purityOptions, runQuery, toSearchParams,
} from "./catalogue-query";

const q = (over: Partial<typeof EMPTY_QUERY>) => ({ ...EMPTY_QUERY, ...over });

describe("catalogue data", () => {
  it("has 12–16 pieces, every one marked as demonstration data", () => {
    expect(pieces.length).toBeGreaterThanOrEqual(12);
    expect(pieces.length).toBeLessThanOrEqual(16);
    expect(pieces.every((p) => p.demo)).toBe(true);
  });

  it("has unique slugs and codes", () => {
    expect(new Set(pieces.map((p) => p.slug)).size).toBe(pieces.length);
    expect(new Set(pieces.map((p) => p.code)).size).toBe(pieces.length);
  });

  it("only offers filter options that exist in the data", () => {
    expect(purityOptions).not.toContain("24K");
    expect(locationOptions.map((l) => l.label)).toEqual(["Dubai", "Abu Dhabi", "Sharjah"]);
  });
});

describe("search", () => {
  it("matches name, shop and area, every word required", () => {
    expect(runQuery(q({ q: "rope" })).map((p) => p.slug)).toEqual(["22k-rope-chain", "21k-rope-necklace"]);
    expect(runQuery(q({ q: "curb karama" })).map((p) => p.slug)).toEqual(["22k-classic-curb-chain"]);
    expect(runQuery(q({ q: "Qamar" })).length).toBe(4);
  });

  it("treats plurals loosely", () => {
    expect(runQuery(q({ q: "rings" })).length).toBe(runQuery(q({ q: "ring" })).length);
  });

  it("finds nothing for nonsense", () => {
    expect(runQuery(q({ q: "platinum watch" }))).toEqual([]);
  });
});

describe("filters", () => {
  it("excludes price-on-request pieces once a price range is chosen", () => {
    const res = runQuery(q({ price: "5000-10000" }));
    expect(res.every((p) => p.price.kind !== "on_request" && p.price.aed >= 5000 && p.price.aed < 10000)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it("filters by emirate and by area", () => {
    expect(runQuery(q({ location: "dubai" })).length).toBe(7);
    expect(runQuery(q({ location: "dubai/karama" })).length).toBe(4);
    expect(runQuery(q({ location: "sharjah" })).every((p) => p.shop === "falaj-goldsmiths")).toBe(true);
  });

  it("combines purity values as either-or", () => {
    const res = runQuery(q({ purity: ["21K", "18K"] }));
    expect(res.every((p) => p.purity === "21K" || p.purity === "18K")).toBe(true);
  });

  it("can skip one filter to count what its options would show", () => {
    const query = q({ category: "rings", purity: ["22K"] });
    expect(filterPieces(pieces, query).length).toBe(1);
    expect(filterPieces(pieces, query, "purity").length).toBe(3);
  });
});

describe("sorting", () => {
  it("puts price on request last in both directions", () => {
    for (const sort of ["price-asc", "price-desc"] as const) {
      const res = runQuery(q({ sort }));
      const firstOnRequest = res.findIndex((p) => p.price.kind === "on_request");
      expect(res.slice(firstOnRequest).every((p) => p.price.kind === "on_request")).toBe(true);
    }
  });

  it("orders prices", () => {
    const prices = runQuery(q({ sort: "price-asc" })).flatMap((p) => (p.price.kind === "on_request" ? [] : [p.price.aed]));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("newest first by default", () => {
    const dates = runQuery(EMPTY_QUERY).map((p) => p.listedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

describe("URL state", () => {
  it("round-trips", () => {
    const query = q({ q: "chain", category: "chains", price: "over-10000", purity: ["22K"], location: "dubai/deira", sort: "price-desc" });
    expect(parseQuery(toSearchParams(query))).toEqual(query);
  });

  it("ignores values it does not recognise", () => {
    const parsed = parseQuery(new URLSearchParams("category=watches&price=free&purity=99k,22k&location=mars&sort=random"));
    expect(parsed).toEqual(q({ purity: ["22K"] }));
  });
});
