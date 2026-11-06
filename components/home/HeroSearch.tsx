"use client";
// The homepage search card: tabs, the place/keyword box with suggestions,
// three quick filters and a Search button, like Property Finder's hero.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EMPTY_QUERY, PRICE_BANDS, liveTabs, optionsFor, searchHref, type Query } from "@/lib/catalogue-query";
import { ChevronIcon, SearchIcon } from "../Icons";
import { LocationBox } from "../search/LocationBox";

function Select<T extends string>({ label, value, onChange, options }: {
  label: string; value: T | ""; onChange: (v: T | "") => void; options: { id: T; label: string }[];
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T | "")}
        className="h-14 w-full appearance-none rounded-xl border border-line-strong bg-card pl-3 pr-7 text-[16px] text-ink outline-none focus:border-ink md:pl-3 md:pr-8 md:text-[15px]">
        <option value="">{label}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stone" />
    </label>
  );
}

export function HeroSearch() {
  const router = useRouter();
  const [draft, setDraft] = useState<Query>(EMPTY_QUERY);
  const set = (patch: Partial<Query>) => setDraft((d) => ({ ...d, ...patch }));
  const opts = optionsFor(draft.tab);
  const go = (q: Query = draft) => router.push(searchHref(q));

  return (
    <div>
      <div role="tablist" aria-label="What are you looking for" className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {liveTabs().map((t) => {
          const on = draft.tab === t.id;
          return (
            <button key={t.id} role="tab" type="button" aria-selected={on}
              onClick={() => setDraft({ ...EMPTY_QUERY, tab: t.id, q: draft.q, location: draft.location, shop: draft.shop })}
              className={`h-10 shrink-0 rounded-full px-4 text-[14px] transition-colors ${on ? "bg-cocoa text-cream" : "text-ink-soft hover:bg-limestone hover:text-ink"}`}>
              {t.label}
            </button>
          );
        })}
      </div>
      <div className={`mt-4 grid gap-2 ${opts.purities.length > 1 ? "md:grid-cols-[minmax(0,2.2fr)_repeat(3,minmax(0,1fr))_auto]" : "md:grid-cols-[minmax(0,2.4fr)_repeat(2,minmax(0,1fr))_auto]"}`}>
        <LocationBox query={draft} set={set} size="lg" placeholder="Area, souk, jeweller or piece" />
        <div className={`grid gap-2 md:contents ${opts.purities.length > 1 ? "grid-cols-3" : "grid-cols-2"}`}>
          <Select label="Category" value={draft.category ?? ""} onChange={(v) => set({ category: v || null })} options={opts.categories} />
          {opts.purities.length > 1 && (
            <Select label="Purity" value={draft.purity[0] ?? ""} onChange={(v) => set({ purity: v ? [v] : [] })} options={opts.purities.map((p) => ({ id: p, label: p }))} />
          )}
          <Select label="Price" value={draft.price ?? ""} onChange={(v) => set({ price: v || null })} options={[...PRICE_BANDS]} />
        </div>
        <button type="button" onClick={() => go()} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-terracotta px-7 text-[15px] font-medium text-white transition-colors hover:bg-terracotta-deep">
          <SearchIcon className="size-[18px]" /> Search
        </button>
      </div>
    </div>
  );
}
