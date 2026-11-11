import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/Icons";
import { InterestForm } from "@/components/InterestForm";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "For jewellers" };

const reasons = [
  { t: "No website needed", d: "Your shop gets its own page with your pieces, hours, languages, map and contact buttons. No Instagram or website of your own required." },
  { t: "Change it as often as your stock", d: "Designs change every week. Add a piece from your phone in under a minute, swap photos, change the price, or mark it sold." },
  { t: "Customers come to you", d: "They see the piece and the price, then WhatsApp you, call you, or tell you they are coming. The sale happens in your shop." },
];
const steps = [
  { t: "Register your interest", d: "Send the form below. We get back to you to set up your shop page." },
  { t: "Add your pieces", d: "Photos, purity, weight and making charge. Price from the day's gold rate, your own price, or on request." },
  { t: "Keep it fresh", d: "Edit any time. One tap confirms your stock is still in the shop, and your portal shows how many people viewed and contacted you." },
];

export default function ForJewellers() {
  return (
    <>
      <PageHeader kicker="For jewellers" title={<>Your designs, <em className="italic text-gold">seen across the UAE.</em></>}
        intro="List your pieces for free. Customers find them here, then contact you and buy in your shop.">
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#register" className="btn-gold inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium">
            Register your shop <ArrowIcon />
          </a>
          <Link href="/login" className="inline-flex h-12 items-center rounded-full border border-cocoa-line px-6 text-[15px] text-cream hover:border-gold hover:text-gold">
            Jeweller sign in
          </Link>
        </div>
      </PageHeader>

      <section className="page page-x mt-10 md:mt-16" aria-label="Why list">
        <ul className="grid gap-3 md:grid-cols-3 md:gap-5">
          {reasons.map((r) => (
            <li key={r.t} className="rounded-xl border border-line bg-card p-5 md:p-6">
              <span aria-hidden className="text-[18px] text-brass-deep">✦</span>
              <p className="mt-3 font-serif text-[24px] leading-tight">{r.t}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{r.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="page page-x mt-14 md:mt-20" aria-labelledby="how">
        <h2 id="how" className="font-serif text-[32px] leading-none md:text-[44px]">How it works</h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-3 md:gap-5">
          {steps.map((s, i) => (
            <li key={s.t} className="flex gap-4 rounded-xl bg-limestone/70 p-5 md:block md:p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cocoa font-serif text-[18px] text-gold">{i + 1}</span>
              <div>
                <p className="font-serif text-[22px] leading-tight md:mt-4">{s.t}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="page page-x mt-14 md:mt-20" aria-labelledby="not">
        <div className="rounded-xl border border-line bg-card p-5 md:p-8">
          <h2 id="not" className="font-serif text-[28px] leading-none md:text-[36px]">What we do not do</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            No fee to list, no commission, no checkout, no online payment and no deposits. The sale is between you and the customer, in your shop.
          </p>
        </div>
      </section>

      <section id="register" className="page page-x mt-14 scroll-mt-24 md:mt-20" aria-labelledby="register-title">
        <div className="grid gap-8 rounded-xl border border-line bg-card p-5 md:p-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 id="register-title" className="font-serif text-[32px] leading-none md:text-[44px]">Register your shop</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">Tell us about your shop and we will get back to you to set up your page.</p>
          </div>
          <InterestForm />
        </div>
      </section>
    </>
  );
}
