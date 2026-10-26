"use client";
import { useRef, useState } from "react";
import { PieceImage } from "./PieceImage";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const alt = (i: number) => (images.length > 1 ? `${name}, view ${i + 1} of ${images.length}` : name);

  return (
    <div>
      {/* Phone: swipe between views. */}
      <div className="md:hidden">
        <div
          ref={strip}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((img, i) => (
            <div key={img} className="aspect-square w-full shrink-0 snap-center bg-limestone">
              <PieceImage name={img} alt={alt(i)} sizes="100vw" priority={i === 0} className="size-full object-cover" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <p className="mt-2 text-center text-[12px] text-stone" aria-live="polite">
            {index + 1} / {images.length}
          </p>
        )}
      </div>

      {/* Desktop: one large view with thumbnails. */}
      <div className="hidden md:block">
        <div className="aspect-[4/5] overflow-hidden bg-limestone">
          <PieceImage name={images[index]} alt={alt(index)} sizes="(min-width: 1280px) 52vw, 56vw" priority className="size-full object-cover" />
        </div>
        {images.length > 1 && (
          <ul className="mt-3 flex gap-3">
            {images.map((img, i) => (
              <li key={img}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show view ${i + 1}`}
                  aria-current={i === index}
                  className={`block w-20 border-b-2 pb-1 transition-opacity ${i === index ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <PieceImage name={img} alt="" sizes="80px" className="aspect-[4/5] w-full bg-limestone object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
