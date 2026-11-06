"use client";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { useEffect, useState } from "react";
import { ResultCard } from "@/components/search/ResultCard";
import { CloseIcon } from "@/components/Icons";
import { useCatalogue } from "@/lib/catalogue-store";
import { useSaved } from "@/lib/saved";
import { useSavedSearches } from "@/lib/saved-searches";

export default function SavedPage() {
  const { saved } = useSaved();
  const { pieceBySlug } = useCatalogue();
  const { searches, remove } = useSavedSearches();
  const [tab, setTab] = useState<"pieces" | "searches">("pieces");
  // Saved items live in this browser, which the server cannot see; wait for
  // it rather than flashing "nothing saved" first.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const list = saved.flatMap((s) => pieceBySlug.get(s) ?? []);

  return (
    <>
    <PageHeader title="Saved" intro="Kept in this browser only. Nothing is sent anywhere, and there is no account." />
    <section className="page page-x pt-6 md:pt-8">
      <div role="tablist" className="inline-flex rounded-full border border-line-strong bg-card p-1">
        {([["pieces", `Pieces${ready ? ` (${list.length})` : ""}`], ["searches", `Searches${ready ? ` (${searches.length})` : ""}`]] as const).map(([id, label]) => (
          <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`h-10 rounded-full px-4 text-[14px] ${tab === id ? "bg-cocoa text-cream" : "text-ink-soft hover:text-ink"}`}>{label}</button>
        ))}
      </div>
      <div className="mt-6">
        {!ready ? null : tab === "pieces" ? (
          list.length ? (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
              {list.map((p) => <li key={p.slug}><ResultCard piece={p} layout="grid" /></li>)}
            </ul>
          ) : (
            <EmptyState title="No saved pieces yet." text="Tap the heart on any piece to keep it here while you compare." />
          )
        ) : searches.length ? (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-card px-4">
            {searches.map((s) => (
              <li key={s.href} className="flex items-center justify-between gap-4 py-3">
                <Link href={s.href} className="min-w-0">
                  <span className="block truncate text-[15px] text-ink hover:underline">{s.title}</span>
                  <span className="block text-[12px] text-stone">Saved {new Date(s.savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                </Link>
                <button type="button" onClick={() => remove(s.href)} className="grid size-10 shrink-0 place-items-center text-stone hover:text-ink" aria-label={`Remove saved search ${s.title}`}>
                  <CloseIcon className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No saved searches yet." text="On any search page, press Save search to keep it here. Alerts for new matches arrive with accounts." />
        )}
      </div>
    </section>
    </>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="py-16 text-center md:py-24">
      <p className="font-serif text-[28px] leading-tight">{title}</p>
      <p className="mx-auto mt-3 max-w-sm text-[14px] text-stone">{text}</p>
      <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full border border-ink px-5 text-[14px] hover:bg-cocoa hover:text-cream">Start searching</Link>
    </div>
  );
}
