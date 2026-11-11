"use client";
// The homepage. Emerald velvet and gold on top for the first impression
// (photograph, headline, search, today's rates), then what there is to
// find, how it works, and the pitch to jewellers. Client-rendered so it
// follows the live catalogue; the build renders it with the demo.
import Link from "next/link";
import { Suspense } from "react";
import { GoldRateButton } from "@/components/GoldRateButton";
import { HeroSearch } from "@/components/home/HeroSearch";
import { ArrowIcon } from "@/components/Icons";
import { PieceImage } from "@/components/PieceImage";
import { CATEGORIES, type Piece, type Purity } from "@/data/catalogue";
import { areaFor, shopFor, useCatalogue } from "@/lib/catalogue-store";
import { pieceHref } from "@/lib/links";
import { EMPTY_QUERY, runQuery, searchHref } from "@/lib/catalogue-query";
import { aed, dateText } from "@/lib/format";

export default function Home() {
  return (
    <>
      <Hero />
      <GoldRateButton />
      <Categories />
      <JustListed />
      <HowItWorks />
      <ListYourShop />
    </>
  );
}

/** A photograph from public/images/site, WebP with a JPEG fallback. */
function SiteImage({ name, alt, className, priority = false }: { name: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <picture>
      <source type="image/webp" srcSet={`/images/site/${name}-600.webp 640w, /images/site/${name}.webp 1100w`} sizes="(min-width: 1024px) 45vw, 100vw" />
      <img src={`/images/site/${name}.jpg`} srcSet={`/images/site/${name}-600.jpg 640w, /images/site/${name}.jpg 1100w`} sizes="(min-width: 1024px) 45vw, 100vw"
        alt={alt} className={className} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />
    </picture>
  );
}

const priceText = (p: Piece) => (p.price.kind === "on_request" ? "Price on request" : aed(p.price.aed));

function Hero() {
  const words = (
    <>
      <p className="label-caps text-gold">Gold jewellers of the UAE</p>
      <h1 className="mt-3 font-serif text-[40px] leading-[1.04] tracking-[-0.01em] md:text-[56px] lg:text-[68px]">
        Every jeweller&rsquo;s window, <em className="italic text-gold">before you go.</em>
      </h1>
      <p className="mt-3 max-w-md text-[16px] font-light leading-relaxed text-cream/85 md:text-[18px]">
        See the piece, the price and the shop. Then visit, and buy it there.
      </p>
      <div className="mt-6 max-w-xl">
        <Suspense fallback={<div className="h-[4.25rem] rounded-full bg-chalk" />}>
          <HeroSearch />
        </Suspense>
      </div>
      <Rates />
    </>
  );
  return (
    <section className="bg-cocoa text-cream">
      {/* Phone and tablet: the photograph leads, the words rise over its lower edge. */}
      <div className="lg:hidden">
        <div className="relative">
          <SiteImage name="hero-model" alt="A woman wearing a gold coin necklace and jhumka earrings against green velvet" priority
            className="aspect-[4/5] max-h-[78vh] w-full object-cover object-[center_20%]" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-cocoa via-cocoa/70 to-transparent" />
        </div>
        <div className="page-x relative -mt-24 pb-6">{words}</div>
      </div>
      {/* Desktop: words and search beside the photograph. */}
      <div className="page page-x hidden items-center gap-14 py-12 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>{words}</div>
        <SiteImage name="hero-model" alt="A woman wearing a gold coin necklace and jhumka earrings against green velvet" priority
          className="aspect-[4/5] max-h-[42rem] w-full rounded-[2rem] object-cover object-[center_20%]" />
      </div>
      <div aria-hidden className="mx-auto h-px max-w-[90rem] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
    </section>
  );
}

function Rates() {
  const { rates, settings } = useCatalogue();
  if (settings?.sections?.rates === false) return null;
  const order: Purity[] = (["24K", "22K", "21K", "18K"] as Purity[]).filter((k) => rates.perGram[k]);
  const fils = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div className="mt-6 max-w-xl">
      <h2 className="text-[13px] text-cream-soft">
        <span className="text-gold">Gold today</span>, AED per gram
        <span className="text-cream-soft/80"> · {rates.source === "sample" ? `sample rates, ${dateText(rates.asOf)}` : dateText(rates.asOf)}</span>
      </h2>
      <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
        {order.map((k) => (
          <div key={k} className="flex items-baseline gap-2">
            <dt className="text-[13px] text-cream-soft">{k}</dt>
            <dd className="text-[17px] font-medium tabular-nums text-cream">{fils(rates.perGram[k])}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Categories() {
  const { pieces } = useCatalogue();
  const tiles = CATEGORIES.map((c) => ({ ...c, first: pieces.find((p) => p.category === c.id) })).filter((t) => t.first);
  if (tiles.length < 2) return null;
  return (
    <section aria-label="Browse by category" className="bg-cocoa text-cream">
      <ul className="page page-x grid grid-cols-4 gap-x-3 gap-y-5 py-8 sm:grid-cols-7 md:py-10 lg:flex lg:justify-center lg:gap-10">
        {tiles.map((t) => (
          <li key={t.id}>
            <Link href={searchHref({ tab: t.section, category: t.id })} className="group flex flex-col items-center text-center">
              <span className="block size-[4.5rem] rounded-full border border-gold/70 p-[3px] transition-colors group-hover:border-gold md:size-24">
                <PieceImage name={t.first!.images[0]} alt="" sizes="96px" className="size-full rounded-full object-cover" />
              </span>
              <span className="mt-2 text-[13px] text-cream md:text-[14px]">{t.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Tile({ piece }: { piece: Piece }) {
  const shop = shopFor(piece);
  return (
    <Link href={pieceHref(piece.slug)} className="group block">
      <div className="aspect-square overflow-hidden rounded-2xl bg-cocoa-2">
        <PieceImage name={piece.images[0]} alt={piece.name} sizes="(min-width: 1024px) 22vw, 46vw"
          className="size-full object-cover transition-transform duration-700 ease-quiet group-hover:scale-[1.04]" />
      </div>
      <h3 className="mt-3 font-serif text-[18px] leading-tight">{piece.name}</h3>
      <p className="mt-1 text-[13px] text-cream-soft">by {shop.name} · {areaFor(shop).name}</p>
      <p className="mt-1.5 text-[15px] tabular-nums text-gold">{priceText(piece)}</p>
    </Link>
  );
}

function JustListed() {
  const all = runQuery({ ...EMPTY_QUERY, sort: "newest" });
  if (!all.length) return null;
  // The showpiece is the newest bridal piece when there is one.
  const feature = all.find((p) => p.occasions.includes("bridal") && p.category === "sets") ?? all.find((p) => p.occasions.includes("bridal")) ?? all[0];
  const rest = all.filter((p) => p.slug !== feature.slug).slice(0, 4);
  const shop = shopFor(feature);
  return (
    <section className="bg-cocoa pb-14 text-cream md:pb-20" aria-labelledby="just-listed">
      <div className="page page-x">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label-caps text-gold">Just listed</p>
            <h2 id="just-listed" className="mt-2 font-serif text-[32px] leading-[1.05] md:text-[44px]">New from the <em className="italic">souk</em></h2>
          </div>
          <Link href={searchHref({})} className="inline-flex min-h-11 shrink-0 items-center border-b border-gold pb-0.5 text-[14px] text-gold">All {all.length} pieces</Link>
        </div>
        <div className="mt-5 grid gap-4 md:mt-8 lg:grid-cols-2 lg:gap-6">
          <Link href={pieceHref(feature.slug)} className="group relative block overflow-hidden rounded-3xl">
            <PieceImage name={feature.images[0]} alt={feature.name} sizes="(min-width: 1024px) 45vw, 100vw"
              className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-quiet group-hover:scale-[1.03] lg:aspect-auto lg:h-full" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cocoa via-cocoa/80 to-transparent p-5 pt-20">
              <p className="label-caps text-[10px] text-gold">{feature.occasions.includes("bridal") ? "Bridal" : "Newest"}</p>
              <h3 className="mt-1 font-serif text-[26px] leading-tight md:text-[32px]">{feature.name}</h3>
              <p className="mt-1.5 flex flex-wrap justify-between gap-x-4 text-[14px]">
                <span className="text-cream/85">by {shop.name} · {areaFor(shop).name}</span>
                <span className="tabular-nums text-gold">{priceText(feature)}</span>
              </p>
            </div>
          </Link>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-7 lg:gap-x-6">
            {rest.map((p) => <li key={p.slug}><Tile piece={p} /></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { t: "Free to browse. No account.", d: "Pieces from different jewellers, side by side." },
    { t: "Priced from today's gold rate.", d: "Weight, purity and making charge on every piece." },
    { t: "You buy in the shop.", d: "WhatsApp, call or get directions. We never take payment." },
  ];
  return (
    <section className="bg-chalk py-12 md:py-16" aria-labelledby="how">
      <div className="page page-x">
        <p id="how" className="label-caps text-brass-deep">How it works</p>
        <ol className="mt-5 grid gap-6 md:grid-cols-3 md:gap-10">
          {steps.map((s, i) => (
            <li key={s.t} className="flex gap-4">
              <span aria-hidden className="w-7 shrink-0 font-serif text-[34px] leading-none text-brass-deep">{i + 1}</span>
              <div>
                <p className="text-[16px] font-medium text-ink">{s.t}</p>
                <p className="mt-0.5 text-[15px] text-stone">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ListYourShop() {
  return (
    <section className="relative isolate overflow-hidden bg-cocoa text-cream">
      <SiteImage name="craft" alt="" className="absolute inset-0 -z-10 size-full object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-cocoa via-cocoa/85 to-cocoa/40 md:bg-gradient-to-r" />
      <div className="page page-x flex min-h-[22rem] flex-col justify-end py-10 md:min-h-[26rem] md:justify-center md:py-16">
        <p className="label-caps text-gold">For jewellers</p>
        <h2 className="mt-2 max-w-xl font-serif text-[32px] leading-[1.05] md:text-[48px]">
          Your shop, seen by <em className="italic text-gold">more customers.</em>
        </h2>
        <p className="mt-3 max-w-md text-[16px] font-light leading-relaxed text-cream/85">
          Free to list. No website needed. Change your designs from your phone, and customers message, call or visit you.
        </p>
        <Link href="/for-jewellers" className="btn-gold mt-6 inline-flex h-12 items-center gap-2 self-start rounded-full px-6 text-[15px] font-medium">
          List your shop <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
