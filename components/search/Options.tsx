"use client";
// Filter option lists, shared by the desktop popovers and the phone sheet.
// Each option shows how many pieces it would leave, and options with
// nothing behind them are disabled rather than leading to an empty page.
import { getCatalogue } from "@/lib/catalogue-store";
import {
  MAKING_LIMITS, PRICE_BANDS, WEIGHT_BANDS, filterPieces, makingPerGram, optionsFor, type FilterKey, type Query,
} from "@/lib/catalogue-query";

export type SetFn = (patch: Partial<Query>) => void;

export function OptionRow({ type, name, checked, disabled, onChange, label, count }: {
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
        className={`size-4 shrink-0 appearance-none border border-line-strong bg-chalk checked:border-ink checked:bg-ink disabled:opacity-40 ${
          type === "radio" ? "rounded-full checked:shadow-[inset_0_0_0_3px_var(--color-chalk)]" : "rounded-[2px] checked:shadow-[inset_0_0_0_2.5px_var(--color-chalk)]"
        }`}
      />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-[12px] tabular-nums text-stone">{count}</span>}
    </label>
  );
}

/** Pill-style single choice, used inside the "More filters" panel. */
export function ChoiceRow<T extends string | number>({ options, value, onChange, counts }: {
  options: { id: T; label: string }[]; value: T | null; onChange: (v: T | null) => void; counts?: (id: T) => number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o.id;
        const n = counts?.(o.id);
        const off = n === 0 && !on;
        return (
          <button
            key={String(o.id)}
            type="button"
            disabled={off}
            aria-pressed={on}
            onClick={() => onChange(on ? null : o.id)}
            className={`h-9 border px-3 text-[13px] transition-colors disabled:opacity-40 ${on ? "border-ink bg-ink text-chalk" : "border-line-strong text-ink hover:border-ink"}`}
          >
            {o.label}
            {n !== undefined && <span className={`ml-1.5 tabular-nums ${on ? "text-chalk/70" : "text-stone"}`}>{n}</span>}
          </button>
        );
      })}
    </div>
  );
}

const pool = (query: Query, skip: FilterKey) => filterPieces(getCatalogue().pieces, query, skip);

export function CategoryOptions({ query, set }: { query: Query; set: SetFn }) {
  const p = pool(query, "category");
  const { categories } = optionsFor(query.tab);
  return (
    <div>
      <OptionRow type="radio" name="category" label="All categories" checked={!query.category} onChange={() => set({ category: null })} count={p.length} />
      {categories.map((c) => {
        const n = p.filter((x) => x.category === c.id).length;
        return <OptionRow key={c.id} type="radio" name="category" label={c.label} checked={query.category === c.id} disabled={n === 0 && query.category !== c.id} onChange={() => set({ category: c.id })} count={n} />;
      })}
    </div>
  );
}

export function PurityOptions({ query, set }: { query: Query; set: SetFn }) {
  const p = pool(query, "purity");
  return (
    <div>
      {optionsFor(query.tab).purities.map((x) => {
        const on = query.purity.includes(x);
        const n = p.filter((y) => y.purity === x).length;
        return (
          <OptionRow key={x} type="checkbox" name="purity" label={`${x} gold`} checked={on} disabled={n === 0 && !on}
            onChange={() => set({ purity: on ? query.purity.filter((y) => y !== x) : [...query.purity, x] })} count={n} />
        );
      })}
    </div>
  );
}

export function PriceOptions({ query, set }: { query: Query; set: SetFn }) {
  const p = pool(query, "price");
  const onRequest = p.filter((x) => x.price.kind === "on_request").length;
  return (
    <div>
      <OptionRow type="radio" name="price" label="Any price" checked={!query.price} onChange={() => set({ price: null })} count={p.length} />
      {PRICE_BANDS.map((b) => {
        const n = p.filter((x) => x.price.kind !== "on_request" && x.price.aed >= b.min && x.price.aed < b.max).length;
        if (n === 0 && query.price !== b.id) return null;
        return <OptionRow key={b.id} type="radio" name="price" label={b.label} checked={query.price === b.id} onChange={() => set({ price: b.id })} count={n} />;
      })}
      {onRequest > 0 && (
        <p className="mt-2 text-[12px] leading-snug text-stone">
          {onRequest} {onRequest === 1 ? "piece has" : "pieces have"} no published price and {onRequest === 1 ? "is" : "are"} hidden while a range is chosen.
        </p>
      )}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line py-4 first:pt-0 last:border-0">
      <legend className="sr-only">{title}</legend>
      <p className="text-[14px] font-medium">{title}</p>
      {hint && <p className="mb-2.5 mt-0.5 text-[12px] text-stone">{hint}</p>}
      <div className={hint ? "" : "mt-2.5"}>{children}</div>
    </fieldset>
  );
}

/** Everything behind "More filters": weight, making charge, occasion, who for, style, stones. */
export function MoreOptions({ query, set }: { query: Query; set: SetFn }) {
  const o = optionsFor(query.tab);
  const count = (skip: FilterKey, test: (p: import("@/data/catalogue").Piece) => boolean) => pool(query, skip).filter(test).length;
  return (
    <div>
      <Section title="Weight">
        <ChoiceRow options={[...WEIGHT_BANDS]} value={query.weight} onChange={(weight) => set({ weight })}
          counts={(id) => { const b = WEIGHT_BANDS.find((x) => x.id === id)!; return count("weight", (p) => p.weightGrams !== undefined && p.weightGrams >= b.min && p.weightGrams < b.max); }} />
      </Section>
      <Section title="Making charge" hint="Compared per gram, whichever way the shop quotes it.">
        <ChoiceRow options={MAKING_LIMITS.map((m) => ({ id: m, label: `Up to AED ${m}/g` }))} value={query.making} onChange={(making) => set({ making })}
          counts={(m) => count("making", (p) => { const x = makingPerGram(p); return x !== null && x <= m; })} />
      </Section>
      {o.occasions.length > 1 && (
        <Section title="Occasion">
          <ChoiceRow options={o.occasions} value={query.occasion} onChange={(occasion) => set({ occasion })}
            counts={(id) => count("occasion", (p) => p.occasions.includes(id))} />
        </Section>
      )}
      {o.wearers.length > 1 && (
        <Section title="For">
          <ChoiceRow options={o.wearers} value={query.wearer} onChange={(wearer) => set({ wearer })}
            counts={(id) => filterPieces(getCatalogue().pieces, { ...query, wearer: id }).length} />
        </Section>
      )}
      {o.styles.length > 1 && (
        <Section title="Style">
          <ChoiceRow options={o.styles} value={query.style} onChange={(style) => set({ style })}
            counts={(id) => count("style", (p) => p.style === id)} />
        </Section>
      )}
      {o.hasStones && (
        <Section title="Stones">
          <ChoiceRow options={[{ id: "without" as const, label: "Plain gold" }, { id: "with" as const, label: "With stones or pearls" }]}
            value={query.stones} onChange={(stones) => set({ stones })}
            counts={(id) => count("stones", (p) => (id === "with") === Boolean(p.stones))} />
        </Section>
      )}
    </div>
  );
}
