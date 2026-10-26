import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactActions } from "@/components/ContactActions";
import { Gallery } from "@/components/Gallery";
import { ArrowIcon } from "@/components/Icons";
import { PieceGrid } from "@/components/PieceCard";
import { SaveButton } from "@/components/SaveButton";
import { CATEGORIES, pieceBySlug, pieces, shopFor, type Piece } from "@/data/catalogue";
import { aed, dateText, makingChargeText, weightText } from "@/lib/format";

export const dynamicParams = false;
export function generateStaticParams() {
  return pieces.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const piece = pieceBySlug.get((await params).slug);
  if (!piece) return {};
  const shop = shopFor(piece);
  return { title: piece.name, description: `${piece.name} from ${shop.name}, ${shop.area}. ${piece.description}` };
}

function PriceBlock({ piece }: { piece: Piece }) {
  const { price } = piece;
  if (price.kind === "on_request") {
    return (
      <div>
        <p className="text-[22px] font-medium">Price on request</p>
        <p className="mt-1 text-[13px] text-stone">The jeweller gives the price in person or by message.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-[24px] font-semibold tracking-[-0.01em]">{aed(price.aed)}</p>
      <p className="mt-1 max-w-[42ch] text-[13px] leading-snug text-stone">
        {price.kind === "listed"
          ? "Price set by the jeweller. Confirm it before you visit."
          : `Indicative: based on the jeweller's gold rate on ${dateText(price.asOf)}. It moves with the gold price, so confirm before you visit.`}
      </p>
    </div>
  );
}

export default async function PiecePage({ params }: { params: Promise<{ slug: string }> }) {
  const piece = pieceBySlug.get((await params).slug);
  if (!piece) notFound();
  const shop = shopFor(piece);
  const category = CATEGORIES.find((c) => c.id === piece.category)!;
  const subject = `${piece.name} (ref ${piece.code})`;
  const fromShop = pieces.filter((p) => p.shop === shop.slug && p.slug !== piece.slug).slice(0, 4);
  const similar = pieces.filter((p) => p.category === piece.category && p.shop !== shop.slug).slice(0, 4);

  const details: [string, string][] = [];
  if (piece.purity) details.push(["Purity", `${piece.purity} gold`]);
  if (piece.weightGrams) details.push(["Weight", weightText(piece.weightGrams)]);
  if (piece.makingCharge) details.push(["Making charge", makingChargeText(piece.makingCharge)]);
  if (piece.stones) details.push(["Stones", piece.stones]);
  details.push(["Reference", piece.code]);

  return (
    <div className="pb-24 md:pb-0">
      <nav aria-label="Breadcrumb" className="page page-x py-4 text-[13px] text-stone md:py-5">
        <ol className="flex gap-2">
          <li><Link href="/" className="hover:text-ink">All jewellery</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/?category=${category.id}#pieces`} className="hover:text-ink">{category.label}</Link></li>
        </ol>
      </nav>

      <div className="page page-x grid gap-7 md:grid-cols-12 md:gap-10 xl:gap-16">
        <div className="md:col-span-7">
          <Gallery images={piece.images} name={piece.name} />
          <p className="mt-2 hidden text-[12px] text-stone md:block">Demonstration render, not a photograph of stock.</p>
        </div>

        <div className="md:col-span-5">
          <div className="md:sticky md:top-24">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-serif text-[34px] leading-[1.05] tracking-[-0.01em] md:text-[44px]">{piece.name}</h1>
              <div className="-mr-2 shrink-0"><SaveButton slug={piece.slug} name={piece.name} /></div>
            </div>

            <div className="mt-4"><PriceBlock piece={piece} /></div>

            <div className="mt-6 border-y border-line py-4">
              <p className="text-[12px] text-stone">Sold by</p>
              <Link href={`/jewellers/${shop.slug}`} className="mt-0.5 inline-flex items-center gap-2 text-[16px] text-ink hover:underline">
                {shop.name} <ArrowIcon className="size-3.5" />
              </Link>
              <p className="text-[14px] text-ink-soft">{shop.area}, {shop.emirate}</p>
              {shop.hours && <p className="mt-1 text-[13px] text-stone">{shop.hours}</p>}
            </div>

            <div className="mt-6 hidden md:block">
              <ContactActions shop={shop} subject={subject} />
              <p className="mt-3 text-[12px] leading-snug text-stone">
                You deal with the shop directly. There is no checkout here: you see the piece and pay in the shop.
              </p>
            </div>

            <dl className="mt-7 divide-y divide-line border-b border-line text-[14px]">
              {details.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-4 py-2.5">
                  <dt className="text-stone">{k}</dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">{piece.description}</p>

            <p className="mt-6 border-l-2 border-brass pl-3 text-[12px] leading-snug text-stone">
              Demonstration listing. {shop.name}, this price and its contact details are invented for the prototype.
            </p>
          </div>
        </div>
      </div>

      {fromShop.length > 0 && (
        <section className="page page-x mt-20 md:mt-28">
          <div className="mb-7 flex items-baseline justify-between gap-4 border-t border-line pt-6">
            <h2 className="font-serif text-[26px] leading-none md:text-[32px]">More from {shop.name}</h2>
            <Link href={`/jewellers/${shop.slug}`} className="shrink-0 text-[13px] text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink">
              See the shop
            </Link>
          </div>
          <PieceGrid pieces={fromShop} />
        </section>
      )}
      {similar.length > 0 && (
        <section className="page page-x mt-16 md:mt-20">
          <h2 className="mb-7 border-t border-line pt-6 font-serif text-[26px] leading-none md:text-[32px]">
            Other {category.label.toLowerCase()}
          </h2>
          <PieceGrid pieces={similar} />
        </section>
      )}

      {/* Phone: the two actions stay within reach. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-chalk px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
        <ContactActions shop={shop} subject={subject} layout="bar" />
      </div>
    </div>
  );
}
