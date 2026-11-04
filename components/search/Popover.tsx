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
        className={`inline-flex h-11 items-center gap-1.5 border px-3 text-[14px] transition-colors ${
          active ? "border-ink text-ink" : open ? "border-ink text-ink" : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
        }`}
      >
        {label}
        <ChevronIcon className={`size-3.5 text-stone transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div id={id} className={`absolute top-full z-30 mt-1 max-h-[70vh] overflow-y-auto border border-line bg-chalk p-4 shadow-[0_16px_32px_-20px_rgb(37_36_31/0.35)] ${width} ${align === "right" ? "right-0" : "left-0"}`}>
          {children}
        </div>
      )}
    </div>
  );
}
