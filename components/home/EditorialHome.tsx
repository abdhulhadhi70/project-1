"use client";
// The earlier editorial homepage (hero, categories, rows, bands). Not used:
// since November 2026 the site opens straight on the listings, which testers
// found clearer. Kept so any section can be brought back.
import Link from "next/link";
import { Suspense } from "react";
import { HeroSearch } from "@/components/home/HeroSearch";
import { QuickEstimator } from "@/components/home/QuickEstimator";
import { ArrowIcon } from "@/components/Icons";
import { PieceImage } from "@/components/PieceImage";
import { Monogram, ResultCard } from "@/components/search/ResultCard";
import { CATEGORIES, type Purity } from "@/data/catalogue";
import { areaFor, coverFor, getCatalogue, useCatalogue } from "@/lib/catalogue-store";
import { pieceHref, shopHref } from "@/lib/links";
import { EMPTY_QUERY, liveAreas, liveTabs, parseQuery, runQuery, searchHref } from "@/lib/catalogue-query";
import { aed, dateText } from "@/lib/format";

export function EditorialHome() {
  const { settings } = useCatalogue();
  const on = (k: string) => settings?.sections?.[k] !== false; // the admin can switch sections off
  return (
    <>
      <Hero />
      {on("categories") && <Categories />}
      {on("newest") && <Row title="Newest pieces" note="The latest pieces listed by jewellers" href={searchHref({ sort: "newest" })}
        list={runQuery({ ...EMPTY_QUERY, tab: "jewellery" }).slice(0, 4)} />}
      {on("bridal") && liveTabs().some((t) => t.id === "bridal") && <Row dark title={<>For the <em className="italic text-gold">wedding</em></>} note="Bridal sets, coin necklaces, bangle stacks and bands" href={searchHref({ tab: "bridal" })}
        list={runQuery({ ...EMPTY_QUERY, tab: "bridal" }).slice(0, 4)} />}
      {on("bullion") && liveTabs().some((t) => t.id === "coins_bars") && <Bullion />}
      {/* With two jewellers, districts would repeat the jewellers row. */}
      {on("districts") && liveAreas().length > 2 && <Districts />}
      {on("jewellers") && <Jewellers />}
      {on("estimator") && <Section title="What should it cost?" note="Gold at the day's rate, plus the making charge, plus VAT. Every price on the site is worked out this way.">
        <QuickEstimator />
      </Section>}
      <HowItWorks />
      <ListYourShop />
      {on("popular") && <PopularSearches />}
    </>
  );
}

function Section({ title, note, href, link = "See all", dark = false, children }: { title: React.ReactNode; note?: string; href?: string; link?: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <section className={dark ? "cocoa-glow mt-16 py-14 text-cream md:mt-24 md:py-20" : "mt-16 md:mt-24"}>
      <div className="page page-x">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mb-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-[32px] leading-[1.02] tracking-[-0.015em] md:text-[44px]">{title}</h2>
            {note && <p className={`mt-2 text-[15px] ${dark ? "text-cream-soft" : "text-stone"}`}>{note}</p>}
          </div>
          {href && (
            <Link href={href} className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[14px] transition-colors ${dark ? "border-cocoa-line text-cream hover:border-gold hover:text-gold" : "border-line-strong text-ink hover:border-ink"}`}>
              {link} <ArrowIcon className="size-3.5" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function Hero() {
  const pick = runQuery({ ...EMPTY_QUERY, sort: "newest" })[0];
  return (
    <section className="cocoa-glow relative overflow-hidden text-cream">
      <div className="page page-x grid gap-8 pb-8 pt-10 md:pt-14 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-12 lg:pb-12 lg:pt-16">
        <div>
          <p className="text-[13px] text-gold">Gold jewellers across the UAE, in one place</p>
          <h1 className="mt-3 font-serif text-[42px] leading-[0.98] tracking-[-0.02em] md:text-[64px] lg:text-[76px]">
            Every jeweller&rsquo;s window, <em className="italic text-gold">before you go.</em>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-cream-soft md:text-[17px]">
            See the pieces, prices and shops of {liveTabs().some((t) => t.id === "coins_bars") ? "jewellers, coin and bar sellers" : "jewellers"} near you. Compare, save the ones you like, then visit the shop to buy.
          </p>
          <div className="mt-7 rounded-3xl bg-card p-3 text-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] sm:p-5">
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

function JustListed({ piece }: { piece: import("@/data/catalogue").Piece }) {
  const shop = getCatalogue().shops.find((s) => s.slug === piece.shop);
  return (
    <Link href={pieceHref(piece.slug)} className="group hidden flex-col rounded-3xl border border-cocoa-line bg-cocoa-2/70 p-3 lg:flex">
      <div className="flex items-center justify-between px-2 pb-3 pt-1">
        <p className="text-[13px] text-gold">Just listed</p>
        <span className="grid size-9 place-items-center rounded-full border border-cocoa-line text-cream transition-colors group-hover:border-gold group-hover:text-gold"><ArrowIcon className="size-4" /></span>
      </div>
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-limestone">
        <PieceImage name={piece.images[0]} alt={piece.name} sizes="30vw" priority
          className="size-full object-cover transition-transform duration-700 ease-quiet group-hover:scale-[1.03]" />
      </div>
      <div className="px-2 pb-1 pt-4">
        <p className="font-serif text-[24px] leading-tight">{piece.name}</p>
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
        <Link href="/gold-price" className="inline-flex h-10 items-center gap-2 rounded-full border border-cocoa-line px-4 text-[13px] text-cream hover:border-gold hover:text-gold">
          Price estimator <ArrowIcon className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Categories() {
  const { pieces } = useCatalogue();
  const tiles = CATEGORIES.map((c) => {
    const list = pieces.filter((p) => p.category === c.id);
    return { ...c, count: list.length, image: list[0]?.images[0] };
  }).filter((t) => t.count > 0);
  return (
    <Section title="Browse by category">
      <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:gap-x-6 md:gap-y-6 md:overflow-visible md:px-0">
        {tiles.map((t) => (
          <li key={t.id} className="w-24 shrink-0 md:w-28">
            <Link href={searchHref({ tab: t.section, category: t.id })} className="group block text-center">
              <div className="aspect-square overflow-hidden rounded-full border border-line bg-card p-1.5 transition-colors group-hover:border-brass">
                <PieceImage name={t.image} alt="" sizes="112px"
                  className="size-full rounded-full object-cover transition-transform duration-700 ease-quiet group-hover:scale-[1.06]" />
              </div>
              <p className="mt-2.5 text-[14px] text-ink">{t.label}</p>
              <p className="text-[12px] text-stone">{t.count} {t.count === 1 ? "piece" : "pieces"}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Row({ title, note, href, list, dark = false }: { title: React.ReactNode; note: string; href: string; list: import("@/data/catalogue").Piece[]; dark?: boolean }) {
  return (
    <Section title={title} note={note} href={href} dark={dark}>
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
        {list.map((p) => <li key={p.slug} className="w-[68vw] max-w-72 shrink-0 text-ink md:w-auto md:max-w-none"><ResultCard piece={p} layout="grid" /></li>)}
      </ul>
    </Section>
  );
}

function Bullion() {
  const list = runQuery({ ...EMPTY_QUERY, tab: "coins_bars", sort: "price-asc" }).slice(0, 3);
  return (
    <Section title="Coins and bars" note="Priced from the day's rate, with the premium shown separately." href={searchHref({ tab: "coins_bars" })}>
      <div className="grid gap-5 lg:grid-cols-[1fr_3fr]">
        <div className="rounded-2xl bg-limestone p-5 text-[14px] leading-relaxed text-ink-soft">
          <p>Bars and coins of 99% purity or more are investment gold, which is zero-rated for VAT in the UAE. Jewellery, and coins below 99%, carry 5%.</p>
          <p className="mt-3">The ten tola bar (116.6 g) is still the standard trading size in the Gulf.</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {list.map((p) => <li key={p.slug}><ResultCard piece={p} layout="grid" /></li>)}
        </ul>
      </div>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    { t: "Search every shop at once", d: "Pieces from different jewellers, side by side, by category, purity, price or area." },
    { t: "Compare what matters", d: "Weight, purity and making charge on every listing, with the price worked out the same way." },
    { t: "Message or visit the shop", d: "WhatsApp, call or tell the shop you are coming. You buy in the shop, never online." },
  ];
  return (
    <Section title="How it works" note="We list jewellers' pieces for free. The sale is always between you and the shop.">
      <ol className="grid gap-3 md:grid-cols-3 md:gap-5">
        {steps.map((s, i) => (
          <li key={s.t} className="rounded-2xl border border-line bg-card p-5 md:p-6">
            <span className="grid size-9 place-items-center rounded-full bg-limestone font-serif text-[18px] text-brass-deep">{i + 1}</span>
            <p className="mt-4 font-serif text-[22px] leading-tight">{s.t}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{s.d}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Districts() {
  return (
    <Section title="Gold districts" note="Where the jewellers in this demo are, by area." href="/jewellers" link="All jewellers">
      <ul className={`grid gap-3 sm:grid-cols-2 md:gap-5 ${liveAreas().length > 2 ? "lg:grid-cols-4" : ""}`}>
        {liveAreas().map((a) => {
          const { shops, pieces } = getCatalogue();
          const here = shops.filter((s) => s.area === a.slug);
          const count = pieces.filter((p) => here.some((s) => s.slug === p.shop)).length;
          return (
            <li key={a.slug}>
              <Link href={searchHref({ location: a.slug })} className="flex h-full flex-col rounded-2xl border border-line bg-card p-5 transition-colors hover:border-brass">
                <span className="text-[12px] text-stone">{a.emirate}</span>
                <span className="mt-0.5 font-serif text-[22px] leading-tight text-ink">{a.name}</span>
                <span className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink-soft">{a.note}</span>
                <span className="mt-auto pt-3 text-[13px] text-ink">{count} pieces · {here.length} {here.length === 1 ? "jeweller" : "jewellers"}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function Jewellers() {
  const { shops } = useCatalogue();
  return (
    <Section title="Jewellers on the site" note="Every piece belongs to a shop you can visit." href="/jewellers" link="Find a jeweller">
      <ul className={`no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:gap-5 md:overflow-visible md:px-0 ${shops.length <= 2 ? "md:grid-cols-2" : "md:grid-cols-4"}`}>
        {shops.slice(0, 8).map((s) => {
          const cover = coverFor(s);
          const area = areaFor(s);
          const count = getCatalogue().pieces.filter((p) => p.shop === s.slug).length;
          return (
            <li key={s.slug} className="w-64 shrink-0 md:w-auto">
              <Link href={shopHref(s.slug)} className="group block rounded-2xl border border-line bg-card p-2 transition-shadow hover:shadow-[0_18px_36px_-24px_rgb(30_20_16/0.45)]">
                <div className="aspect-[16/9] overflow-hidden rounded-xl bg-limestone">
                  <PieceImage name={cover?.images[0] ?? "hero"} alt="" sizes="(min-width: 768px) 45vw, 256px"
                    className="size-full object-cover transition-transform duration-700 ease-quiet group-hover:scale-[1.04]" />
                </div>
                <div className="flex items-center gap-3 px-2 pb-2 pt-3">
                  <Monogram name={s.name} className="size-10 text-[12px]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-[20px] leading-tight text-ink">{s.name}</p>
                    <p className="truncate text-[13px] text-stone">{area.name} · {s.speciality}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-limestone px-2.5 py-1 text-[12px] text-ink-soft">{count} {count === 1 ? "piece" : "pieces"}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function ListYourShop() {
  const points = ["Free to list, no commission", "Add and edit pieces from your phone", "Customers message, call or visit you directly"];
  return (
    <section className="page page-x mt-16 md:mt-24">
      <div className="cocoa-glow grid gap-8 overflow-hidden rounded-3xl p-6 text-cream md:grid-cols-[1.3fr_1fr] md:items-center md:p-12">
        <div>
          <p className="text-[13px] text-gold">For jewellers</p>
          <h2 className="mt-2 font-serif text-[34px] leading-[1.02] tracking-[-0.015em] md:text-[48px]">
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
            <li key={p} className="flex items-center gap-3 rounded-2xl border border-cocoa-line bg-cocoa-2/60 px-4 py-3.5 text-[15px]">
              <span aria-hidden className="text-gold">✦</span>{p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PopularSearches() {
  const col = (title: string, links: { label: string; href: string }[]) => ({ title, links });
  const cols = [
    col("Popular in Dubai", [
      { label: "22K chains in Deira Gold Souk", href: searchHref({ category: "chains", purity: ["22K"], location: "deira-gold-souk" }) },
      { label: "Bridal sets in Meena Bazaar", href: searchHref({ tab: "bridal", location: "meena-bazaar" }) },
      { label: "Bangles in Karama", href: searchHref({ category: "bangles", location: "karama" }) },
      { label: "Coin necklaces in Dubai", href: searchHref({ q: "coin", category: "necklaces", location: "dubai" }) },
      { label: "Wedding bands in Dubai", href: searchHref({ tab: "bridal", category: "rings", location: "dubai" }) },
      { label: "Gold bars in Dubai", href: searchHref({ tab: "coins_bars", category: "bars", location: "dubai" }) },
    ]),
    col("Popular in Abu Dhabi", [
      { label: "Engagement rings in Abu Dhabi", href: searchHref({ category: "rings", occasion: "engagement", location: "abu-dhabi" }) },
      { label: "Pearl jewellery on Hamdan Street", href: searchHref({ q: "pearl", location: "hamdan-street" }) },
      { label: "Kids' gold in Abu Dhabi", href: searchHref({ wearer: "kids", location: "abu-dhabi" }) },
    ]),
    col("Popular in Sharjah", [
      { label: "Men's gold in Sharjah", href: searchHref({ wearer: "men", location: "sharjah" }) },
      { label: "Kadas in Rolla", href: searchHref({ category: "bangles", location: "rolla" }) },
      { label: "21K gold in Sharjah", href: searchHref({ purity: ["21K"], location: "sharjah" }) },
    ]),
    col("By budget", [
      { label: "Gold under AED 7,500", href: searchHref({ price: "3000-7500" }) },
      { label: "Gold gifts under AED 3,000", href: searchHref({ price: "under-3000", occasion: "gift" }) },
      { label: "Light pieces under 5 g", href: searchHref({ weight: "under-5" }) },
      { label: "Lowest making charges", href: searchHref({ sort: "making-asc" }) },
    ]),
  ];
  // Only searches that find something; a dead link here would be a broken promise.
  const found = (href: string) => runQuery(parseQuery(new URLSearchParams(href.split("?")[1] ?? ""))).length > 0;
  const live = cols.map((c) => ({ ...c, links: c.links.filter((l) => found(l.href)) })).filter((c) => c.links.length);
  if (!live.length) return null;
  return (
    <section className="page page-x mt-16 border-t border-line pt-8 md:mt-20" aria-labelledby="popular">
      <h2 id="popular" className="text-[15px] font-medium">Popular searches</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {live.map((c) => (
          <div key={c.title}>
            <p className="text-[13px] text-stone">{c.title}</p>
            <ul className="mt-2 space-y-1.5 text-[14px]">
              {c.links.map((l) => <li key={l.href}><Link href={l.href} className="text-ink-soft hover:text-ink hover:underline">{l.label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
