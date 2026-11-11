"use client";
// A piece in a list or grid: photograph, name, whose it is and where, the
// price and the facts people compare. Used on every ivory page.
import Link from "next/link";
import type { Piece } from "@/data/catalogue";
import { areaFor, shopFor } from "@/lib/catalogue-store";
import { pieceHref, shopHref } from "@/lib/links";
import { aed, makingShort, weightText } from "@/lib/format";
import { ArrowIcon, HammerIcon, PinIcon, PurityIcon, ScaleIcon } from "../Icons";
import { SaveButton } from "../SaveButton";
import { CardGallery } from "./CardGallery";

export function Monogram({ name, className = "size-8 text-[12px]" }: { name: string; className?: string }) {
  const letters = name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");
  return <span aria-hidden className={`grid shrink-0 place-items-center rounded-full bg-limestone font-medium tracking-wide text-ink-soft ${className}`}>{letters}</span>;
}

export function PriceLine({ piece, className = "" }: { piece: Piece; className?: string }) {
  const p = piece.price;
  if (p.kind === "on_request") return <p className={`text-[18px] font-semibold text-ink ${className}`}>Price on request</p>;
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span className="whitespace-nowrap text-[19px] font-semibold tracking-[-0.01em] text-ink md:text-[20px]">{aed(p.aed)}</span>
      {p.kind === "indicative" && <span className="rounded-full border border-line-strong px-2 text-[12px] leading-[18px] text-stone">Indicative</span>}
    </p>
  );
}

export function Facts({ piece }: { piece: Piece }) {
  const items = [
    piece.purity && { icon: PurityIcon, text: piece.fineness ? `${piece.purity} · ${piece.fineness}` : piece.purity, label: "Purity" },
    piece.weightGrams && { icon: ScaleIcon, text: weightText(piece.weightGrams), label: "Weight" },
    piece.makingCharge && { icon: HammerIcon, text: makingShort(piece.makingCharge), label: "Making charge" },
  ].filter(Boolean) as { icon: typeof PurityIcon; text: string; label: string }[];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-soft">
      {items.map(({ icon: Icon, text, label }) => (
        <li key={label} className="inline-flex items-center gap-1.5" title={label}>
          <Icon className="size-4 text-stone" />
          <span className="sr-only">{label}: </span>{text}
        </li>
      ))}
    </ul>
  );
}

export function ResultCard({ piece, layout = "list", priority = false, showShop = true }: { piece: Piece; layout?: "list" | "grid"; priority?: boolean; showShop?: boolean }) {
  const shop = shopFor(piece);
  const area = areaFor(shop);
  const href = pieceHref(piece.slug);
  const list = layout === "list";

  const facts = [
    piece.purity && (piece.fineness ? `${piece.purity} · ${piece.fineness}` : piece.purity),
    piece.weightGrams && weightText(piece.weightGrams),
    piece.makingCharge && `making ${makingShort(piece.makingCharge).replace(/ making$/, "")}`,
  ].filter(Boolean).join(" · ");
  const price = piece.price.kind === "on_request" ? "Price on request" : aed(piece.price.aed);

  // One piece: a square photograph, the name, whose it is and where, the
  // price, then the three facts people compare. Contact is on the piece page.
  return (
    <article className={`group relative ${list ? "grid grid-cols-[8.75rem_minmax(0,1fr)] gap-4 border-b border-line py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-5" : ""}`}>
      {/* Above the title link's full-card overlay, so the arrows and heart work. */}
      <div className="relative z-10 overflow-hidden rounded-2xl">
        <Link href={href} tabIndex={-1} aria-hidden className="block">
          <CardGallery images={piece.images} alt={piece.name} priority={priority} aspect="aspect-square"
            sizes={list ? "(min-width: 640px) 176px, 140px" : "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"} />
        </Link>
        <div className="absolute right-0.5 top-0.5"><SaveButton slug={piece.slug} name={piece.name} /></div>
      </div>

      <div className={`flex min-w-0 flex-col ${list ? "justify-center" : "pt-3"}`}>
        <h3 className={`font-serif leading-tight text-ink ${list ? "text-[20px] md:text-[22px]" : "text-[17px]"}`}>
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] group-hover:underline">{piece.name}</Link>
        </h3>
        {showShop && (
          <p className="mt-1 flex flex-wrap gap-x-2 text-[13px] text-stone">
            <span className="whitespace-nowrap">by <Link href={shopHref(shop.slug)} className="relative z-10 text-ink-soft hover:underline">{shop.name}</Link></span>
            <span className="whitespace-nowrap"><PinIcon className="inline size-3.5 align-[-2px]" /> {area.name}</span>
          </p>
        )}
        <p className={`flex flex-wrap items-baseline gap-x-2 font-medium tabular-nums text-ink ${list ? "mt-2 text-[19px]" : "mt-1.5 text-[16px]"}`}>
          {price}
          {piece.price.kind === "indicative" && <span className="text-[12px] font-normal text-stone">indicative</span>}
        </p>
        {facts && <p className="mt-0.5 text-[13px] text-stone">{facts}</p>}
        {list && <p aria-hidden className="label-caps mt-2.5 inline-flex items-center gap-1.5 text-brass-deep">View piece <ArrowIcon className="size-3.5" /></p>}
      </div>
    </article>
  );
}
