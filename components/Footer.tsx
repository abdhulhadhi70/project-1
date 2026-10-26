import Link from "next/link";
import { site } from "@/data/site";

const links = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/for-jewellers", label: "For jewellers" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="page page-x grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-md">
          <p className="font-serif text-[26px] leading-none">{site.name}</p>
          <p className="mt-3 text-[14px] text-stone">
            A listing service: we show the piece and the shop, and the sale happens in the shop. We take no payments.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink-soft hover:text-ink">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="page page-x border-t border-line py-4 text-[12px] text-stone">
        © 2026 {site.name} · Prototype. Jewellers, prices, contact details and images are demonstration data.
      </div>
    </footer>
  );
}
