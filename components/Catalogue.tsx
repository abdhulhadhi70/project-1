"use client";
import { useEffect, useId, useRef, useState } from "react";
import { CATEGORIES, pieces as allPieces, shopBySlug } from "@/data/catalogue";
import {
  PRICE_BANDS, SORTS, activeFilterCount, filterPieces, locationLabel, locationOptions, priceBandsInUse,
  purityOptions, runQuery, slug, type Query,
} from "@/lib/catalogue-query";
import { useQueryState } from "@/lib/use-query-state";
import { ChevronIcon, CloseIcon, SearchIcon, SlidersIcon } from "./Icons";
import { PieceGrid } from "./PieceCard";
import { SEARCH_INPUT_ID } from "./SearchField";

export function Catalogue() {
  const { query, set, reset } = useQueryState();
  const results = runQuery(query);
  const filtersOn = activeFilterCount(query) > 0 || query.q.trim() !== "";

  return (
    <section id="pieces" aria-labelledby="pieces-title" className="scroll-mt-28 md:scroll-mt-20">
      <CategoryIndex query={query} onPick={(category) => set({ category })} />

      <div className="page page-x">
        <Toolbar query={query} set={set} reset={reset} filtersOn={filtersOn} resultCount={results.length} />

        <div className="mt-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 md:mt-12">
          <div className="flex items-baseline gap-4">
            <h2 id="pieces-title" className="font-serif text-[30px] leading-none tracking-[-0.01em] md:text-[40px]">
              Pieces worth discovering
            </h2>
            <p className="text-[13px] text-stone" aria-live="polite">
              {results.length} {results.length === 1 ? "design" : "designs"}
            </p>
          </div>
          <div className="hidden md:block">
            <SortSelect value={query.sort} onChange={(sort) => set({ sort })} />
          </div>
        </div>

        <div className="mt-6 md:mt-9">
          {results.length ? (
            <PieceGrid pieces={results} eager={4} />
          ) : (
            <Empty query={query} onReset={reset} />
          )}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Category index: text, like the contents line of a magazine.
// ---------------------------------------------------------------------------
function CategoryIndex({ query, onPick }: { query: Query; onPick: (c: Query["category"]) => void }) {
  const pool = filterPieces(allPieces, query, "category");
  const items = [
    { id: null, label: "All jewellery", count: pool.length },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, count: pool.filter((p) => p.category === c.id).length })),
  ];
  return (
    <nav aria-label="Categories" className="border-y border-line">
      <ul className="page page-x no-scrollbar flex gap-7 overflow-x-auto md:gap-10">
        {items.map((it) => {
          const active = query.category === it.id;
          return (
            <li key={it.label} className="shrink-0">
              <button
                type="button"
                onClick={() => onPick(it.id)}
                aria-pressed={active}
                className={`relative flex h-12 items-center gap-1.5 text-[14px] transition-colors md:h-14 md:text-[15px] ${
                  active ? "text-ink" : "text-stone hover:text-ink"
                }`}
              >
                {it.label}
                <span className="-translate-y-1 text-[11px] tabular-nums text-stone">{it.count}</span>
                <span
                  aria-hidden
                  className={`absolute inset-x-0 -bottom-px h-px bg-ink transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------
type SetFn = ReturnType<typeof useQueryState>["set"];

function Toolbar({ query, set, reset, filtersOn, resultCount }: {
  query: Query; set: SetFn; reset: () => void; filtersOn: boolean; resultCount: number;
}) {
  const sheet = useRef<HTMLDialogElement>(null);
  const count = activeFilterCount(query);

  return (
    <div className="pt-4 md:pt-5">
      {/* Phone: one button opens everything in a bottom sheet. */}
      <div className="flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => sheet.current?.showModal()}
          className="inline-flex h-10 items-center gap-2 text-[14px] text-ink"
        >
          <SlidersIcon />
          Filters
          {count > 0 && <span className="min-w-5 rounded-full bg-ink px-1.5 text-center text-[11px] leading-5 text-chalk">{count}</span>}
        </button>
        <div className="flex items-center gap-4">
          {filtersOn && <ResetButton onClick={reset} />}
          <SortSelect value={query.sort} onChange={(sort) => set({ sort })} />
        </div>
      </div>

      {/* Desktop: the controls themselves, quiet until opened. */}
      <div className="hidden items-center gap-1 md:flex">
        <SlidersIcon className="mr-2 size-[18px] text-stone" />
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById(SEARCH_INPUT_ID);
            el?.focus();
          }}
          className="inline-flex h-10 items-center gap-1.5 px-3 text-[14px] text-ink-soft hover:text-ink"
        >
          <SearchIcon className="size-4" /> Search
        </button>
        <Popover label="Price" active={!!query.price}>
          <PriceOptions query={query} set={set} />
        </Popover>
        {purityOptions.length > 1 && (
          <Popover label="Purity" active={query.purity.length > 0}>
            <PurityOptions query={query} set={set} />
          </Popover>
        )}
        <Popover label="Location" active={!!query.location}>
          <LocationOptions query={query} set={set} />
        </Popover>
        {filtersOn && (
          <span className="ml-auto">
            <ResetButton onClick={reset} />
          </span>
        )}
      </div>

      <ActiveChips query={query} set={set} />

      <dialog
        ref={sheet}
        aria-labelledby="sheet-title"
        onClick={(e) => e.target === e.currentTarget && sheet.current?.close()}
        className="m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-hidden bg-chalk p-0 text-ink backdrop:bg-ink/40 open:flex open:flex-col md:hidden"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <h2 id="sheet-title" className="text-[15px] font-medium">Filters</h2>
          <button type="button" onClick={() => sheet.current?.close()} className="grid size-11 place-items-center -mr-2" aria-label="Close filters">
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 space-y-7 overflow-y-auto px-4 py-5">
          <SheetSection title="Price"><PriceOptions query={query} set={set} /></SheetSection>
          {purityOptions.length > 1 && <SheetSection title="Purity"><PurityOptions query={query} set={set} /></SheetSection>}
          <SheetSection title="Location"><LocationOptions query={query} set={set} /></SheetSection>
        </div>
        <div className="flex items-center gap-4 border-t border-line px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={reset} className="h-11 px-1 text-[14px] text-ink-soft underline decoration-line-strong underline-offset-4">
            Reset
          </button>
          <button
            type="button"
            onClick={() => sheet.current?.close()}
            className="h-11 flex-1 bg-ink text-[14px] font-medium text-chalk"
          >
            {resultCount === 0 ? "No pieces match" : `Show ${resultCount} ${resultCount === 1 ? "piece" : "pieces"}`}
          </button>
        </div>
      </dialog>
    </div>
  );
}

function SheetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[12px] tracking-[0.04em] text-stone">{title}</legend>
      {children}
    </fieldset>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-10 text-[13px] text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink">
      Reset all
    </button>
  );
}

function Popover({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
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
        className={`inline-flex h-10 items-center gap-1.5 px-3 text-[14px] transition-colors ${active || open ? "text-ink" : "text-ink-soft hover:text-ink"}`}
      >
        {label}
        {active && <span aria-label="(active)" className="size-1.5 rounded-full bg-brass" />}
        <ChevronIcon className={`size-3.5 text-stone transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          id={id}
          className="absolute left-0 top-full z-20 mt-1 w-72 border border-line bg-chalk p-4 shadow-[0_16px_32px_-20px_rgb(37_36_31/0.35)]"
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Option lists, shared by the popovers and the sheet. Each option shows how
// many pieces it would leave, so nothing leads to an empty page unannounced.
// ---------------------------------------------------------------------------
function OptionRow({ type, name, checked, disabled, onChange, label, count }: {
  type: "radio" | "checkbox"; name: string; checked: boolean; disabled?: boolean; onChange: () => void; label: string; count?: number;
}) {
  return (
    <label className={`flex min-h-10 cursor-pointer items-center gap-3 text-[14px] ${disabled ? "cursor-default text-stone/60" : "text-ink"}`}>
      <input
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className={`size-4 appearance-none border border-line-strong bg-chalk checked:border-ink checked:bg-ink disabled:opacity-40 ${type === "radio" ? "rounded-full checked:shadow-[inset_0_0_0_3px_var(--color-chalk)]" : "rounded-[2px] checked:shadow-[inset_0_0_0_2.5px_var(--color-chalk)]"}`}
      />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-[12px] tabular-nums text-stone">{count}</span>}
    </label>
  );
}

function PriceOptions({ query, set }: { query: Query; set: SetFn }) {
  const pool = filterPieces(allPieces, query, "price");
  const onRequest = pool.filter((p) => p.price.kind === "on_request").length;
  return (
    <div>
      <OptionRow type="radio" name="price" label="Any price" checked={!query.price} onChange={() => set({ price: null })} count={pool.length} />
      {priceBandsInUse.map((b) => {
        const n = pool.filter((p) => p.price.kind !== "on_request" && p.price.aed >= b.min && p.price.aed < b.max).length;
        return (
          <OptionRow key={b.id} type="radio" name="price" label={b.label} checked={query.price === b.id}
            disabled={n === 0 && query.price !== b.id} onChange={() => set({ price: b.id })} count={n} />
        );
      })}
      {onRequest > 0 && (
        <p className="mt-2 text-[12px] leading-snug text-stone">
          {onRequest} {onRequest === 1 ? "piece has" : "pieces have"} no published price and {onRequest === 1 ? "is" : "are"} hidden while a range is chosen.
        </p>
      )}
    </div>
  );
}

function PurityOptions({ query, set }: { query: Query; set: SetFn }) {
  const pool = filterPieces(allPieces, query, "purity");
  return (
    <div>
      {purityOptions.map((p) => {
        const on = query.purity.includes(p);
        const n = pool.filter((x) => x.purity === p).length;
        return (
          <OptionRow key={p} type="checkbox" name="purity" label={`${p} gold`} checked={on} disabled={n === 0 && !on}
            onChange={() => set({ purity: on ? query.purity.filter((x) => x !== p) : [...query.purity, p] })} count={n} />
        );
      })}
    </div>
  );
}

function LocationOptions({ query, set }: { query: Query; set: SetFn }) {
  const pool = filterPieces(allPieces, query, "location");
  const countIn = (id: string) => {
    const [emirate, area] = id.split("/");
    return pool.filter((p) => {
      const s = shopBySlug.get(p.shop)!;
      return slug(s.emirate) === emirate && (!area || slug(s.area) === area);
    }).length;
  };
  return (
    <div>
      <OptionRow type="radio" name="location" label="All UAE" checked={!query.location} onChange={() => set({ location: null })} count={pool.length} />
      {locationOptions.map((e) => (
        <div key={e.id}>
          <OptionRow type="radio" name="location" label={e.label} checked={query.location === e.id}
            onChange={() => set({ location: e.id })} count={countIn(e.id)} />
          {e.areas.length > 1 && (
            <div className="pl-7">
              {e.areas.map((a) => (
                <OptionRow key={a.id} type="radio" name="location" label={a.label} checked={query.location === a.id}
                  onChange={() => set({ location: a.id })} count={countIn(a.id)} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
function ActiveChips({ query, set }: { query: Query; set: SetFn }) {
  const chips: { label: string; clear: () => void }[] = [];
  if (query.q.trim()) chips.push({ label: `“${query.q.trim()}”`, clear: () => set({ q: "" }) });
  if (query.price) chips.push({ label: PRICE_BANDS.find((b) => b.id === query.price)!.label, clear: () => set({ price: null }) });
  for (const p of query.purity) chips.push({ label: p, clear: () => set({ purity: query.purity.filter((x) => x !== p) }) });
  if (query.location) chips.push({ label: locationLabel(query.location), clear: () => set({ location: null }) });
  if (query.shop) chips.push({ label: shopBySlug.get(query.shop)!.name, clear: () => set({ shop: null }) });
  if (!chips.length) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2" aria-label="Active filters">
      {chips.map((c) => (
        <li key={c.label}>
          <button
            type="button"
            onClick={c.clear}
            className="inline-flex h-8 items-center gap-1.5 border border-line-strong pl-3 pr-2 text-[13px] text-ink hover:border-ink"
            aria-label={`Remove filter ${c.label}`}
          >
            {c.label}
            <CloseIcon className="size-3.5 text-stone" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function SortSelect({ value, onChange }: { value: Query["sort"]; onChange: (s: Query["sort"]) => void }) {
  return (
    <label className="relative inline-flex h-10 items-center gap-1.5 text-[13px] text-stone">
      Sort
      <span className="text-ink">{SORTS.find((s) => s.id === value)!.label}</span>
      <ChevronIcon className="size-3.5" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Query["sort"])}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Sort pieces"
      >
        {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </label>
  );
}

function Empty({ query, onReset }: { query: Query; onReset: () => void }) {
  return (
    <div className="border-t border-line py-16 text-center md:py-24">
      <p className="font-serif text-[28px] leading-tight">Nothing matches that yet.</p>
      <p className="mx-auto mt-3 max-w-sm text-[14px] text-stone">
        {query.q.trim()
          ? `No piece mentions “${query.q.trim()}” with these filters. Try a broader word, such as chain or ring.`
          : "No piece fits all of these filters together. Removing one usually helps."}
      </p>
      <button type="button" onClick={onReset} className="mt-6 h-11 border border-ink px-5 text-[14px] hover:bg-ink hover:text-chalk">
        Show all pieces
      </button>
    </div>
  );
}
