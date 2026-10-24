import { describe, expect, it } from "vitest";
import { effectiveMakingPerGram, estimatePrice } from "./pricing";

describe("estimatePrice", () => {
  it("per-gram making charge", () => {
    const p = estimatePrice({ ratePerGramAed: 407.5, weightGrams: 10, makingChargeType: "per_gram", makingChargeValue: 20 });
    expect(p.goldValue).toBe(4075);
    expect(p.makingCharge).toBe(200);
    expect(p.subtotal).toBe(4275);
    expect(p.vat).toBe(213.75);
    expect(p.total).toBe(4488.75);
  });

  it("percent making charge is a percentage of the gold value", () => {
    const p = estimatePrice({ ratePerGramAed: 400, weightGrams: 5, makingChargeType: "percent", makingChargeValue: 8 });
    expect(p.goldValue).toBe(2000);
    expect(p.makingCharge).toBe(160);
    expect(p.total).toBe(2268);
  });

  it("fixed making charge ignores weight", () => {
    const p = estimatePrice({ ratePerGramAed: 334.5, weightGrams: 3.42, makingChargeType: "fixed", makingChargeValue: 350 });
    expect(p.goldValue).toBe(1143.99);
    expect(p.makingCharge).toBe(350);
    expect(p.vat).toBe(74.7);
    expect(p.total).toBe(1568.69);
  });

  it("parts always add up to the total", () => {
    const p = estimatePrice({ ratePerGramAed: 390.25, weightGrams: 31.753, makingChargeType: "per_gram", makingChargeValue: 22.5 });
    expect(Math.round((p.goldValue + p.makingCharge + p.vat) * 100)).toBe(Math.round(p.total * 100));
  });

  it("rejects impossible input", () => {
    expect(() => estimatePrice({ ratePerGramAed: 0, weightGrams: 1, makingChargeType: "fixed", makingChargeValue: 1 })).toThrow();
    expect(() => estimatePrice({ ratePerGramAed: 400, weightGrams: -1, makingChargeType: "fixed", makingChargeValue: 1 })).toThrow();
    expect(() => estimatePrice({ ratePerGramAed: 400, weightGrams: 1, makingChargeType: "fixed", makingChargeValue: -5 })).toThrow();
  });
});

describe("effectiveMakingPerGram", () => {
  it("puts all three charge types on one scale", () => {
    const base = { ratePerGramAed: 400, weightGrams: 10 };
    expect(effectiveMakingPerGram({ ...base, makingChargeType: "per_gram", makingChargeValue: 20 })).toBe(20);
    expect(effectiveMakingPerGram({ ...base, makingChargeType: "percent", makingChargeValue: 5 })).toBe(20);
    expect(effectiveMakingPerGram({ ...base, makingChargeType: "fixed", makingChargeValue: 200 })).toBe(20);
  });
});
