"use client";
// The homepage. Client-rendered so it follows the live catalogue; the build
// renders it with the demo, so it is never blank while that loads.
import Link from "next/link";
import { Suspense } from "react";
import { HeroSearch } from "@/components/home/HeroSearch";
import { ResultCard } from "@/components/search/ResultCard";
import { ArrowIcon } from "@/components/Icons";
import { PieceImage } from "@/components/PieceImage";
import type { Purity } from "@/data/catalogue";
import { getCatalogue, useCatalogue } from "@/lib/catalogue-store";
import { pieceHref } from "@/lib/links";
import { EMPTY_QUERY, liveTabs, runQuery, searchHref } from "@/lib/catalogue-query";
import { aed, dateText } from "@/lib/format";

export default function Home() {
  // Search first, then the pieces themselves, then the pitch to shops.
  // Category is in the search box, so there is no separate category row.
  return (
    <>
      <Hero />
      <Featured />
      <ListYourShop />
    </>
  );
}

function Hero() {
  const pick = runQuery({ ...EMPTY_QUERY, sort: "newest" })[0];
  return (
    <section className="cocoa-glow relative overflow-hidden text-cream">
      <div className="page page-x grid gap-8 pb-8 pt-8 md:pt-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pb-12 lg:pt-12">
        <div>
          <p className="text-[13px] text-gold">Gold jewellers across the UAE, in one place</p>
          <h1 className="mt-3 font-serif text-[38px] leading-[1.02] tracking-[-0.02em] md:text-[54px] lg:text-[64px]">
            Every jeweller&rsquo;s window, <em className="italic text-gold">before you go.</em>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-cream-soft md:text-[16px]">
            See the pieces, prices and shops of {liveTabs().some((t) => t.id === "coins_bars") ? "jewellers, coin and bar sellers" : "jewellers"} near you. Compare, save the ones you like, then visit the shop to buy.
          </p>
          <div className="mt-6 rounded-2xl bg-card p-3 text-ink sm:p-4">
            <Suspense fallback={<div className="h-28" />}>
              <HeroSearch />
            </Suspense>
          </div>
        </div>
        {pick && <JustListed piece={pick} />}
      </div>
      <Rates />
    </section>
  );
}

/** One heading style for every homepage section, so none shouts over the jewellery. */
function SectionHead({ title, note, href, link }: { title: string; note?: string; href?: string; link?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
      <div>
        <h2 className="font-serif text-[28px] leading-[1.1] tracking-[-0.01em] md:text-[34px]">{title}</h2>
        {note && <p className="mt-1 text-[14px] text-stone">{note}</p>}
      </div>
      {href && <Link href={href} className="inline-flex min-h-11 shrink-0 items-center text-[14px] text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">{link}</Link>}
    </div>
  );
}

function Featured() {
  const list = runQuery({ ...EMPTY_QUERY, sort: "newest" }).slice(0, 8);
  if (!list.length) return null;
  return (
    <section className="page page-x mt-12 md:mt-16">
      <SectionHead title="Featured jewellery" note="Recently listed by jewellers on Tibr" href={searchHref({})} link="See all pieces" />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {list.map((p, i) => <li key={p.slug}><ResultCard piece={p} layout="grid" priority={i < 2} /></li>)}
      </ul>
    </section>
  );
}

function JustListed({ piece }: { piece: import("@/data/catalogue").Piece }) {
  const shop = getCatalogue().shops.find((s) => s.slug === piece.shop);
  return (
    <Link href={pieceHref(piece.slug)} className="group hidden flex-col rounded-2xl border border-cocoa-line bg-cocoa-2/70 p-3 lg:flex">
      <div className="flex items-center justify-between px-2 pb-3 pt-1">
        <p className="text-[13px] text-gold">Just listed</p>
        <span className="grid size-9 place-items-center rounded-full border border-cocoa-line text-cream transition-colors group-hover:border-gold group-hover:text-gold"><ArrowIcon className="size-4" /></span>
      </div>
      <div className="aspect-square overflow-hidden rounded-xl bg-limestone">
        <PieceImage name={piece.images[0]} alt={piece.name} sizes="30vw" priority
          className="size-full object-cover transition-transform duration-700 ease-quiet group-hover:scale-[1.03]" />
      </div>
      <div className="px-2 pb-1 pt-4">
        <p className="font-serif text-[21px] leading-tight">{piece.name}</p>
        <p className="mt-1 flex items-center justify-between gap-3 text-[14px] text-cream-soft">
          <span className="truncate">{shop?.name}</span>
          <span className="shrink-0 font-semibold text-cream">{piece.price.kind === "on_request" ? "Price on request" : aed(piece.price.aed)}</span>
        </p>
      </div>
    </Link>
  );
}

function Rates() {
  const { rates, settings } = useCatalogue();
  if (settings?.sections?.rates === false) return null;
  const order: Purity[] = (["24K", "22K", "21K", "18K"] as Purity[]).filter((k) => rates.perGram[k]);
  return (
    <div className="border-t border-cocoa-line">
      <div className="page page-x flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
        <div className="min-w-0">
          <h2 className="text-[14px] font-medium text-cream">Gold today, AED per gram</h2>
          <p className="text-[12px] text-cream-soft">
            {rates.source === "sample"
              ? `Sample rates · ${dateText(rates.asOf)} · not live`
              : `Set by our team · ${dateText(rates.asOf)}, ${new Date(rates.asOf).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" })} · shops' own rates may differ`}
          </p>
        </div>
        <dl className="flex flex-1 flex-wrap gap-x-7 gap-y-2">
          {order.map((k) => (
            <div key={k} className="flex items-baseline gap-2">
              <dt className="text-[13px] text-cream-soft">{k}</dt>
              <dd className="text-[18px] font-semibold tabular-nums text-gold">{aed(rates.perGram[k]).replace("AED ", "")}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function ListYourShop() {
  const points = ["Free to list, no commission", "Add and edit pieces from your phone", "Customers message, call or visit you directly"];
  return (
    <section className="page page-x mt-12 md:mt-16">
      <div className="cocoa-glow grid gap-8 overflow-hidden rounded-2xl p-6 text-cream md:grid-cols-[1.3fr_1fr] md:items-center md:p-10">
        <div>
          <p className="text-[13px] text-gold">For jewellers</p>
          <h2 className="mt-2 font-serif text-[30px] leading-[1.05] tracking-[-0.015em] md:text-[40px]">
            Your shop, <em className="italic text-gold">seen by more customers.</em>
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-cream-soft">
            No website or Instagram needed. List your designs, change photos and prices whenever your stock changes, and customers find you.
          </p>
          <Link href="/for-jewellers" className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-[15px] text-white transition-colors hover:bg-terracotta-deep">
            List your shop <ArrowIcon />
          </Link>
        </div>
        <ul className="grid gap-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-3 border-b border-cocoa-line py-3 text-[15px] last:border-0">
              <span aria-hidden className="text-gold">✦</span>{p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

