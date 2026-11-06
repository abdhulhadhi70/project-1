"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CATEGORIES } from "@/data/catalogue";
import { getCatalogue, useCatalogue } from "@/lib/catalogue-store";
import {
  PRICE_BANDS, SORTS, WEIGHT_BANDS, liveAreas, locationLabel, paginate, parseQuery, runQuery, searchHref, toSearchParams, type Query,
} from "@/lib/catalogue-query";
import { describeQuery } from "@/lib/describe";
import { useSavedSearches } from "@/lib/saved-searches";
import { useQueryState } from "@/lib/use-query-state";
import { OCCASIONS, STYLES, WEARERS } from "@/data/catalogue";
import { BookmarkIcon, ChevronIcon, CloseIcon, GridIcon, ListIcon, MapIcon } from "../Icons";
import { FilterBar } from "./FilterBar";
import { Pagination } from "./Pagination";
import { ResultCard } from "./ResultCard";
import { groupByShop } from "./map-shops";

// Leaflet touches `window`, so the map loads only in the browser, and only
// when someone opens the map view.
const ResultsMap = dynamic(() => import("./ResultsMap"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-limestone" />,
});

type View = "list" | "grid" | "map";

export function SearchView() {
  const catalogue = useCatalogue(); // re-render when the live catalogue arrives
  const { query, set, reset } = useQueryState();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view: View = (["grid", "map"] as const).find((v) => v === params.get("view")) ?? "list";
  const setView = (v: View) => {
    const p = new URLSearchParams(params.toString());
    if (v === "list") p.delete("view"); else p.set("view", v);
    router.replace(`${pathname}${p.size ? `?${p}` : ""}`, { scroll: false });
  };

  const results = useMemo(() => runQuery(query, catalogue.pieces), [query, catalogue]);
  const paged = paginate(results, query.page);
  const title = describeQuery(query);
  const savedHref = `/?${toSearchParams({ ...query, page: 1 }).toString()}`.replace(/\?$/, "");
  const { isSaved, toggle } = useSavedSearches();
  const saved = isSaved(savedHref);

  return (
    <>
      <FilterBar query={query} set={set} reset={reset} resultCount={results.length} />

      <div className="page page-x pb-16">
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <h1 className="font-serif text-[28px] leading-[1.05] tracking-[-0.01em] md:text-[36px]">{title}</h1>
            <p className="mt-1.5 text-[13px] text-stone" aria-live="polite">
              {results.length} {results.length === 1 ? "result" : "results"}
              {paged.pages > 1 && ` · page ${paged.page} of ${paged.pages}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => toggle(savedHref, title)} aria-pressed={saved}
              className={`inline-flex h-10 items-center gap-2 rounded-full border bg-card px-3.5 text-[13px] ${saved ? "border-ink text-ink" : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"}`}>
              <BookmarkIcon filled={saved} className="size-4" /> {saved ? "Search saved" : "Save search"}
            </button>
            <label className="relative hidden h-10 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3.5 text-[13px] text-stone lg:inline-flex">
              Sort: <span className="text-ink">{SORTS.find((s) => s.id === query.sort)!.label}</span>
              <ChevronIcon className="size-3.5" />
              <select aria-label="Sort results" value={query.sort} onChange={(e) => set({ sort: e.target.value as Query["sort"] })} className="absolute inset-0 cursor-pointer opacity-0">
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <div role="group" aria-label="View" className="flex rounded-full border border-line-strong bg-card p-0.5">
              {([["list", ListIcon, "List"], ["grid", GridIcon, "Grid"], ["map", MapIcon, "Map"]] as const).map(([v, Icon, label]) => (
                <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} title={`${label} view`}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] ${view === v ? "bg-cocoa text-cream" : "text-ink-soft hover:text-ink"}`}>
                  <Icon className="size-4" /><span className="max-sm:sr-only">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <ActiveChips query={query} set={set} />

        {results.length === 0 ? (
          <Empty query={query} onReset={reset} />
        ) : view === "map" ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="order-2 space-y-4 lg:order-1">
              {paged.items.map((p, i) => <ResultCard key={p.slug} piece={p} priority={i < 2} />)}
              <div className="pt-4"><Pagination page={paged.page} pages={paged.pages} onPage={(page) => set({ page })} /></div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="h-[46vh] lg:sticky lg:top-[calc(var(--header-h)+5.5rem)] lg:h-[calc(100dvh-var(--header-h)-7rem)]">
                <ResultsMap shops={groupByShop(results)} onPick={(shop) => set({ shop })} className="size-full overflow-hidden rounded-2xl border border-line" />
              </div>
              <p className="mt-1.5 text-[12px] text-stone">Pins show demonstration jewellers at approximate positions in real gold districts.</p>
            </div>
          </div>
        ) : (
          <>
            <ul className={`mt-5 ${view === "grid" ? "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4" : "grid gap-4 xl:grid-cols-2"}`}>
              {paged.items.map((p, i) => (
                <li key={p.slug}><ResultCard piece={p} layout={view === "grid" ? "grid" : "list"} priority={i < 2} /></li>
              ))}
            </ul>
            <div className="mt-10"><Pagination page={paged.page} pages={paged.pages} onPage={(page) => set({ page })} /></div>
          </>
        )}

        <RelatedSearches query={query} />
      </div>
    </>
  );
}

function ActiveChips({ query, set }: { query: Query; set: (p: Partial<Query>) => void }) {
  const chips: { label: string; clear: Partial<Query> }[] = [];
  const lab = <T extends string>(list: readonly { id: T; label: string }[], id: T | null) => list.find((x) => x.id === id)?.label;
  if (query.q.trim()) chips.push({ label: `“${query.q.trim()}”`, clear: { q: "" } });
  if (query.location) chips.push({ label: locationLabel(query.location), clear: { location: null } });
  if (query.shop) chips.push({ label: getCatalogue().shopBySlug.get(query.shop)?.name ?? query.shop, clear: { shop: null } });
  if (query.category) chips.push({ label: lab(CATEGORIES, query.category)!, clear: { category: null } });
  for (const p of query.purity) chips.push({ label: p, clear: { purity: query.purity.filter((x) => x !== p) } });
  if (query.price) chips.push({ label: lab(PRICE_BANDS, query.price)!, clear: { price: null } });
  if (query.weight) chips.push({ label: lab(WEIGHT_BANDS, query.weight)!, clear: { weight: null } });
  if (query.making) chips.push({ label: `Making up to AED ${query.making}/g`, clear: { making: null } });
  if (query.occasion) chips.push({ label: lab(OCCASIONS, query.occasion)!, clear: { occasion: null } });
  if (query.wearer) chips.push({ label: `For ${lab(WEARERS, query.wearer)!.toLowerCase()}`, clear: { wearer: null } });
  if (query.style) chips.push({ label: lab(STYLES, query.style)!, clear: { style: null } });
  if (query.stones) chips.push({ label: query.stones === "with" ? "With stones" : "Plain gold", clear: { stones: null } });
  if (!chips.length) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
      {chips.map((c) => (
        <li key={c.label}>
          <button type="button" onClick={() => set(c.clear)} aria-label={`Remove filter ${c.label}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-limestone pl-3.5 pr-2.5 text-[13px] text-ink hover:bg-limestone-deep">
            {c.label} <CloseIcon className="size-3.5 text-stone" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function Empty({ query, onReset }: { query: Query; onReset: () => void }) {
  return (
    <div className="mt-6 rounded-3xl border border-line bg-card px-5 py-16 text-center md:py-24">
      <p className="font-serif text-[28px] leading-tight">Nothing matches that yet.</p>
      <p className="mx-auto mt-3 max-w-sm text-[14px] text-stone">
        {query.q.trim()
          ? `No piece mentions “${query.q.trim()}” with these filters. Try a broader word, such as chain or ring.`
          : "No piece fits all of these filters together. Removing one usually helps."}
      </p>
      <button type="button" onClick={onReset} className="mt-6 h-11 rounded-full border border-ink px-5 text-[14px] hover:bg-cocoa hover:text-cream">Clear filters</button>
    </div>
  );
}

/** The links Property Finder lists under results: the same search nearby, or nearby searches here. */
function RelatedSearches({ query }: { query: Query }) {
  const cat = CATEGORIES.find((c) => c.id === query.category);
  const inArea = query.location && getCatalogue().areaBySlug.get(query.location);
  const links = cat
    ? liveAreas().filter((a) => a.slug !== query.location).slice(0, 8).map((a) => ({ href: searchHref({ tab: query.tab, category: cat.id, location: a.slug }), label: `${cat.label} in ${a.name}` }))
    : CATEGORIES.filter((c) => c.section === (query.tab === "coins_bars" ? "coins_bars" : "jewellery")).map((c) => ({
        href: searchHref({ tab: query.tab, category: c.id, location: query.location }),
        label: `${c.label}${inArea ? ` in ${inArea.name}` : ""}`,
      }));
  const live = links.filter((l) => runQuery(parseQuery(new URLSearchParams(l.href.split("?")[1] ?? ""))).length > 0);
  if (!live.length) return null;
  return (
    <section className="mt-16 border-t border-line pt-6" aria-labelledby="related">
      <h2 id="related" className="text-[14px] font-medium">Related searches</h2>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
        {live.map((l) => <li key={l.href}><Link href={l.href} className="text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink">{l.label}</Link></li>)}
      </ul>
    </section>
  );
}
