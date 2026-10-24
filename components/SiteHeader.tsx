import Link from "next/link";
import type { Messages } from "@/lib/i18n";

export function SiteHeader({ locale, messages: m }: { locale: string; messages: Messages }) {
  return (
    <header className="bg-charcoal text-ivory">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href={`/${locale}`} className="font-display text-xl font-semibold tracking-wide text-gold-light">
          {m.site.name}
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href={`/${locale}/designs`} className="hover:text-gold-light">{m.nav.designs}</Link>
          <Link href={`/${locale}/shops`} className="hover:text-gold-light">{m.nav.shops}</Link>
          <Link href={`/${locale}/for-jewellers`} className="hidden sm:inline hover:text-gold-light">{m.nav.forJewellers}</Link>
        </nav>
      </div>
    </header>
  );
}
