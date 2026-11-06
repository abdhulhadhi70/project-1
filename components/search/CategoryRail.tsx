"use client";
// One tap to the kind of piece you came for: a row of photos under the
// search box. Only categories with pieces appear; Bridal sits at the end.
import { CATEGORIES } from "@/data/catalogue";
import { useCatalogue } from "@/lib/catalogue-store";
import type { Query } from "@/lib/catalogue-query";
import { PieceImage } from "../PieceImage";

export function CategoryRail({ query, set }: { query: Query; set: (p: Partial<Query>) => void }) {
  const { pieces } = useCatalogue();
  const bridalOn = query.occasion === "bridal" || query.tab === "bridal";
  const items = [
    { id: "all", label: "All", image: pieces[0]?.images[0], on: !query.category && !bridalOn, go: () => set({ category: null, occasion: null, tab: "jewellery" }) },
    ...CATEGORIES.filter((c) => c.section === "jewellery").map((c) => {
      const first = pieces.find((p) => p.category === c.id);
      return first && { id: c.id, label: c.label, image: first.images[0], on: query.category === c.id,
        go: () => set({ category: query.category === c.id ? null : c.id }) };
    }),
    (bridalOn || pieces.some((p) => p.occasions.includes("bridal"))) && {
      id: "bridal", label: "Bridal", image: pieces.find((p) => p.occasions.includes("bridal"))?.images[0], on: bridalOn,
      go: () => set(bridalOn ? { occasion: null, tab: query.tab === "bridal" ? "jewellery" : query.tab } : { occasion: "bridal" }),
    },
  ].filter(Boolean) as { id: string; label: string; image?: string; on: boolean; go: () => void }[];

  return (
    <ul aria-label="Categories" className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
      {items.map((it) => (
        <li key={it.id} className="shrink-0">
          <button type="button" onClick={it.go} aria-pressed={it.on} className="group flex w-[4.25rem] flex-col items-center gap-1.5">
            <span className={`block size-16 overflow-hidden rounded-full border-2 bg-card p-0.5 transition-colors ${it.on ? "border-terracotta" : "border-line group-hover:border-brass"}`}>
              {it.image
                ? <PieceImage name={it.image} alt="" sizes="64px" className="size-full rounded-full object-cover" />
                : <span className="block size-full rounded-full bg-limestone" />}
            </span>
            <span className={`text-[12.5px] leading-tight ${it.on ? "font-medium text-ink" : "text-ink-soft"}`}>{it.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
