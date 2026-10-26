import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactActions } from "@/components/ContactActions";
import { PieceGrid } from "@/components/PieceCard";
import { pieces, shopBySlug, shops } from "@/data/catalogue";
import { sortPieces } from "@/lib/catalogue-query";

export const dynamicParams = false;
export function generateStaticParams() {
  return shops.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const shop = shopBySlug.get((await params).slug);
  return shop ? { title: shop.name, description: `${shop.name}, ${shop.area}, ${shop.emirate}. ${shop.about}` } : {};
}

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const shop = shopBySlug.get((await params).slug);
  if (!shop) notFound();
  const theirs = sortPieces(pieces.filter((p) => p.shop === shop.slug), "newest");
  return (
    <>
      <section className="page page-x pt-6 md:pt-12">
        <nav aria-label="Breadcrumb" className="text-[13px] text-stone">
          <Link href="/" className="hover:text-ink">All jewellery</Link> <span aria-hidden>/</span> Jewellers
        </nav>
        <div className="mt-6 grid gap-8 border-b border-line pb-10 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-6">
            <p className="text-[13px] text-stone">{shop.area}, {shop.emirate}</p>
            <h1 className="mt-1 font-serif text-[40px] leading-none tracking-[-0.015em] md:text-[56px]">{shop.name}</h1>
            <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-ink-soft">{shop.about}</p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <dl className="divide-y divide-line border-y border-line text-[14px]">
              <div className="grid grid-cols-[7rem_1fr] gap-4 py-2.5"><dt className="text-stone">Area</dt><dd>{shop.area}, {shop.emirate}</dd></div>
              {shop.hours && <div className="grid grid-cols-[7rem_1fr] gap-4 py-2.5"><dt className="text-stone">Hours</dt><dd>{shop.hours}</dd></div>}
              <div className="grid grid-cols-[7rem_1fr] gap-4 py-2.5"><dt className="text-stone">Listed</dt><dd>{theirs.length} pieces</dd></div>
            </dl>
            <div className="mt-5"><ContactActions shop={shop} /></div>
            {shop.demo && (
              <p className="mt-4 border-l-2 border-brass pl-3 text-[12px] text-stone">
                Demonstration jeweller. This shop, its hours and its pieces are invented for the prototype.
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="page page-x mt-10">
        <h2 className="mb-7 font-serif text-[28px] leading-none md:text-[34px]">Pieces from {shop.name}</h2>
        <PieceGrid pieces={theirs} eager={4} />
      </section>
    </>
  );
}
