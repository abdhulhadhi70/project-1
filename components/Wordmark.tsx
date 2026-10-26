import Link from "next/link";
import { site } from "@/data/site";

export function Wordmark({ withDescriptor = false }: { withDescriptor?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-baseline gap-3 leading-none" aria-label={`${site.name}, home`}>
      <span className="font-serif text-[28px] tracking-[-0.01em] text-ink">{site.name}</span>
      {withDescriptor && (
        <span className="hidden lg:inline border-l border-line-strong pl-3 text-[12px] tracking-[0.02em] text-stone">
          {site.descriptor}
        </span>
      )}
    </Link>
  );
}
