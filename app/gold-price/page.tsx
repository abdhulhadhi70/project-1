import type { Metadata } from "next";
import { Estimator } from "@/components/Estimator";
import { PageHeader } from "@/components/PageHeader";
import { RatesTable } from "@/components/RatesTable";

export const metadata: Metadata = { title: "Gold price estimator", description: "Work out what a piece of gold should cost: gold at the day's rate, plus making charge, plus VAT." };

export default function GoldPricePage() {
  return (
    <>
    <PageHeader title="Gold price estimator"
      intro={<>Every gold price is three parts: the gold at the day&apos;s rate, the jeweller&apos;s making charge, and VAT. Put in the weight and the making charge a shop quotes, and compare shops on the same footing.</>} />
    <div className="page page-x pt-8 md:pt-10">
      <Estimator />

      <section className="mt-10 grid gap-3 md:mt-14 md:gap-5 lg:grid-cols-3" aria-labelledby="how">
        <h2 id="how" className="sr-only">How gold is priced</h2>
        <RatesTable />
        <div className="rounded-3xl border border-line bg-card p-5 text-[15px] leading-relaxed text-ink-soft">
          <h3 className="font-serif text-[22px] text-ink">Making charges</h3>
          <p className="mt-2">Shops quote making charges three ways: per gram, as a percentage of the gold value, or as a fixed amount. The search compares them per gram, so the lowest really is the lowest.</p>
          <p className="mt-2">Making charges are often negotiable, especially on heavier pieces.</p>
        </div>
        <div className="rounded-3xl border border-line bg-card p-5 text-[15px] leading-relaxed text-ink-soft">
          <h3 className="font-serif text-[22px] text-ink">VAT and weights</h3>
          <p className="mt-2">VAT is 5% on jewellery. Investment gold, meaning bars and coins of 99% purity or more, is zero-rated.</p>
          <p className="mt-2">1 tola = 11.664 g. 1 troy ounce = 31.103 g. The ten tola bar weighs 116.64 g.</p>
        </div>
      </section>
    </div>
    </>
  );
}
