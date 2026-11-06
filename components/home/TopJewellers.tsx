"use client";
// Top jewellers on the homepage: one shop per screen, swiped up like Reels.
// Order: our team's featured order first (Admin, Jewellers, "Featured
// order"), then the shops with the most designs. Ten at most, then a link
// to every jeweller.
import Link from "next/link";
import { useEffect } from "react";
import { ContactActions } from "@/components/ContactActions";
import { ArrowIcon, PinIcon } from "@/components/Icons";
import { PieceImage } from "@/components/PieceImage";
import { Monogram } from "@/components/search/ResultCard";
import type { Shop } from "@/data/catalogue";
import { makingPerGram } from "@/lib/catalogue-query";
import { areaFor, coverFor, useCatalogue } from "@/lib/catalogue-store";
import { directionsHref, shopHref } from "@/lib/links";
import { track } from "@/lib/track";

const LIMIT = 10;

export function TopJewellers() {
  const { shops, pieces } = useCatalogue();
  // Reels-style snapping, only while the homepage is open. "Proximity" snaps
  // when a card is near, so the hero above still scrolls freely.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("snap-reels");
    return () => html.classList.remove("snap-reels");
  }, []);

  const countOf = (s: Shop) => pieces.filter((p) => p.shop === s.slug).length;
  const top = shops
    .filter((s) => countOf(s) > 0)
    .sort((a, b) => (a.featured ?? Infinity) - (b.featured ?? Infinity) || countOf(b) - countOf(a))
    .slice(0, LIMIT);
  if (!top.length) return null;

  return (
    <section aria-labelledby="top-jewellers" className="page page-x mt-10 md:mt-14">
      <h2 id="top-jewellers" className="font-serif text-[34px] leading-none tracking-[-0.015em] md:text-[44px]">Top jewellers</h2>
      <p className="mt-2 text-[15px] text-stone">Swipe up through the shops. Tap one to see all its designs.</p>
      <ol className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5">
        {top.map((s, i) => <Reel key={s.slug} shop={s} rank={i + 1} of={top.length} />)}
      </ol>
      <Link href="/jewellers" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full border border-ink text-[15px] text-ink transition-colors hover:bg-limestone">
        See all jewellers <ArrowIcon />
      </Link>
    </section>
  );
}

function Reel({ shop, rank, of }: { shop: Shop; rank: number; of: number }) {
  const { pieces } = useCatalogue();
  const theirs = pieces.filter((p) => p.shop === shop.slug);
  const cover = coverFor(shop);
  const area = areaFor(shop);
  const making = theirs.map(makingPerGram).filter((m): m is number => m !== null);
  const lowest = making.length ? Math.round(Math.min(...making)) : null;
  const thumbs = theirs.filter((p) => p.slug !== cover?.slug).slice(0, 3);
  const more = theirs.length - 1 - thumbs.length;
  const chip = "rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[12px] text-cream-soft";

  return (
    <li className="reel relative h-[calc(100dvh-var(--header-h)-6.5rem)] max-h-[44rem] min-h-[32rem] overflow-hidden rounded-[1.75rem] bg-cocoa text-cream">
      {cover && <PieceImage name={cover.images[0]} alt="" sizes="(min-width: 768px) 45vw, 100vw" className="absolute inset-0 size-full object-cover" />}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-cocoa via-cocoa/85 via-40% to-transparent to-65%" />
      <span className="absolute left-3.5 top-3.5 rounded-full border border-gold/50 bg-cocoa/75 px-3 py-1 text-[12px] font-medium text-gold">✦ Top jeweller · {rank} of {of}</span>
      <span className="absolute right-3.5 top-3.5 rounded-full bg-cocoa/75 px-3 py-1 text-[12px]">{theirs.length} {theirs.length === 1 ? "design" : "designs"}</span>

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <div className="flex items-center gap-3">
          <Monogram name={shop.name} className="size-12 bg-cream text-[13px] text-ink" />
          <div className="min-w-0">
            <h3 className="font-serif text-[30px] leading-none">{shop.name}</h3>
            {shop.speciality && <p className="mt-1 truncate text-[13px] text-cream-soft">{shop.speciality}</p>}
          </div>
        </div>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          <li className={chip}><PinIcon className="mr-1 inline size-3.5 align-[-2px]" /><b className="font-medium text-cream">{area.name}</b></li>
          {lowest !== null && <li className={chip}>Making from <b className="font-medium text-cream">AED {lowest}/g</b></li>}
          {shop.hours && <li className={chip}>Open <b className="font-medium text-cream">{shop.hours}</b></li>}
          {shop.languages.length > 0 && <li className={chip}>Speaks <b className="font-medium text-cream">{shop.languages.join(", ")}</b></li>}
        </ul>
        {thumbs.length > 0 && (
          <div className="mt-3 flex gap-1.5">
            {thumbs.map((p) => (
              <Link key={p.slug} href={`/piece?slug=${encodeURIComponent(p.slug)}`} className="block h-[4.75rem] w-[3.9rem] overflow-hidden rounded-xl border border-white/15" aria-label={p.name}>
                <PieceImage name={p.images[0]} alt="" sizes="64px" className="size-full object-cover" />
              </Link>
            ))}
            {more > 0 && <Link href={shopHref(shop.slug)} className="grid h-[4.75rem] w-[3.9rem] place-items-center rounded-xl bg-white/10 text-[12px] text-cream-soft">+{more}</Link>}
          </div>
        )}
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          <ContactActions shop={shop} path={shopHref(shop.slug)} layout="whatsapp"
            buttonClass="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-terracotta text-[14px] text-white transition-colors hover:bg-terracotta-deep" />
          <a href={directionsHref(shop)} target="_blank" rel="noopener" onClick={() => !shop.demo && shop.id && track("directions_click", shop.id)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-cocoa-line bg-cocoa/40 text-[14px] text-cream hover:border-gold">Directions</a>
          <Link href={shopHref(shop.slug)} className="inline-flex h-11 items-center justify-center rounded-full border border-cocoa-line bg-cocoa/40 text-[14px] text-cream hover:border-gold">View shop</Link>
        </div>
      </div>
    </li>
  );
}
