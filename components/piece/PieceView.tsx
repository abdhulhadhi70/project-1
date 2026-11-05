"use client";
// A piece's page. It reads the piece from the catalogue in the browser, so a
// piece a jeweller has just added has a page at once.
import Link from "next/link";
import { useEffect } from "react";
import { ContactActions } from "@/components/ContactActions";
import { ArrowIcon, HammerIcon, PinIcon, PurityIcon, ScaleIcon } from "@/components/Icons";
import { PieceGallery } from "@/components/piece/PieceGallery";
import { PriceBreakdown } from "@/components/piece/PriceBreakdown";
import { ShopMap } from "@/components/piece/ShopMap";
import { VisitRequest } from "@/components/piece/VisitRequest";
import { SaveButton } from "@/components/SaveButton";
import { Monogram, PriceLine, ResultCard } from "@/components/search/ResultCard";
import { CATEGORIES, OCCASIONS, STYLES, TABS, WEARERS, sectionOf, type Piece } from "@/data/catalogue";
import { areaFor, catalogueSettled, shopFor, useCatalogue } from "@/lib/catalogue-store";
import { searchHref } from "@/lib/catalogue-query";
import { aed, dateText, makingChargeText, weightText } from "@/lib/format";
import { shopHref } from "@/lib/links";
import { track } from "@/lib/track";

function priceNote(piece: Piece): string {
  const p = piece.price;
  if (p.kind === "on_request") return "The jeweller gives the price in person or by message.";
  if (p.kind === "listed") return "Price set by the jeweller. Confirm it before you visit.";
  return `Indicative: worked out from the gold rate on ${dateText(p.asOf)}. It moves with the gold price.`;
}

const label = <T extends string>(list: readonly { id: T; label: string }[], id?: T) => list.find((x) => x.id === id)?.label;

function SellerCard({ piece, shopCount, withActions = false }: { piece: Piece; shopCount: number; withActions?: boolean }) {
  const shop = shopFor(piece);
  const area = areaFor(shop);
  return (
    <div className="border border-line p-5">
      <p className="text-[12px] text-stone">Sold by</p>
      <Link href={shopHref(shop.slug)} className="mt-2 flex items-center gap-3 hover:underline">
        <Monogram name={shop.name} className="size-11 text-[13px]" />
        <span>
          <span className="block text-[16px] text-ink">{shop.name}</span>
          <span className="block text-[13px] text-stone">{area.name}, {area.emirate}</span>
        </span>
      </Link>
      <dl className="mt-4 space-y-1.5 text-[13px]">
        {shop.hours && <div className="flex gap-2"><dt className="w-20 shrink-0 text-stone">Hours</dt><dd>{shop.hours}</dd></div>}
        <div className="flex gap-2"><dt className="w-20 shrink-0 text-stone">Speaks</dt><dd>{shop.languages.join(", ")}</dd></div>
        <div className="flex gap-2"><dt className="w-20 shrink-0 text-stone">Reference</dt><dd>{piece.code}</dd></div>
      </dl>
      <div className="mt-5 space-y-2.5">
        {withActions && <ContactActions shop={shop} subject={`${piece.name} (ref ${piece.code})`} pieceId={piece.id} layout="column" />}
        <VisitRequest shop={shop} pieceName={piece.name} pieceCode={piece.code} pieceId={piece.id} />
      </div>
      <Link href={shopHref(shop.slug)} className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink">
        All {shopCount} pieces from {shop.name} <ArrowIcon className="size-3.5" />
      </Link>
      <p className="mt-4 border-t border-line pt-3 text-[12px] leading-snug text-stone">
        You deal with the shop directly and pay in the shop. There is no checkout here. {shop.demo && "This jeweller, its contact details and this price are demonstration data."}
      </p>
    </div>
  );
}

export function PieceView({ slug }: { slug: string }) {
  const catalogue = useCatalogue();
  const piece = catalogue.pieceBySlug.get(slug);
  const pieces = catalogue.pieces;
  useEffect(() => {
    if (piece) {
      document.title = `${piece.name} · ${catalogue.settings?.siteName ?? "Tibr"}`;
      if (!piece.demo) track("piece_view", shopFor(piece).id, piece.id);
    }
  }, [piece, catalogue.settings?.siteName]);
  if (!piece) return <Missing loading={!catalogueSettled()} />;
  const shop = shopFor(piece);
  const area = areaFor(shop);
  const cat = CATEGORIES.find((c) => c.id === piece.category)!;
  const tab = sectionOf(piece) === "coins_bars" ? "coins_bars" : "jewellery";
  const subject = `${piece.name} (ref ${piece.code})`;
  const fromShop = pieces.filter((p) => p.shop === shop.slug && p.slug !== piece.slug).slice(0, 3);
  const similar = pieces.filter((p) => p.category === piece.category && p.slug !== piece.slug && p.shop !== shop.slug).slice(0, 3);
  const shopCount = pieces.filter((p) => p.shop === shop.slug).length;

  const facts = [
    piece.purity && { icon: PurityIcon, k: "Purity", v: piece.fineness ? `${piece.purity} (${piece.fineness})` : piece.purity },
    piece.weightGrams && { icon: ScaleIcon, k: "Weight", v: weightText(piece.weightGrams) },
    piece.makingCharge && { icon: HammerIcon, k: "Making charge", v: makingChargeText(piece.makingCharge) },
  ].filter(Boolean) as { icon: typeof PurityIcon; k: string; v: string }[];

  const details: [string, string][] = [
    ["Category", cat.singular],
    ...(piece.stones ? [["Stones", piece.stones] as [string, string]] : []),
    ...(piece.occasions.length ? [["Occasion", piece.occasions.map((o) => label(OCCASIONS, o)).join(", ")] as [string, string]] : []),
    ["For", label(WEARERS, piece.wearer)!],
    ...(piece.style ? [["Style", label(STYLES, piece.style)!] as [string, string]] : []),
    ["Listed", dateText(piece.listedAt)],
    ["Stock confirmed", dateText(piece.stockConfirmedAt)],
    ["Reference", piece.code],
  ];
  const directions = `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`;

  return (
    <div className="pb-28 lg:pb-0">
      <nav aria-label="Breadcrumb" className="page page-x py-4 text-[13px] text-stone">
        <ol className="flex flex-wrap gap-1.5">
          <li><Link href="/" className="hover:text-ink">Home</Link></li><li aria-hidden>›</li>
          <li><Link href={searchHref({ tab })} className="hover:text-ink">{TABS.find((t) => t.id === tab)!.label}</Link></li><li aria-hidden>›</li>
          <li><Link href={searchHref({ tab, category: cat.id })} className="hover:text-ink">{cat.label}</Link></li><li aria-hidden>›</li>
          <li><Link href={searchHref({ tab, category: cat.id, location: area.slug })} className="hover:text-ink">{area.name}</Link></li>
        </ol>
      </nav>

      <div className="page page-x grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Main column */}
        <div className="min-w-0 lg:col-span-8">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8 lg:grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <PieceGallery images={piece.images} name={piece.name} />
            <div>
              <div className="flex items-start justify-between gap-3">
                <PriceLine piece={piece} className="[&>span:first-child]:text-[28px] [&>span:first-child]:md:text-[32px]" />
                <div className="-mr-2 -mt-1"><SaveButton slug={piece.slug} name={piece.name} /></div>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-stone">{priceNote(piece)}</p>
              <h1 className="mt-4 font-serif text-[32px] leading-[1.05] tracking-[-0.01em] md:text-[40px]">{piece.name}</h1>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-ink-soft"><PinIcon className="size-4 text-stone" />{area.name}, {area.emirate}</p>

              <ul className="mt-5 grid grid-cols-3 border-y border-line">
                {facts.map(({ icon: Icon, k, v }) => (
                  <li key={k} className="border-l border-line px-3 py-3 first:border-l-0 first:pl-0">
                    <p className="inline-flex items-center gap-1.5 text-[12px] text-stone"><Icon className="size-4" />{k}</p>
                    <p className="mt-1 text-[14px] text-ink">{v}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{piece.description}</p>
              {/* Phone and tablet: the jeweller comes straight after the piece. */}
              <div className="mt-6 lg:hidden"><SellerCard piece={piece} shopCount={shopCount} /></div>
            </div>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <section aria-labelledby="details">
              <h2 id="details" className="text-[15px] font-medium">Details</h2>
              <dl className="mt-3 divide-y divide-line border-y border-line text-[14px]">
                {details.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-4 py-2.5"><dt className="text-stone">{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </section>
            <PriceBreakdown piece={piece} />
          </div>

          <section aria-labelledby="where" className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="where" className="text-[15px] font-medium">Where to see it</h2>
              <a href={directions} target="_blank" rel="noopener" onClick={() => !piece.demo && track("directions_click", shop.id, piece.id)} className="inline-flex items-center gap-1.5 text-[13px] text-ink underline decoration-line-strong underline-offset-4">
                Get directions <ArrowIcon className="size-3.5" />
              </a>
            </div>
            <p className="mt-1 text-[14px] text-ink-soft">{shop.address}</p>
            <p className="text-[13px] text-stone">{area.note}</p>
            <ShopMap shop={shop} className="mt-4 h-64 md:h-80" />
            <p className="mt-1.5 text-[12px] text-stone">Demonstration jeweller, pinned at an approximate spot in a real gold district.</p>
          </section>
        </div>

        {/* Jeweller panel: sticky beside the content, like the agent card on a listing. */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <SellerCard piece={piece} shopCount={shopCount} withActions />
          </div>
        </aside>
      </div>

      {[{ title: `More from ${shop.name}`, list: fromShop, href: shopHref(shop.slug) }, { title: `Similar ${cat.label.toLowerCase()} from other jewellers`, list: similar, href: searchHref({ tab, category: cat.id }) }]
        .filter((s) => s.list.length)
        .map((s) => (
          <section key={s.title} className="page page-x mt-16">
            <div className="mb-5 flex items-baseline justify-between gap-4 border-t border-line pt-6">
              <h2 className="font-serif text-[24px] leading-none md:text-[30px]">{s.title}</h2>
              <Link href={s.href} className="shrink-0 text-[13px] text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink">See all</Link>
            </div>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {s.list.map((p) => <li key={p.slug}><ResultCard piece={p} layout="grid" /></li>)}
            </ul>
          </section>
        ))}

      {/* Phone: the two actions stay within reach. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-chalk px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <div className="mb-2 flex items-baseline justify-between text-[13px]">
          <span className="truncate text-ink">{piece.price.kind === "on_request" ? "Price on request" : aed(piece.price.aed)}</span>
          <span className="shrink-0 text-stone">{shop.name}</span>
        </div>
        <ContactActions shop={shop} subject={subject} pieceId={piece.id} layout="bar" />
      </div>
    </div>
  );
}

function Missing({ loading }: { loading: boolean }) {
  return (
    <section className="page page-x py-24 text-center">
      {loading ? (
        <p className="text-[14px] text-stone">Loading…</p>
      ) : (
        <>
          <p className="font-serif text-[32px] leading-tight">This piece isn&apos;t listed any more.</p>
          <p className="mt-3 text-[14px] text-stone">It may have been sold, or the shop has taken it down.</p>
          <Link href="/search" className="mt-6 inline-flex h-11 items-center border border-ink px-5 text-[14px]">Browse what&apos;s listed</Link>
        </>
      )}
    </section>
  );
}
