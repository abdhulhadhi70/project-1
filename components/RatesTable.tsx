"use client";
import type { Purity } from "@/data/catalogue";
import { useCatalogue } from "@/lib/catalogue-store";
import { aed, dateText } from "@/lib/format";

/** The day's rates per purity, as set by the admin (or the demo's samples). */
export function RatesTable() {
  const { rates } = useCatalogue();
  const order = (["24K", "22K", "21K", "18K"] as Purity[]).filter((k) => rates.perGram[k]);
  return (
    <div>
      <h3 className="text-[15px] font-medium">{rates.source === "sample" ? "Sample rates" : "Today's rates"}, AED per gram</h3>
      <p className="text-[12px] text-stone">{dateText(rates.asOf)} · {rates.source === "sample" ? "demonstration data, not live" : "set by our team; shops' own rates may differ"}</p>
      <dl className="mt-3 divide-y divide-line border-y border-line text-[14px]">
        {order.map((k) => (
          <div key={k} className="flex justify-between py-2"><dt>{k}</dt><dd className="tabular-nums">{aed(rates.perGram[k])}</dd></div>
        ))}
      </dl>
    </div>
  );
}
