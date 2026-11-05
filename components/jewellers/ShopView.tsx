"use client";
// A jeweller's page, read from the live catalogue in the browser.
import Link from "next/link";
import { useEffect } from "react";
import { ContactActions } from "@/components/ContactActions";
import { ArrowIcon } from "@/components/Icons";
import { ShopMap } from "@/components/piece/ShopMap";
import { Monogram, ResultCard } from "@/components/search/ResultCard";
import { CATEGORIES } from "@/data/catalogue";
import { areaFor, catalogueSettled, useCatalogue } from "@/lib/catalogue-store";
import { searchHref, sortPieces } from "@/lib/catalogue-query";
import { track } from "@/lib/track";

export function ShopView({ slug }: { slug: string }) {
  const catalogue = useCatalogue();
  const pieces = catalogue.pieces;
  const shop = catalogue.shopBySlug.get(slug);
  useEffect(() => {
    if (shop) {
      document.title = `${shop.name} · ${catalogue.settings?.siteName ?? "Tibr"}`;
      if (!shop.demo) track("shop_view", shop.id);
    }
  }, [shop, catalogue.settings?.siteName]);
  if (!shop) {
    return (
      <section className="page page-x py-24 text-center">
        {catalogueSettled() ? (
          <>
            <p className="font-serif text-[32px] leading-tight">This jeweller isn&apos;t listed.</p>
            <Link href="/jewellers" className="mt-6 inline-flex h-11 items-center border border-ink px-5 text-[14px]">All jewellers</Link>
          </>
        ) : <p className="text-[14px] text-stone">Loading…</p>}
      </section>
    );
  }
  const area = areaFor(shop);
  const theirs = sortPieces(pieces.filter((p) => p.shop === shop.slug), "newest");
  const cats = CATEGORIES.filter((c) => theirs.some((p) => p.category === c.id));
  const directions = `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`;
  return (
    <>
      <section className="page page-x pt-5 md:pt-8">
        <nav aria-label="Breadcrumb" className="text-[13px] text-stone">
          <Link href="/" className="hover:text-ink">Home</Link> <span aria-hidden>›</span> <Link href="/jewellers" className="hover:text-ink">Jewellers</Link> <span aria-hidden>›</span> {shop.name}
        </nav>
        <div className="mt-6 grid gap-8 border-b border-line pb-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <Monogram name={shop.name} className="size-14 text-[16px] md:size-16" />
              <div>
                <h1 className="font-serif text-[34px] leading-none tracking-[-0.015em] md:text-[48px]">{shop.name}</h1>
                <p className="mt-1.5 text-[14px] text-stone">{area.name}, {area.emirate} · {shop.speciality}</p>
              </div>
            </div>
            <p className="mt-6 max-w-[52ch] text-[16px] leading-relaxed text-ink-soft">{shop.about}</p>
            <dl className="mt-6 grid gap-px border border-line bg-line text-[14px] sm:grid-cols-3">
              <div className="bg-chalk p-3"><dt className="text-[12px] text-stone">Listed</dt><dd className="mt-0.5">{theirs.length} pieces</dd></div>
              <div className="bg-chalk p-3"><dt className="text-[12px] text-stone">Speaks</dt><dd className="mt-0.5">{shop.languages.join(", ")}</dd></div>
              <div className="bg-chalk p-3"><dt className="text-[12px] text-stone">Hours</dt><dd className="mt-0.5">{shop.hours}</dd></div>
            </dl>
            <div className="mt-6 max-w-md"><ContactActions shop={shop} /></div>
            {shop.demo && <p className="mt-4 border-l-2 border-brass pl-3 text-[12px] text-stone">Demonstration jeweller. This shop, its hours and its pieces are invented for the prototype.</p>}
          </div>
          <div className="lg:col-span-5">
            <ShopMap shop={shop} className="h-64 lg:h-full lg:min-h-80" />
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 text-[13px]">
              <span className="text-ink-soft">{shop.address}</span>
              <a href={directions} target="_blank" rel="noopener" onClick={() => !shop.demo && track("directions_click", shop.id)} className="inline-flex items-center gap-1 text-ink underline decoration-line-strong underline-offset-4">Get directions <ArrowIcon className="size-3.5" /></a>
            </div>
          </div>
        </div>
      </section>
      <section className="page page-x mt-10">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-serif text-[28px] leading-none md:text-[34px]">Pieces from {shop.name}</h2>
          <Link href={searchHref({ shop: shop.slug, tab: theirs.every((p) => p.category === "coins" || p.category === "bars") ? "coins_bars" : "jewellery" })}
            className="text-[13px] text-ink underline decoration-line-strong underline-offset-4">Search and filter these</Link>
        </div>
        {cats.length > 1 && (
          <p className="mb-4 text-[13px] text-stone">{cats.map((c) => `${theirs.filter((p) => p.category === c.id).length} ${c.label.toLowerCase()}`).join(" · ")}</p>
        )}
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
          {theirs.map((p, i) => <li key={p.slug}><ResultCard piece={p} layout="grid" priority={i < 4} /></li>)}
        </ul>
      </section>
    </>
  );
}
