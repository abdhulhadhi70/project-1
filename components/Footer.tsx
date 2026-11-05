import Link from "next/link";
import { CATEGORIES, pieces } from "@/data/catalogue";
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
  const browse = [
    ...liveTabs.map((t) => ({ href: searchHref({ tab: t.id }), label: t.label })),
    { href: "/jewellers", label: "Jewellers" },
    { href: "/gold-price", label: "Gold price estimator" },
    { href: "/saved", label: "Saved" },
  ];
  const cols = [
    { title: "Browse", links: browse },
    { title: "Categories", links: CATEGORIES.filter((c) => c.section === "jewellery" && pieces.some((p) => p.category === c.id)).map((c) => ({ href: searchHref({ category: c.id }), label: c.label })) },
    { title: "Gold districts", links: liveAreas.map((a) => ({ href: searchHref({ location: a.slug }), label: a.name })) },
    { title: site.name, links: company },
  ];
  return (
    <footer className="mt-20 border-t border-line">
      <div className="page page-x grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <p className="font-serif text-[26px] leading-none">{site.name}</p>
          <p className="mt-3 text-[14px] text-stone">
            A listing service: we show the piece, the price and the shop, and the sale happens in the shop. We take no payments.
          </p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-[13px] font-medium text-ink">{c.title}</p>
            <ul className="mt-2.5 space-y-1.5 text-[14px]">
              {c.links.map((l) => <li key={l.href}><Link href={l.href} className="text-ink-soft hover:text-ink">{l.label}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="page page-x border-t border-line py-4 text-[12px] text-stone">
        © 2026 {site.name} · Prototype. Jewellers, prices, rates, contact details and images are demonstration data.
      </div>
    </footer>
  );
}
