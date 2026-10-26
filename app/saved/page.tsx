"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PieceGrid } from "@/components/PieceCard";
import { pieceBySlug } from "@/data/catalogue";
import { useSaved } from "@/lib/saved";

export default function SavedPage() {
  const { saved } = useSaved();
  // Saved pieces live in this browser, which the server cannot see; wait for
  // it rather than flashing "nothing saved" first.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const list = saved.flatMap((s) => pieceBySlug.get(s) ?? []);

  return (
    <section className="page page-x pt-8 md:pt-14">
      <div className="flex items-baseline gap-4 border-b border-line pb-5">
        <h1 className="font-serif text-[40px] leading-none tracking-[-0.015em] md:text-[52px]">Saved</h1>
        {ready && list.length > 0 && <p className="text-[13px] text-stone">{list.length} {list.length === 1 ? "piece" : "pieces"}</p>}
      </div>
      <p className="mt-3 text-[13px] text-stone">Kept in this browser only. Nothing is sent anywhere, and there is no account.</p>
      <div className="mt-8">
        {!ready ? null : list.length ? (
          <PieceGrid pieces={list} />
        ) : (
          <div className="py-16 text-center md:py-24">
            <p className="font-serif text-[28px] leading-tight">Nothing saved yet.</p>
            <p className="mx-auto mt-3 max-w-sm text-[14px] text-stone">Tap the heart on any piece to keep it here while you compare.</p>
            <Link href="/#pieces" className="mt-6 inline-flex h-11 items-center border border-ink px-5 text-[14px] hover:bg-ink hover:text-chalk">
              Browse the collection
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
