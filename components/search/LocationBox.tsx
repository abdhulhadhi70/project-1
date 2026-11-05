"use client";
// The main search box. Like Property Finder's location field it suggests
// places as you type; it also suggests categories and jewellers, and plain
// words become a keyword search.
import { useId, useRef, useState } from "react";
import { locationLabel, suggest, type Query, type Suggestion } from "@/lib/catalogue-query";
import { getCatalogue } from "@/lib/catalogue-store";
import { CloseIcon, PinIcon, SearchIcon } from "../Icons";

type Props = {
  query: Query;
  set: (patch: Partial<Query>) => void;
  placeholder?: string;
  /** Larger field for the homepage hero. */
  size?: "md" | "lg";
  autoFocus?: boolean;
  onDone?: () => void;
};

const KIND_LABEL = { place: "Location", category: "Category", shop: "Jeweller" } as const;

export function LocationBox({ query, set, placeholder = "Area, souk, jeweller or piece", size = "md", autoFocus, onDone }: Props) {
  const [text, setText] = useState(query.q);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const items = suggest(text);

  const choose = (s: Suggestion) => {
    if (s.kind === "place") set({ location: s.id, q: "" });
    if (s.kind === "category") set({ category: s.id, q: "" });
    if (s.kind === "shop") set({ shop: s.id, q: "" });
    setText("");
    setOpen(false);
    onDone?.();
  };
  const submit = () => {
    if (open && items[active]) return choose(items[active]);
    set({ q: text });
    setOpen(false);
    onDone?.();
  };

  const chips: { label: string; clear: Partial<Query> }[] = [];
  if (query.location) chips.push({ label: locationLabel(query.location).split(",")[0], clear: { location: null } });
  if (query.shop) chips.push({ label: getCatalogue().shopBySlug.get(query.shop)?.name ?? "", clear: { shop: null } });

  const h = size === "lg" ? "min-h-14 text-[16px]" : "min-h-11 text-[14px]";
  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className={`flex flex-wrap items-center gap-1.5 border border-line-strong bg-chalk pl-3 pr-1 focus-within:border-ink ${h}`}>
        {chips.length ? <PinIcon className="size-[17px] shrink-0 text-stone" /> : <SearchIcon className="size-[17px] shrink-0 text-stone" />}
        {chips.map((c) => (
          <span key={c.label} className="inline-flex h-7 items-center gap-1 bg-limestone pl-2.5 pr-1 text-[13px] text-ink">
            {c.label}
            <button type="button" onClick={() => set(c.clear)} className="grid size-6 place-items-center text-stone hover:text-ink" aria-label={`Remove ${c.label}`}>
              <CloseIcon className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          ref={input}
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && items[active] ? `${listId}-${active}` : undefined}
          aria-label="Search by area, souk, jeweller or piece"
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          value={text}
          placeholder={chips.length ? "Add a keyword" : placeholder}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Escape") setOpen(false);
          }}
          className="min-w-[8rem] flex-1 bg-transparent py-2 text-ink outline-none placeholder:text-stone"
        />
        {text && (
          <button type="button" onClick={() => { setText(""); set({ q: "" }); input.current?.focus(); }} className="grid size-9 place-items-center text-stone hover:text-ink" aria-label="Clear">
            <CloseIcon className="size-4" />
          </button>
        )}
      </div>
      {open && items.length > 0 && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-40 mt-1 border border-line bg-chalk py-1 shadow-[0_16px_32px_-20px_rgb(37_36_31/0.35)]">
          {items.map((s, i) => (
            <li
              key={`${s.kind}-${s.id}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); choose(s); }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-baseline justify-between gap-4 px-3 py-2.5 text-[14px] ${i === active ? "bg-limestone" : ""}`}
            >
              <span className="text-ink">{s.label}<span className="ml-2 text-[12px] text-stone">{s.detail}</span></span>
              <span className="text-[11px] text-stone">{KIND_LABEL[s.kind]}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
