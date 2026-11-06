"use client";
import { useRef } from "react";
import { CATEGORIES, type Tab } from "@/data/catalogue";
import { useCatalogue } from "@/lib/catalogue-store";
import { EMPTY_QUERY, PRICE_BANDS, SORTS, activeFilterCount, liveTabs, moreFilterCount, optionsFor, type Query } from "@/lib/catalogue-query";
import { ChevronIcon, SlidersIcon } from "../Icons";
import { Sheet, type SheetHandle } from "../Sheet";
import { LocationBox } from "./LocationBox";
import { CategoryOptions, MoreOptions, PriceOptions, PurityOptions, type SetFn } from "./Options";
import { Popover } from "./Popover";

/** Switching tab keeps where and what you typed, and drops filters that may not apply. */
export function tabPatch(tab: Tab, q: Query): Partial<Query> {
  return { ...EMPTY_QUERY, tab, q: q.q, location: q.location, shop: q.shop, sort: q.sort };
}

// Bridal is a filter now, not a tab; the switch only appears once coins and
// bars are listed alongside jewellery.
export function TabSwitch({ query, set, className = "" }: { query: Query; set: SetFn; className?: string }) {
  const tabs = liveTabs().filter((t) => t.id !== "bridal");
  if (tabs.length < 2) return null;
  return (
    <div role="tablist" aria-label="What are you looking for" className={`flex rounded-full border border-line-strong bg-card p-1 ${className}`}>
      {tabs.map((t) => {
        const on = query.tab === t.id;
        return (
          <button key={t.id} role="tab" type="button" aria-selected={on} onClick={() => !on && set(tabPatch(t.id, query))}
            className={`h-11 flex-1 rounded-full px-4 text-[14px] transition-colors md:flex-none ${on ? "bg-cocoa text-cream" : "text-ink-soft hover:text-ink"}`}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterBar({ query, set, reset, resultCount }: { query: Query; set: SetFn; reset: () => void; resultCount: number }) {
  const sheet = useRef<SheetHandle>(null);
  const more = moreFilterCount(query);
  const all = activeFilterCount(query);
  const cat = CATEGORIES.find((c) => c.id === query.category);
  const band = PRICE_BANDS.find((b) => b.id === query.price);
  const chip = "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border bg-card px-3.5 text-[13px]";
  // A filter with only one choice filters nothing, so it is not shown.
  const opts = optionsFor(query.tab);
  const showPurity = opts.purities.length > 1 || query.purity.length > 0;
  const showCategory = opts.categories.length > 1 || !!query.category;
  // Bridal, one tap: the occasion filter, brought out of "More filters".
  const bridalOn = query.occasion === "bridal" || query.tab === "bridal";
  const { pieces } = useCatalogue();
  const showBridal = bridalOn || pieces.some((p) => p.occasions.includes("bridal"));
  const toggleBridal = () => set(bridalOn ? { occasion: null, tab: query.tab === "bridal" ? "jewellery" : query.tab } : { occasion: "bridal" });

  return (
    <div className="sticky top-[var(--header-h)] z-20 border-b border-line bg-chalk/95 backdrop-blur-sm">
      {/* Desktop */}
      <div className="page page-x hidden items-center gap-2 py-3 lg:flex">
        <TabSwitch query={query} set={set} />
        <div className="min-w-0 flex-1"><LocationBox query={query} set={set} /></div>
        {showCategory && <Popover label={cat?.label ?? "Category"} active={!!cat}><CategoryOptions query={query} set={set} /></Popover>}
        {showPurity && <Popover label={query.purity.length ? query.purity.join(", ") : "Purity"} active={query.purity.length > 0} width="w-60"><PurityOptions query={query} set={set} /></Popover>}
        <Popover label={band?.label ?? "Price"} active={!!band}><PriceOptions query={query} set={set} /></Popover>
        {showBridal && (
          <button type="button" aria-pressed={bridalOn} onClick={toggleBridal}
            className={`inline-flex h-11 items-center rounded-full border px-4 text-[14px] transition-colors ${bridalOn ? "border-cocoa bg-cocoa text-cream" : "border-line-strong bg-card text-ink-soft hover:border-ink hover:text-ink"}`}>
            Bridal
          </button>
        )}
        <button type="button" onClick={() => sheet.current?.open()}
          className={`inline-flex h-11 items-center gap-2 rounded-full border bg-card px-4 text-[14px] ${more ? "border-ink text-ink" : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"}`}>
          <SlidersIcon className="size-4" /> More filters
          {more > 0 && <span className="min-w-5 rounded-full bg-terracotta px-1.5 text-center text-[11px] leading-5 text-white">{more}</span>}
        </button>
        {all > 0 && (
          <button type="button" onClick={reset} className="h-11 px-2 text-[13px] text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink">
            Reset
          </button>
        )}
      </div>

      {/* Phone and tablet: search box, then a row of filter chips. */}
      <div className="page-x space-y-2 py-2.5 lg:hidden">
        <LocationBox query={query} set={set} />
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <button type="button" onClick={() => sheet.current?.open()} className={`${chip} ${all ? "border-cocoa bg-cocoa text-cream" : "border-line-strong text-ink"}`}>
            <SlidersIcon className="size-4" /> Filters{all > 0 && ` · ${all}`}
          </button>
          {[
            showCategory && { label: cat?.label ?? "Category", on: !!cat },
            showPurity && { label: query.purity.length ? query.purity.join(", ") : "Purity", on: query.purity.length > 0 },
            { label: band?.label ?? "Price", on: !!band },
          ].filter((c): c is { label: string; on: boolean } => !!c).map((c) => (
            <button key={c.label} type="button" onClick={() => sheet.current?.open()} className={`${chip} ${c.on ? "border-ink text-ink" : "border-line-strong text-ink-soft"}`}>
              {c.label} <ChevronIcon className="size-3 text-stone" />
            </button>
          ))}
          {showBridal && (
            <button type="button" aria-pressed={bridalOn} onClick={toggleBridal} className={`${chip} ${bridalOn ? "border-cocoa bg-cocoa text-cream" : "border-line-strong text-ink-soft"}`}>
              Bridal
            </button>
          )}
          <label className={`${chip} relative border-line-strong text-ink-soft`}>
            {SORTS.find((s) => s.id === query.sort)!.label} <ChevronIcon className="size-3 text-stone" />
            <select aria-label="Sort" value={query.sort} onChange={(e) => set({ sort: e.target.value as Query["sort"] })} className="absolute inset-0 opacity-0">
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <Sheet
        ref={sheet}
        title="Filters"
        wide
        full
        footer={
          <div className="flex items-center gap-4">
            <button type="button" onClick={reset} className="h-11 px-1 text-[14px] text-ink-soft underline decoration-line-strong underline-offset-4">Reset all</button>
            <button type="button" onClick={() => sheet.current?.close()} className="h-12 flex-1 rounded-full bg-terracotta text-white transition-colors hover:bg-terracotta-deep text-[15px] font-medium">
              {resultCount === 0 ? "No pieces match" : `Show ${resultCount} ${resultCount === 1 ? "piece" : "pieces"}`}
            </button>
          </div>
        }
      >
        <div className="lg:hidden">
          <TabSwitch query={query} set={set} className="mb-5" />
          {showCategory && <Block title="Category"><CategoryOptions query={query} set={set} /></Block>}
          {showPurity && <Block title="Purity"><PurityOptions query={query} set={set} /></Block>}
          <Block title="Price"><PriceOptions query={query} set={set} /></Block>
        </div>
        <MoreOptions query={query} set={set} />
      </Sheet>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line pb-4 pt-1 mb-4">
      <legend className="sr-only">{title}</legend>
      <p className="mb-1 text-[14px] font-medium">{title}</p>
      {children}
    </fieldset>
  );
}
