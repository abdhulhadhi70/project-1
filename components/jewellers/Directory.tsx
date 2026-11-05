"use client";
// Find a jeweller, like Property Finder's agent search: by name, area or
// speaking a language, as a list or on a map.
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { areaFor, pieceBySlug, pieces, shops } from "@/data/catalogue";
import { liveAreas, liveEmirates, slug } from "@/lib/catalogue-query";
import { ListIcon, MapIcon, SearchIcon } from "../Icons";
import { PieceImage } from "../PieceImage";
import { Monogram } from "../search/ResultCard";

const ResultsMap = dynamic(() => import("../search/ResultsMap"), { ssr: false, loading: () => <div className="size-full animate-pulse bg-limestone" /> });

const LANGUAGES = [...new Set(shops.flatMap((s) => s.languages))].sort();
const field = "h-11 border border-line-strong bg-chalk px-3 text-[14px] text-ink outline-none focus:border-ink";

export function Directory() {
  const [text, setText] = useState("");
  const [place, setPlace] = useState("");
  const [lang, setLang] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const router = useRouter();

  const list = useMemo(() => {
    const t = text.trim().toLowerCase();
    return shops.filter((s) => {
      const a = areaFor(s);
      if (t && ![s.name, s.speciality, a.name, s.about].join(" ").toLowerCase().includes(t)) return false;
      if (place && s.area !== place && slug(a.emirate) !== place) return false;
      if (lang && !s.languages.includes(lang)) return false;
      return true;
    });
  }, [text, place, lang]);
  const count = (slugName: string) => pieces.filter((p) => p.shop === slugName).length;

  return (
    <div className="page page-x pb-10">
      <div className="mt-5 grid gap-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="relative">
          <span className="sr-only">Jeweller name or speciality</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-stone" />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Jeweller name or speciality" className={`${field} w-full pl-10`} />
        </label>
        <label>
          <span className="sr-only">Area</span>
          <select value={place} onChange={(e) => setPlace(e.target.value)} className={`${field} w-full`}>
            <option value="">All areas</option>
            {liveEmirates.map((e) => (
              <optgroup key={e} label={e}>
                <option value={slug(e)}>All of {e}</option>
                {liveAreas.filter((a) => a.emirate === e).map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Language spoken</span>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className={`${field} w-full`}>
            <option value="">Any language</option>
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
        <div role="group" aria-label="View" className="flex">
          {([["list", ListIcon, "List"], ["map", MapIcon, "Map"]] as const).map(([v, Icon, label]) => (
            <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v}
              className={`-ml-px inline-flex h-11 flex-1 items-center justify-center gap-1.5 border px-3 text-[13px] first:ml-0 ${view === v ? "relative border-ink bg-ink text-chalk" : "border-line-strong text-ink-soft"}`}>
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-[13px] text-stone" aria-live="polite">{list.length} {list.length === 1 ? "jeweller" : "jewellers"}</p>

      {view === "map" && list.length > 0 && (
        <div className="mt-3 h-[60vh]">
          <ResultsMap shops={list.map((s) => ({ shop: s, count: count(s.slug), label: s.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2) }))}
            className="size-full border border-line" onPick={(s) => router.push(`/jewellers/${s}`)} />
        </div>
      )}

      {list.length === 0 ? (
        <div className="mt-6 border-t border-line py-16 text-center">
          <p className="font-serif text-[26px]">No jeweller matches that.</p>
          <button type="button" onClick={() => { setText(""); setPlace(""); setLang(""); }} className="mt-5 h-11 border border-ink px-5 text-[14px]">Show all jewellers</button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const a = areaFor(s);
            const cover = pieceBySlug.get(s.cover)!;
            return (
              <li key={s.slug}>
                <Link href={`/jewellers/${s.slug}`} className="group flex h-full flex-col border border-line hover:shadow-[0_12px_28px_-22px_rgb(37_36_31/0.5)]">
                  <div className="aspect-[16/9] overflow-hidden bg-limestone">
                    <PieceImage name={cover.images[0]} alt="" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="size-full object-cover transition-transform duration-700 ease-quiet group-hover:scale-[1.04]" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-3">
                      <Monogram name={s.name} className="size-10 text-[12px]" />
                      <div className="min-w-0">
                        <p className="truncate text-[16px] text-ink">{s.name}</p>
                        <p className="truncate text-[13px] text-stone">{a.name}, {a.emirate}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[14px] text-ink-soft">{s.speciality}</p>
                    <dl className="mt-3 space-y-1 text-[13px]">
                      <div className="flex gap-2"><dt className="w-16 shrink-0 text-stone">Speaks</dt><dd>{s.languages.join(", ")}</dd></div>
                      {s.hours && <div className="flex gap-2"><dt className="w-16 shrink-0 text-stone">Hours</dt><dd>{s.hours}</dd></div>}
                    </dl>
                    <p className="mt-auto pt-4 text-[13px] text-ink">{count(s.slug)} pieces listed →</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 text-[12px] text-stone">All jewellers shown are invented for the prototype.</p>
    </div>
  );
}
