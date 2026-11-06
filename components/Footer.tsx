"use client";
import Link from "next/link";
import { CATEGORIES } from "@/data/catalogue";
import { useCatalogue } from "@/lib/catalogue-store";
import { site } from "@/data/site";
import { liveAreas, liveTabs, searchHref } from "@/lib/catalogue-query";

const company = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/for-jewellers", label: "For jewellers" },
  { href: "/login", label: "Jeweller sign in" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  const { pieces, settings } = useCatalogue();
  const name = settings?.siteName ?? site.name;
  const browse = [
    ...liveTabs().map((t) => ({ href: searchHref({ tab: t.id }), label: t.label })),
    { href: "/jewellers", label: "Jewellers" },
    { href: "/gold-price", label: "Gold price estimator" },
    { href: "/saved", label: "Saved" },
  ];
  const cols = [
    { title: "Browse", links: browse },
    { title: "Categories", links: CATEGORIES.filter((c) => c.section === "jewellery" && pieces.some((p) => p.category === c.id)).map((c) => ({ href: searchHref({ category: c.id }), label: c.label })) },
    { title: "Gold districts", links: liveAreas().map((a) => ({ href: searchHref({ location: a.slug }), label: a.name })) },
    { title: name, links: company },
  ];
  return (
    <footer className="mt-20 bg-cocoa text-cream">
      <div className="page page-x grid gap-8 py-12 md:py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <p className="font-serif text-[30px] leading-none">{name}<span aria-hidden className="ml-0.5 align-super text-[13px] text-gold">✦</span></p>
          <p className="mt-3 text-[14px] leading-relaxed text-cream-soft">
            A listing service: we show the piece, the price and the shop, and the sale happens in the shop. We take no payments.
          </p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-[13px] font-medium text-gold">{c.title}</p>
            <ul className="mt-2.5 space-y-1.5 text-[14px]">
              {c.links.map((l) => <li key={l.href}><Link href={l.href} className="text-cream-soft hover:text-cream">{l.label}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="page page-x border-t border-cocoa-line pb-24 pt-5 text-[12px] text-cream-soft md:pb-5">
        © 2026 {name} · Prototype. Jewellers, prices, rates, contact details and images are demonstration data.
      </div>
    </footer>
  );
}
