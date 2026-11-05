"use client";
// The homepage. Client-rendered so it follows the live catalogue; the build
// renders it with the demo, so it is never blank while that loads.
import Link from "next/link";
import { Suspense } from "react";
import { HeroSearch } from "@/components/home/HeroSearch";
import { QuickEstimator } from "@/components/home/QuickEstimator";
import { ArrowIcon } from "@/components/Icons";
import { PieceImage } from "@/components/PieceImage";
import { Monogram, ResultCard } from "@/components/search/ResultCard";
import { CATEGORIES, heroImage, type Purity } from "@/data/catalogue";
import { areaFor, coverFor, getCatalogue, useCatalogue } from "@/lib/catalogue-store";
import { shopHref } from "@/lib/links";
import { EMPTY_QUERY, liveAreas, liveTabs, parseQuery, runQuery, searchHref } from "@/lib/catalogue-query";
import { aed, dateText } from "@/lib/format";

export default function Home() {
  const { settings } = useCatalogue();
  const on = (k: string) => settings?.sections?.[k] !== false; // the admin can switch sections off
  return (
    <>
      <Hero />
      {on("rates") && <Rates />}
      {on("categories") && <Categories />}
      {on("newest") && <Row title="Newest pieces" note="The latest pieces listed by jewellers" href={searchHref({ sort: "newest" })}
        list={runQuery({ ...EMPTY_QUERY, tab: "jewellery" }).slice(0, 4)} />}
      {on("bridal") && liveTabs().some((t) => t.id === "bridal") && <Row title="For the wedding" note="Bridal sets, coin necklaces, bangle stacks and bands" href={searchHref({ tab: "bridal" })}
        list={runQuery({ ...EMPTY_QUERY, tab: "bridal" }).slice(0, 4)} />}
      {on("bullion") && liveTabs().some((t) => t.id === "coins_bars") && <Bullion />}
      {/* With two jewellers, districts would repeat the jewellers row. */}
      {on("districts") && liveAreas().length > 2 && <Districts />}
      {on("jewellers") && <Jewellers />}
      {on("estimator") && <Section title="What should it cost?" note="Gold at the day's rate, plus the making charge, plus VAT. Every price on the site is worked out this way.">
        <QuickEstimator />
      </Section>}
      <ListYourShop />
      {on("popular") && <PopularSearches />}
    </>
  );
}

function Section({ title, note, href, link = "See all", children }: { title: string; note?: string; href?: string; link?: string; children: React.ReactNode }) {
  return (
    <section className="page page-x mt-16 md:mt-20">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h2 className="font-serif text-[28px] leading-none tracking-[-0.01em] md:text-[34px]">{title}</h2>
          {note && <p className="mt-2 text-[14px] text-stone">{note}</p>}
        </div>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1.5 text-[14px] text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            {link} <ArrowIcon className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Hero() {
  return (
    <section>
      <div className="relative h-[12rem] overflow-hidden bg-limestone sm:h-[18rem] lg:h-[27rem]">
        <PieceImage name={heroImage.src} alt={heroImage.alt} width={1600} height={1120} sizes="100vw" priority
          className="size-full object-cover object-[60%_58%]" />
        <p className="absolute right-3 top-2 text-[11px] text-ink/70">Demonstration render</p>
      </div>
      {/* Words sit on a solid card, never on the photograph. */}
      <div className="page page-x relative -mt-14 sm:-mt-24 lg:-mt-44">
        <div className="bg-chalk p-4 shadow-[0_24px_48px_-32px_rgb(37_36_31/0.55)] sm:p-6 lg:max-w-[68rem] lg:p-8">
          <h1 className="font-serif text-[32px] leading-[1.04] tracking-[-0.015em] md:text-[44px] lg:text-[52px]">
            Find a piece that feels <em className="italic">yours.</em>
          </h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
            {liveTabs().some((t) => t.id === "coins_bars") ? "Gold jewellery, coins and bars" : "Gold jewellery"} from jewellers across the UAE. See the price and the shop, then visit to buy.
          </p>
          <div className="mt-5 md:mt-6">
            <Suspense fallback={<div className="h-28" />}>
              <HeroSearch />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

function Rates() {
  const { rates } = useCatalogue();
  const order: Purity[] = (["24K", "22K", "21K", "18K"] as Purity[]).filter((k) => rates.perGram[k]);
  return (
    <section aria-labelledby="rates" className="page page-x mt-10 md:mt-12">
      <div className="grid gap-4 border border-line p-4 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 md:p-5">
        <div>
          <h2 id="rates" className="text-[15px] font-medium">Gold rate, AED per gram</h2>
          <p className="text-[12px] text-stone">
            {rates.source === "sample"
              ? `Sample rates for the demo · ${dateText(rates.asOf)} · not live`
              : `Set by our team · ${dateText(rates.asOf)}, ${new Date(rates.asOf).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" })} · shops' own rates may differ`}
          </p>
        </div>
        <dl className={`grid gap-px bg-line ${order.length === 4 ? "grid-cols-4" : order.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {order.map((k) => (
            <div key={k} className="bg-chalk px-2 py-1.5 md:px-4">
              <dt className="text-[12px] text-stone">{k}</dt>
              <dd className="text-[15px] font-semibold tabular-nums md:text-[17px]">{aed(rates.perGram[k]).replace("AED ", "")}</dd>
            </div>
          ))}
        </dl>
        <Link href="/gold-price" className="inline-flex items-center gap-1.5 text-[13px] text-ink underline decoration-line-strong underline-offset-4">
          Price estimator <ArrowIcon className="size-3.5" />
        </Link>
      </div>
    </section>
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
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-6 md:overflow-visible md:px-0 lg:grid-cols-11">
        {tiles.map((t) => (
          <li key={t.id} className="w-28 shrink-0 md:w-auto">
            <Link href={searchHref({ tab: t.section, category: t.id })} className="group block">
              <div className="aspect-square overflow-hidden bg-limestone">
                <PieceImage name={t.image} alt="" sizes="(min-width: 1024px) 9vw, 112px"
                  className="size-full object-cover transition-transform duration-700 ease-quiet group-hover:scale-[1.05]" />
              </div>
              <p className="mt-2 text-[14px] text-ink">{t.label}</p>
              <p className="text-[12px] text-stone">{t.count} {t.count === 1 ? "piece" : "pieces"}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Row({ title, note, href, list }: { title: string; note: string; href: string; list: import("@/data/catalogue").Piece[] }) {
  return (
    <Section title={title} note={note} href={href}>
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
        {list.map((p) => <li key={p.slug} className="w-[68vw] max-w-72 shrink-0 md:w-auto md:max-w-none"><ResultCard piece={p} layout="grid" /></li>)}
      </ul>
    </Section>
  );
}

function Bullion() {
  const list = runQuery({ ...EMPTY_QUERY, tab: "coins_bars", sort: "price-asc" }).slice(0, 3);
  return (
    <Section title="Coins and bars" note="Priced from the day's rate, with the premium shown separately." href={searchHref({ tab: "coins_bars" })}>
      <div className="grid gap-5 lg:grid-cols-[1fr_3fr]">
        <div className="border-l-2 border-brass pl-4 text-[14px] leading-relaxed text-ink-soft">
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

function Districts() {
  return (
    <Section title="Gold districts" note="Where the jewellers in this demo are, by area." href="/jewellers" link="All jewellers">
      <ul className={`grid gap-px bg-line sm:grid-cols-2 ${liveAreas().length > 2 ? "lg:grid-cols-4" : ""}`}>
        {liveAreas().map((a) => {
          const { shops, pieces } = getCatalogue();
          const here = shops.filter((s) => s.area === a.slug);
          const count = pieces.filter((p) => here.some((s) => s.slug === p.shop)).length;
          return (
            <li key={a.slug} className="bg-chalk">
              <Link href={searchHref({ location: a.slug })} className="flex h-full flex-col p-4 hover:bg-limestone/60">
                <span className="text-[12px] text-stone">{a.emirate}</span>
                <span className="mt-0.5 text-[16px] text-ink">{a.name}</span>
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
    <Section title="Jewellers" note="Every piece belongs to a shop you can visit." href="/jewellers" link="Find a jeweller">
      <ul className={`no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:gap-5 md:overflow-visible md:px-0 ${shops.length <= 2 ? "md:grid-cols-2" : "md:grid-cols-4"}`}>
        {shops.slice(0, 8).map((s) => {
          const cover = coverFor(s);
          const area = areaFor(s);
          return (
            <li key={s.slug} className="w-60 shrink-0 md:w-auto">
              <Link href={shopHref(s.slug)} className="group block border border-line">
                <div className="aspect-[16/10] overflow-hidden bg-limestone">
                  <PieceImage name={cover?.images[0] ?? "hero"} alt="" sizes="(min-width: 768px) 24vw, 240px"
                    className="size-full object-cover transition-transform duration-700 ease-quiet group-hover:scale-[1.04]" />
                </div>
                <div className="flex items-center gap-3 p-3">
                  <Monogram name={s.name} className="size-9 text-[12px]" />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] text-ink">{s.name}</p>
                    <p className="truncate text-[12px] text-stone">{area.name} · {s.speciality}</p>
                  </div>
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
  return (
    <section className="page page-x mt-16 md:mt-20">
      <div className="grid gap-5 bg-ink p-6 text-chalk md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <h2 className="font-serif text-[30px] leading-[1.05] md:text-[38px]">Do you have a jewellery collection?</h2>
          <p className="mt-2 max-w-xl text-[15px] text-chalk/80">
            List your pieces from your phone in under a minute. Customers see the price and your shop, then message, call or visit. No commission on sales.
          </p>
        </div>
        <Link href="/for-jewellers" className="inline-flex h-12 items-center justify-center gap-2 bg-chalk px-6 text-[15px] text-ink hover:bg-limestone">
          List your shop <ArrowIcon />
        </Link>
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
