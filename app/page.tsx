import Link from "next/link";
import { Suspense } from "react";
import { Catalogue } from "@/components/Catalogue";
import { ArrowIcon } from "@/components/Icons";
import { PieceGrid } from "@/components/PieceCard";
import { PieceImage } from "@/components/PieceImage";
import { heroImage, pieceBySlug, pieces, shops } from "@/data/catalogue";
import { runQuery, EMPTY_QUERY } from "@/lib/catalogue-query";

export default function Home() {
  const emirates = [...new Set(shops.map((s) => s.emirate))];
  return (
    <>
      <Opening emirates={emirates} />
      {/* The catalogue reads its filters from the URL; the fallback is the
          same grid unfiltered, so the page is complete before JavaScript. */}
      <Suspense fallback={<CatalogueFallback />}>
        <Catalogue />
      </Suspense>
      <Jewellers />
      <Invitation />
    </>
  );
}

function Opening({ emirates }: { emirates: string[] }) {
  return (
    <section className="page page-x pb-6 pt-5 md:pb-14 md:pt-12">
      <div className="grid gap-5 md:grid-cols-12 md:items-end md:gap-10">
        <div className="md:col-span-5 md:pb-2 xl:col-span-4">
          <h1 className="font-serif text-[40px] leading-[1.02] tracking-[-0.015em] md:text-[52px] xl:text-display">
            Find a piece
            <br />
            that feels <em className="italic">yours.</em>
          </h1>
          <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-ink-soft md:mt-6 md:max-w-[30ch] md:text-[17px]">
            Discover jewellery from independent and established jewellers across the UAE.
          </p>
          <div className="mt-6 hidden items-center gap-6 md:mt-9 md:flex">
            <ExploreLink />
          </div>
          <p className="mt-10 hidden border-t border-line pt-4 text-[13px] text-stone md:block">
            {pieces.length} pieces from {shops.length} jewellers in {emirates.slice(0, -1).join(", ")} and {emirates.at(-1)}
          </p>
        </div>
        <figure className="-mx-4 md:col-span-7 md:mx-0 xl:col-span-8">
          <div className="aspect-[4/3] overflow-hidden bg-limestone md:aspect-[16/10]">
            <PieceImage
              name={heroImage.src}
              alt={heroImage.alt}
              width={1600}
              height={1120}
              sizes="(min-width: 1280px) 62vw, (min-width: 768px) 58vw, 100vw"
              priority
              className="size-full object-cover object-[62%_72%]"
            />
          </div>
          <figcaption className="mt-2 flex justify-end gap-4 px-4 text-[12px] text-stone md:mt-2.5 md:justify-between md:px-0">
            <span className="hidden md:inline">{heroImage.caption}</span>
            <span className="shrink-0">Demonstration render</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function ExploreLink() {
  return (
    <a href="#pieces" className="group inline-flex items-center gap-2 border-b border-ink pb-1 text-[15px] text-ink">
      Explore the collection
      <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

function CatalogueFallback() {
  return (
    <section id="pieces" className="page page-x border-t border-line pt-24">
      <PieceGrid pieces={runQuery(EMPTY_QUERY)} eager={4} />
    </section>
  );
}

function Jewellers() {
  return (
    <section aria-labelledby="jewellers-title" className="page page-x mt-24 md:mt-32">
      <div className="grid gap-8 border-t border-line pt-8 md:grid-cols-12 md:gap-10 md:pt-10">
        <div className="md:col-span-4">
          <h2 id="jewellers-title" className="font-serif text-[30px] leading-[1.05] tracking-[-0.01em] md:text-[36px]">
            Discover the jewellers behind the pieces.
          </h2>
          <p className="mt-4 max-w-[34ch] text-[14px] text-stone">
            Every piece belongs to a shop you can visit. These are the jewellers in this demonstration catalogue.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:col-span-8 md:grid-cols-4 md:gap-x-6">
          {shops.map((s) => {
            const theirs = pieces.filter((p) => p.shop === s.slug);
            return (
              <li key={s.slug}>
                <Link href={`/jewellers/${s.slug}`} className="group block">
                  <div className="aspect-square overflow-hidden bg-limestone">
                    <PieceImage
                      name={(pieceBySlug.get(s.cover) ?? theirs[0]).images[0]}
                      alt=""
                      sizes="(min-width: 768px) 15vw, 45vw"
                      className="size-full object-cover transition-transform duration-700 ease-quiet group-hover:scale-[1.035]"
                    />
                  </div>
                  <p className="mt-3 text-[14px] text-ink">{s.name}</p>
                  <p className="text-[13px] text-stone">{s.area}, {s.emirate} · {theirs.length} pieces</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Invitation() {
  return (
    <section className="page page-x mt-24 md:mt-32">
      <div className="grid gap-5 border-t border-line pt-8 md:grid-cols-12 md:items-baseline md:gap-10 md:pt-10">
        <h2 className="font-serif text-[30px] leading-[1.05] md:col-span-6 md:text-[36px]">Do you have a jewellery collection?</h2>
        <div className="md:col-span-6 md:flex md:items-baseline md:justify-between md:gap-8">
          <p className="text-[15px] text-ink-soft">Bring your designs to customers across the UAE.</p>
          <Link href="/for-jewellers" className="mt-4 inline-flex shrink-0 items-center gap-2 border-b border-ink pb-1 text-[15px] md:mt-0">
            Register your interest <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
