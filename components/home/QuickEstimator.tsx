"use client";
// A small "what should this cost?" calculator, the jewellery counterpart of
// a listing site's mortgage calculator. Same formula as every price here.
import Link from "next/link";
import { useState } from "react";
import type { Purity } from "@/data/catalogue";
import { useCatalogue } from "@/lib/catalogue-store";
import { aed } from "@/lib/format";
import { estimatePrice } from "@/lib/pricing";

const PURITIES: Purity[] = ["24K", "22K", "21K", "18K"];
const field = "mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-card px-3.5 text-[16px] text-ink outline-none focus:border-ink";

export function QuickEstimator() {
  const { rates } = useCatalogue();
  const [purity, setPurity] = useState<Purity>("22K");
  const [weight, setWeight] = useState("10");
  const [making, setMaking] = useState("20");
  const w = Number(weight), m = Number(making);
  const ok = w > 0 && w < 5000 && m >= 0 && m < 1000;
  const e = ok ? estimatePrice({ ratePerGramAed: rates.perGram[purity], weightGrams: w, makingChargeType: "per_gram", makingChargeValue: m }) : null;
  return (
    <div className="grid gap-6 rounded-xl border border-line bg-card p-5 md:grid-cols-[1.2fr_1fr] md:p-7">
      <form className="grid grid-cols-3 gap-3" onSubmit={(ev) => ev.preventDefault()}>
        <label className="block text-[13px] text-stone">Purity
          <select value={purity} onChange={(ev) => setPurity(ev.target.value as Purity)} className={field}>
            {PURITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="block text-[13px] text-stone">Weight (g)
          <input value={weight} onChange={(ev) => setWeight(ev.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" className={field} />
        </label>
        <label className="block text-[13px] text-stone">Making (AED/g)
          <input value={making} onChange={(ev) => setMaking(ev.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" className={field} />
        </label>
        <p className="col-span-3 text-[12px] text-stone">Uses the {rates.source === "sample" ? "sample " : ""}{purity} rate of {aed(rates.perGram[purity])}/g and 5% VAT. {rates.source === "sample" ? "Not a live price." : "Shops' own rates may differ."}</p>
      </form>
      <div className="flex flex-col justify-between border-t border-line pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <div>
          <p className="text-[13px] text-stone">Estimated total</p>
          <p className="mt-1 text-[30px] font-semibold tracking-[-0.01em]" aria-live="polite">{e ? aed(Math.round(e.total)) : "—"}</p>
          {e && <p className="mt-1 text-[13px] text-ink-soft">Gold {aed(e.goldValue)} · making {aed(e.makingCharge)} · VAT {aed(e.vat)}</p>}
        </div>
        <Link href="/gold-price" className="mt-4 text-[13px] text-ink underline decoration-line-strong underline-offset-4">Open the full estimator</Link>
      </div>
    </div>
  );
}
