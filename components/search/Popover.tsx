"use client";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronIcon } from "../Icons";

/** A filter button that opens a small panel below it. */
export function Popover({ label, active, children, align = "left", width = "w-72" }: {
  label: React.ReactNode; active: boolean; children: React.ReactNode; align?: "left" | "right"; width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-11 items-center gap-1.5 rounded-full border bg-card px-4 text-[14px] transition-colors ${
          active ? "border-ink text-ink" : open ? "border-ink text-ink" : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
        }`}
      >
        {label}
        <ChevronIcon className={`size-3.5 text-stone transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div id={id} className={`absolute top-full z-30 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-card p-4 shadow-[0_20px_40px_-24px_rgb(30_20_16/0.4)] ${width} ${align === "right" ? "right-0" : "left-0"}`}>
          {children}
        </div>
      )}
    </div>
  );
}
