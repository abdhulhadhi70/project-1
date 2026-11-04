import { sampleRates, type Piece } from "@/data/catalogue";
import { aed, dateText } from "@/lib/format";
import { estimatePrice, vatRateFor } from "@/lib/pricing";

/**
 * How a price is made up: gold at the day's rate, the making charge, VAT.
 * Uses the SAMPLE rate in the demo, and says so.
 */
export function PriceBreakdown({ piece }: { piece: Piece }) {
  const { purity, weightGrams, makingCharge } = piece;
  if (!purity || !weightGrams || !makingCharge) return null;
  const vatRate = vatRateFor(purity, piece.fineness);
  const rate = sampleRates.perGram[purity];
  const e = estimatePrice({
    ratePerGramAed: rate, weightGrams, vatRate,
    makingChargeType: makingCharge.type,
    makingChargeValue: makingCharge.type === "percent" ? makingCharge.value : makingCharge.aed,
  });
  const extra = piece.price.kind !== "on_request" ? Math.max(0, Math.round(piece.price.aed - e.total)) : 0;
  const rows: [string, string][] = [
    [`Gold: ${weightGrams} g × ${aed(rate)}/g`, aed(e.goldValue)],
    ["Making charge", aed(e.makingCharge)],
    [vatRate ? "VAT (5%)" : "VAT (0%, investment gold)", aed(e.vat)],
  ];
  if (extra > 0) rows.push([piece.stones ? "Stones and rounding, set by the jeweller" : "Rounding by the jeweller", aed(extra)]);
  return (
    <section aria-labelledby="breakdown" className="border border-line">
      <div className="flex items-baseline justify-between gap-4 border-b border-line bg-limestone/60 px-4 py-3">
        <h2 id="breakdown" className="text-[15px] font-medium">How the price adds up</h2>
        <span className="text-[12px] text-stone">Sample rate, {dateText(sampleRates.asOf.slice(0, 10))}</span>
      </div>
      <dl className="divide-y divide-line px-4 text-[14px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-ink-soft">{k}</dt><dd className="tabular-nums">{v}</dd></div>
        ))}
        <div className="flex justify-between gap-4 py-3 font-semibold">
          <dt>{piece.price.kind === "listed" ? "Listed price" : "Estimated total"}</dt>
          <dd className="tabular-nums">{piece.price.kind === "on_request" ? aed(Math.round(e.total)) : aed(piece.price.aed)}</dd>
        </div>
      </dl>
      <p className="border-t border-line px-4 py-3 text-[12px] leading-snug text-stone">
        {piece.price.kind === "on_request"
          ? "Gold and making only, as a guide: the jeweller prices this piece in person."
          : "The rate here is demonstration data, not a live price. The jeweller confirms the final price in the shop."}
      </p>
    </section>
  );
}
