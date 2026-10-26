"use client";
import { locationLabel, locationOptions } from "@/lib/catalogue-query";
import { useQueryState } from "@/lib/use-query-state";
import { ChevronIcon, PinIcon } from "./Icons";

// A native select: on a phone it opens the system picker, which is easier to
// use than anything we could draw.
export function LocationSelect({ compact = false }: { compact?: boolean }) {
  const { query, set } = useQueryState();
  const label = query.location ? locationLabel(query.location).split(",")[0] : compact ? "UAE" : "All UAE";
  return (
    <label className="relative inline-flex h-10 cursor-pointer items-center gap-1.5 text-[14px] text-ink hover:text-ink-soft">
      <PinIcon className="size-[17px] text-stone" />
      <span className="max-w-[9rem] truncate">{label}</span>
      <ChevronIcon className="size-3.5 text-stone" />
      <span className="sr-only">Location</span>
      <select
        value={query.location ?? ""}
        onChange={(e) => set({ location: e.target.value || null }, { jump: true })}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        <option value="">All UAE</option>
        {locationOptions.map((e) => (
          <optgroup key={e.id} label={e.label}>
            <option value={e.id}>All of {e.label}</option>
            {e.areas.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
