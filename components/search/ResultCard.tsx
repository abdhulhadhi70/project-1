"use client";
// A search result, laid out like a Property Finder listing: photos, price,
// a row of key facts, title, location, the jeweller, and contact buttons.
import Link from "next/link";
import type { Piece } from "@/data/catalogue";
import { areaFor, shopFor } from "@/lib/catalogue-store";
import { pieceHref, shopHref } from "@/lib/links";
import { aed, dateShort, makingShort, weightText } from "@/lib/format";
import { ContactActions } from "../ContactActions";
import { HammerIcon, PinIcon, PurityIcon, ScaleIcon } from "../Icons";
import { SaveButton } from "../SaveButton";
import { CardGallery } from "./CardGallery";

export function Monogram({ name, className = "size-8 text-[11px]" }: { name: string; className?: string }) {
  const letters = name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");
  return <span aria-hidden className={`grid shrink-0 place-items-center rounded-full bg-limestone font-medium tracking-wide text-ink-soft ${className}`}>{letters}</span>;
}

export function PriceLine({ piece, className = "" }: { piece: Piece; className?: string }) {
  const p = piece.price;
  if (p.kind === "on_request") return <p className={`text-[18px] font-semibold text-ink ${className}`}>Price on request</p>;
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span className="whitespace-nowrap text-[19px] font-semibold tracking-[-0.01em] text-ink md:text-[20px]">{aed(p.aed)}</span>
      {p.kind === "indicative" && <span className="rounded-full border border-line-strong px-2 text-[11px] leading-[18px] text-stone">Indicative</span>}
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

export function ResultCard({ piece, layout = "list", priority = false }: { piece: Piece; layout?: "list" | "grid"; priority?: boolean }) {
  const shop = shopFor(piece);
  const area = areaFor(shop);
  const href = pieceHref(piece.slug);
  const list = layout === "list";

  return (
    <article className={`relative rounded-2xl border border-line bg-card p-2 transition-shadow hover:shadow-[0_18px_36px_-24px_rgb(30_20_16/0.45)] ${list ? "md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}>
      {/* Above the title link's full-card overlay, so the arrows and heart work. */}
      <div className="relative z-10 overflow-hidden rounded-xl">
        <Link href={href} tabIndex={-1} aria-hidden className="block">
          <CardGallery images={piece.images} alt={piece.name} priority={priority}
            aspect={list ? "aspect-[4/3] md:aspect-auto md:h-full md:min-h-[17rem]" : "aspect-[4/5]"}
            sizes={list ? "(min-width: 768px) 32vw, 100vw" : "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"} />
        </Link>
        <div className="absolute right-1 top-1"><SaveButton slug={piece.slug} name={piece.name} /></div>
      </div>

      <div className={`flex flex-col ${list ? "gap-2 p-3 md:p-4" : "gap-1.5 px-2 pb-1.5 pt-3"}`}>
        {/* The jeweller first: this is a shop's design, found here, seen in their shop. */}
        <Link href={shopHref(shop.slug)} className={`relative z-10 inline-flex min-w-0 items-center gap-2.5 self-start hover:underline ${list ? "" : "gap-2"}`}>
          <Monogram name={shop.name} className={list ? "size-10 text-[12px]" : "size-8 text-[11px]"} />
          <span className="min-w-0">
            <span className={`block truncate font-medium text-ink ${list ? "text-[15px]" : "text-[13px]"}`}>{shop.name}</span>
            <span className="flex items-center gap-1 truncate text-[12px] text-stone"><PinIcon className="size-3.5 shrink-0" />{area.name}{list ? `, ${area.emirate}` : ""}</span>
          </span>
        </Link>
        <h3 className={`${list ? "mt-1 font-serif text-[20px] md:text-[22px]" : "mt-0.5 font-serif text-[17px]"} leading-tight text-ink`}>
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] hover:underline">{piece.name}</Link>
        </h3>
        <Facts piece={piece} />
        <PriceLine piece={piece} className={list ? "" : "[&>span:first-child]:text-[16px]"} />
        {list && <p className="line-clamp-2 text-[13px] leading-snug text-ink-soft max-md:hidden">{piece.description}</p>}

        {list ? (
          <div className="relative z-10 mt-auto space-y-2 border-t border-line pt-3">
            <ContactActions shop={shop} subject={`${piece.name} (ref ${piece.code})`} path={href} pieceId={piece.id} layout="card" />
            <p className="text-[11px] text-stone">Stock confirmed by the shop {dateShort(piece.stockConfirmedAt)}</p>
          </div>
        ) : (
          <p className="mt-auto pt-1 text-[11px] text-stone">Stock confirmed {dateShort(piece.stockConfirmedAt)}</p>
        )}
      </div>
    </article>
  );
}
