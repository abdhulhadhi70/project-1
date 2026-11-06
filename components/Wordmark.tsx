import Link from "next/link";
import { site } from "@/data/site";

export function Wordmark({ withDescriptor = false, tone = "light" }: { withDescriptor?: boolean; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <Link href="/" className="group inline-flex items-baseline gap-3 leading-none" aria-label={`${site.name}, home`}>
      <span className={`font-serif text-[28px] tracking-[-0.01em] ${dark ? "text-cream" : "text-ink"}`}>
        {site.name}<span aria-hidden className={`ml-0.5 align-super text-[13px] ${dark ? "text-gold" : "text-brass-deep"}`}>✦</span>
      </span>
      {withDescriptor && (
        <span className={`hidden border-l pl-3 text-[12px] tracking-[0.02em] lg:inline ${dark ? "border-cocoa-line text-cream-soft" : "border-line-strong text-stone"}`}>
          {site.descriptor}
        </span>
      )}
    </Link>
  );
}
