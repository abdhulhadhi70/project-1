"use client";
// The full price estimator. Same formula as every price on the site:
// gold at the day's rate, plus the making charge, plus VAT.
import { useState } from "react";
import type { Purity } from "@/data/catalogue";
import { useCatalogue } from "@/lib/catalogue-store";
import { aed, dateText } from "@/lib/format";
import { estimatePrice, VAT_RATE, type MakingChargeType } from "@/lib/pricing";

const PURITIES: Purity[] = ["24K", "22K", "21K", "18K"];
const UNITS = { g: { label: "grams", grams: 1 }, tola: { label: "tola", grams: 11.6638 }, oz: { label: "troy ounces", grams: 31.1035 } } as const;
type Unit = keyof typeof UNITS;
const field = "mt-1.5 h-12 w-full border border-line-strong bg-chalk px-3 text-[15px] text-ink outline-none focus:border-ink";
const num = (v: string) => v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");

export function Estimator() {
  const { rates } = useCatalogue();
  const [purity, setPurity] = useState<Purity>("22K");
  const [amount, setAmount] = useState("10");
  const [unit, setUnit] = useState<Unit>("g");
  const [mType, setMType] = useState<MakingChargeType>("per_gram");
  const [mValue, setMValue] = useState("20");
  const [investment, setInvestment] = useState(false);

  const grams = Number(amount) * UNITS[unit].grams;
  const value = Number(mValue);
  const zeroVat = investment && purity === "24K";
  const ok = grams > 0 && grams < 50000 && value >= 0 && (mType !== "percent" || value <= 100);
  const e = ok ? estimatePrice({ ratePerGramAed: rates.perGram[purity], weightGrams: grams, makingChargeType: mType, makingChargeValue: value, vatRate: zeroVat ? 0 : VAT_RATE }) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <form className="grid gap-5" onSubmit={(ev) => ev.preventDefault()}>
        <fieldset>
          <legend className="text-[13px] text-stone">Purity</legend>
          <div className="mt-1.5 grid grid-cols-4">
            {PURITIES.map((p) => (
              <button key={p} type="button" aria-pressed={purity === p} onClick={() => setPurity(p)}
                className={`-ml-px h-12 border text-[15px] first:ml-0 ${purity === p ? "relative border-ink bg-ink text-chalk" : "border-line-strong text-ink"}`}>{p}</button>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <label className="block text-[13px] text-stone">Weight
            <input value={amount} onChange={(ev) => setAmount(num(ev.target.value))} inputMode="decimal" className={field} />
          </label>
          <label className="block text-[13px] text-stone">Unit
            <select value={unit} onChange={(ev) => setUnit(ev.target.value as Unit)} className={field}>
              {Object.entries(UNITS).map(([k, u]) => <option key={k} value={k}>{u.label}</option>)}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-[1fr_1fr] gap-3">
          <label className="block text-[13px] text-stone">Making charge, quoted as
            <select value={mType} onChange={(ev) => setMType(ev.target.value as MakingChargeType)} className={field}>
              <option value="per_gram">AED per gram</option>
              <option value="percent">% of gold value</option>
              <option value="fixed">Fixed AED</option>
            </select>
          </label>
          <label className="block text-[13px] text-stone">{mType === "percent" ? "Percent" : "AED"}
            <input value={mValue} onChange={(ev) => setMValue(num(ev.target.value))} inputMode="decimal" className={field} />
          </label>
        </div>
        <label className={`flex items-start gap-3 text-[14px] ${purity === "24K" ? "text-ink" : "text-stone/60"}`}>
          <input type="checkbox" disabled={purity !== "24K"} checked={zeroVat} onChange={(ev) => setInvestment(ev.target.checked)} className="mt-0.5 size-4 accent-[var(--color-ink)]" />
          <span>Investment gold (bars or coins of 99% purity or more): VAT 0%
            <span className="block text-[12px] text-stone">Only 24K bullion qualifies. Jewellery always carries 5%.</span></span>
        </label>
      </form>

      <section aria-label="Estimate" className="border border-line">
        <div className="border-b border-line bg-limestone/60 px-5 py-4">
          <p className="text-[13px] text-stone">Estimated total</p>
          <p className="mt-1 text-[34px] font-semibold tracking-[-0.01em]" aria-live="polite">{e ? aed(Math.round(e.total)) : "—"}</p>
          {unit !== "g" && ok && <p className="text-[13px] text-ink-soft">{amount} {UNITS[unit].label} = {grams.toFixed(2)} g</p>}
        </div>
        {e && (
          <dl className="divide-y divide-line px-5 text-[14px]">
            <div className="flex justify-between py-3"><dt className="text-ink-soft">Gold: {grams.toFixed(2)} g × {aed(rates.perGram[purity])}</dt><dd className="tabular-nums">{aed(e.goldValue)}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-ink-soft">Making charge</dt><dd className="tabular-nums">{aed(e.makingCharge)}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-ink-soft">VAT ({zeroVat ? "0%" : "5%"})</dt><dd className="tabular-nums">{aed(e.vat)}</dd></div>
          </dl>
        )}
        <p className="border-t border-line px-5 py-3 text-[12px] leading-snug text-stone">
          {rates.source === "sample" ? `Uses SAMPLE rates from ${dateText(rates.asOf)}, not live prices.` : `Uses the rate our team set on ${dateText(rates.asOf)}.`} A shop&apos;s own rate on the day decides the real price.
        </p>
      </section>
    </div>
  );
}
