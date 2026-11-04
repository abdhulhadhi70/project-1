"use client";
// A card's photos: swipe on a phone, arrows on hover with a mouse, and a
// photo count like Property Finder's.
import { useRef, useState } from "react";
import { PieceImage } from "../PieceImage";
import { CameraIcon, ChevronLeftIcon, ChevronRightIcon } from "../Icons";

export function CardGallery({ images, alt, sizes, aspect = "aspect-[4/3]", priority }: {
  images: string[]; alt: string; sizes: string; aspect?: string; priority?: boolean;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const go = (to: number) => {
    const el = strip.current;
    if (!el) return;
    el.scrollTo({ left: to * el.clientWidth, behavior: "smooth" });
  };
  return (
    <div className={`group/g relative overflow-hidden bg-limestone ${aspect}`}>
      <div
        ref={strip}
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="no-scrollbar flex size-full snap-x snap-mandatory overflow-x-auto"
      >
        {images.map((img, k) => (
          <div key={img} className="size-full shrink-0 snap-center">
            <PieceImage name={img} alt={k === 0 ? alt : `${alt}, view ${k + 1}`} sizes={sizes} priority={priority && k === 0}
              className="size-full object-cover transition-transform duration-700 ease-quiet md:group-hover/g:scale-[1.03]" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button type="button" onClick={(e) => { e.preventDefault(); go(Math.max(0, i - 1)); }} disabled={i === 0} aria-label="Previous photo"
            className="absolute left-2 top-1/2 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-chalk/90 text-ink opacity-0 transition-opacity disabled:invisible group-hover/g:opacity-100 md:grid">
            <ChevronLeftIcon />
          </button>
          <button type="button" onClick={(e) => { e.preventDefault(); go(Math.min(images.length - 1, i + 1)); }} disabled={i === images.length - 1} aria-label="Next photo"
            className="absolute right-2 top-1/2 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-chalk/90 text-ink opacity-0 transition-opacity disabled:invisible group-hover/g:opacity-100 md:grid">
            <ChevronRightIcon />
          </button>
        </>
      )}
      <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 bg-ink/70 px-1.5 py-0.5 text-[11px] text-chalk">
        <CameraIcon /> {images.length > 1 ? `${i + 1}/${images.length}` : "1"}
      </span>
    </div>
  );
}
