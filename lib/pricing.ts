// Estimated price for a piece, as shown to customers.
//
//   gold value  = rate for the karat × weight
//   making      = per gram × weight | percent of gold value | fixed amount
//   VAT         = 5% of (gold value + making)
//
// Everything is computed in fils (1/100 AED) as integers so the parts always
// add up to the total that is displayed.

export const VAT_RATE = 0.05;

export type MakingChargeType = "per_gram" | "percent" | "fixed";

export type PriceInput = {
  ratePerGramAed: number;
  weightGrams: number;
  makingChargeType: MakingChargeType;
  makingChargeValue: number;
};

export type PriceBreakdown = {
  goldValue: number;
  makingCharge: number;
  subtotal: number;
  vat: number;
  total: number;
};

const toFils = (aed: number) => Math.round(aed * 100);
const toAed = (fils: number) => fils / 100;

export function makingChargeFils(input: PriceInput, goldFils: number): number {
  const { makingChargeType, makingChargeValue, weightGrams } = input;
  switch (makingChargeType) {
    case "per_gram":
      return toFils(makingChargeValue * weightGrams);
    case "percent":
      return Math.round((goldFils * makingChargeValue) / 100);
    case "fixed":
      return toFils(makingChargeValue);
  }
}

export function estimatePrice(input: PriceInput): PriceBreakdown {
  if (!(input.ratePerGramAed > 0) || !(input.weightGrams > 0) || !(input.makingChargeValue >= 0)) {
    throw new RangeError("Rate and weight must be positive and the making charge not negative");
  }
  const gold = toFils(input.ratePerGramAed * input.weightGrams);
  const making = makingChargeFils(input, gold);
  const subtotal = gold + making;
  const vat = Math.round(subtotal * VAT_RATE);
  return {
    goldValue: toAed(gold),
    makingCharge: toAed(making),
    subtotal: toAed(subtotal),
    vat: toAed(vat),
    total: toAed(subtotal + vat),
  };
}

// Making charge expressed per gram, so shops can be compared on one scale
// whatever way each one quotes it. Used for "sort by lowest making charge".
export function effectiveMakingPerGram(input: PriceInput): number {
  const gold = toFils(input.ratePerGramAed * input.weightGrams);
  return toAed(makingChargeFils(input, gold)) / input.weightGrams;
}

export function formatAed(amount: number, locale = "en-AE", fractionDigits = 2): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
