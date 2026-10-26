"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryState } from "@/lib/use-query-state";
import { CloseIcon, SearchIcon } from "./Icons";

export const SEARCH_INPUT_ID = "site-search";

export function SearchField({ className = "" }: { className?: string }) {
  const { query, set } = useQueryState();
  const pathname = usePathname();
  const onCatalogue = pathname === "/";
  const [value, setValue] = useState(query.q);
  const typing = useRef(false);

  // Follow the URL when it changes from elsewhere (reset, back button).
  useEffect(() => {
    if (!typing.current) setValue(query.q);
  }, [query.q]);

  // On the catalogue, results follow the typing; elsewhere, Enter searches.
  useEffect(() => {
    if (!onCatalogue || !typing.current) return;
    const t = setTimeout(() => {
      set({ q: value });
      typing.current = false;
    }, 160);
    return () => clearTimeout(t);
  }, [value, onCatalogue, set]);

  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        typing.current = false;
        set({ q: value }, { jump: true });
        (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.blur();
      }}
    >
      <label htmlFor={SEARCH_INPUT_ID} className="sr-only">Search jewellery</label>
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-stone" />
      <input
        id={SEARCH_INPUT_ID}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          typing.current = true;
          setValue(e.target.value);
        }}
        placeholder="Find a chain, ring, pendant..."
        className="h-10 w-full rounded-[3px] bg-limestone pl-10 pr-10 text-[14px] text-ink placeholder:text-stone outline-none transition-colors focus:bg-chalk focus:ring-1 focus:ring-line-strong [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            typing.current = false;
            setValue("");
            set({ q: "" });
          }}
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-stone hover:text-ink"
          aria-label="Clear search"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </form>
  );
}
