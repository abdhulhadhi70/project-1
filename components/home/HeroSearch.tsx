"use client";
// The homepage search card: tabs, the place/keyword box with suggestions,
// three quick filters and a Search button, like Property Finder's hero.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TABS } from "@/data/catalogue";
import { EMPTY_QUERY, PRICE_BANDS, optionsFor, searchHref, type Query } from "@/lib/catalogue-query";
import { ChevronIcon, SearchIcon } from "../Icons";
import { LocationBox } from "../search/LocationBox";

function Select<T extends string>({ label, value, onChange, options }: {
  label: string; value: T | ""; onChange: (v: T | "") => void; options: { id: T; label: string }[];
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T | "")}
        className="h-14 w-full appearance-none border border-line-strong bg-chalk pl-2.5 pr-7 text-[14px] text-ink outline-none focus:border-ink md:pl-3 md:pr-8 md:text-[15px]">
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
      <div role="tablist" aria-label="What are you looking for" className="flex gap-6 border-b border-line">
        {TABS.map((t) => {
          const on = draft.tab === t.id;
          return (
            <button key={t.id} role="tab" type="button" aria-selected={on}
              onClick={() => setDraft({ ...EMPTY_QUERY, tab: t.id, q: draft.q, location: draft.location, shop: draft.shop })}
              className={`-mb-px h-11 border-b-2 text-[15px] transition-colors ${on ? "border-ink text-ink" : "border-transparent text-stone hover:text-ink"}`}>
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-[minmax(0,2.2fr)_repeat(3,minmax(0,1fr))_auto]">
        <LocationBox query={draft} set={set} size="lg" placeholder="Area, souk, jeweller or piece" />
        <div className="grid grid-cols-3 gap-2 md:contents">
          <Select label="Category" value={draft.category ?? ""} onChange={(v) => set({ category: v || null })} options={opts.categories} />
          <Select label="Purity" value={draft.purity[0] ?? ""} onChange={(v) => set({ purity: v ? [v] : [] })} options={opts.purities.map((p) => ({ id: p, label: p }))} />
          <Select label="Price" value={draft.price ?? ""} onChange={(v) => set({ price: v || null })} options={[...PRICE_BANDS]} />
        </div>
        <button type="button" onClick={() => go()} className="inline-flex h-14 items-center justify-center gap-2 bg-ink px-7 text-[15px] font-medium text-chalk hover:bg-ink-soft">
          <SearchIcon className="size-[18px]" /> Search
        </button>
      </div>
    </div>
  );
}
