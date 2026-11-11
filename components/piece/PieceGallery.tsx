"use client";
// Product photos: swipe on a phone, a large view with thumbnails on a wider
// screen, and a full-screen viewer on tap, like a listing's photo gallery.
import { useEffect, useRef, useState } from "react";
import { PieceImage } from "../PieceImage";
import { CameraIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, ExpandIcon } from "../Icons";

export function PieceGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const alt = (i: number) => (images.length > 1 ? `${name}, view ${i + 1} of ${images.length}` : name);
  const step = (d: number) => setIndex((i) => (i + d + images.length) % images.length);

  useEffect(() => {
    if (!viewer) return;
    dialog.current?.showModal();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer]);

  return (
    <div>
      {/* Phone: swipe between views; tap opens the viewer. */}
      <div className="relative md:hidden">
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
          {images.map((img, i) => (
            <button key={img} type="button" onClick={() => setViewer(true)} className="aspect-square w-full shrink-0 snap-center bg-limestone" aria-label="Open photo viewer">
              <PieceImage name={img} alt={alt(i)} sizes="100vw" priority={i === 0} className="size-full object-cover" />
            </button>
          ))}
        </div>
        <span className="pointer-events-none absolute bottom-9 left-0 inline-flex items-center gap-1 rounded-full bg-cocoa/70 px-2.5 py-0.5 text-[12px] text-cream">
          <CameraIcon /> {index + 1}/{images.length}
        </span>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <button type="button" onClick={() => setViewer(true)} className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-limestone" aria-label="Open photo viewer">
          <PieceImage name={images[index]} alt={alt(index)} sizes="(min-width: 1280px) 48vw, 56vw" priority className="size-full object-cover" />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-[13px] text-ink opacity-90 group-hover:opacity-100">
            <ExpandIcon /> View {images.length > 1 ? `all ${images.length} photos` : "full size"}
          </span>
        </button>
        {images.length > 1 && (
          <ul className="mt-3 flex gap-3">
            {images.map((img, i) => (
              <li key={img}>
                <button type="button" onClick={() => setIndex(i)} aria-label={`Show view ${i + 1}`} aria-current={i === index}
                  className={`block w-20 overflow-hidden rounded-xl border-2 transition-opacity ${i === index ? "border-brass" : "border-transparent opacity-70 hover:opacity-100"}`}>
                  <PieceImage name={img} alt="" sizes="80px" className="aspect-[4/5] w-full bg-limestone object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewer && (
        <dialog ref={dialog} onClose={() => setViewer(false)} aria-label={`${name} photos`}
          className="m-0 h-dvh max-h-none w-full max-w-none bg-cocoa p-0 text-cream backdrop:bg-cocoa">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-[13px] text-chalk/80">{name} · {index + 1} / {images.length}</p>
              <button type="button" onClick={() => dialog.current?.close()} className="grid size-11 place-items-center" aria-label="Close viewer"><CloseIcon /></button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6">
              <PieceImage name={images[index]} alt={alt(index)} sizes="100vw" className="max-h-full w-auto max-w-full object-contain" />
              {images.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-3 grid size-11 place-items-center rounded-full bg-chalk/15 hover:bg-chalk/25"><ChevronLeftIcon className="size-5" /></button>
                  <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-3 grid size-11 place-items-center rounded-full bg-chalk/15 hover:bg-chalk/25"><ChevronRightIcon className="size-5" /></button>
                </>
              )}
            </div>
            <p className="pb-4 text-center text-[12px] text-chalk/60">Demonstration image, not a photograph of real stock.</p>
          </div>
        </dialog>
      )}
    </div>
  );
}
