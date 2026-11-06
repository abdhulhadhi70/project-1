"use client";
// The gold price button in the homepage's corner. Open at the top of the
// page; while you scroll it shrinks to a small gold circle so it covers as
// little as possible. One tap opens today's rates; a double click (or the
// button inside the panel) goes to the price calculator.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Purity } from "@/data/catalogue";
import { useCatalogue } from "@/lib/catalogue-store";
import { dateText } from "@/lib/format";
import { ArrowIcon } from "./Icons";
import { Sheet, type SheetHandle } from "./Sheet";

const ORDER: Purity[] = ["24K", "22K", "21K", "18K"];
const rate = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const NOTE: Partial<Record<Purity, string>> = { "24K": "Coins and bars", "22K": "Most jewellery", "21K": "Gulf jewellery", "18K": "Diamond and fine pieces" };
const DOUBLE_MS = 280;

export function GoldRateButton() {
  const router = useRouter();
  const sheet = useRef<SheetHandle>(null);
  const tap = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { rates } = useCatalogue();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const on = () => setCompact(window.scrollY > 120);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => () => { if (tap.current) clearTimeout(tap.current); }, []);

  // One click opens the rates; a second click within a moment goes to the
  // calculator instead. Keyboard Enter opens the rates straight away.
  const click = (e: React.MouseEvent) => {
    if (e.detail === 0) return sheet.current?.open();
    if (tap.current) { clearTimeout(tap.current); tap.current = null; router.push("/gold-price"); return; }
    tap.current = setTimeout(() => { tap.current = null; sheet.current?.open(); }, DOUBLE_MS);
  };

  const list = ORDER.filter((k) => rates.perGram[k]);
  const time = new Date(rates.asOf).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" });

  return (
    <>
      <button type="button" onClick={click} title="Tap for today's gold rates · double-click to calculate a price"
        aria-label={`Gold price${rates.perGram["22K"] ? `, 22K ${rate(rates.perGram["22K"])} AED per gram` : ""}. Open today's gold rates.`}
        className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-12 touch-manipulation items-center overflow-hidden rounded-full bg-cocoa pl-2.5 text-[14px] font-medium text-cream shadow-[0_10px_24px_-12px_rgb(30_20_16/0.7)] ring-1 ring-gold/40 transition-[padding,transform] duration-200 active:scale-95 md:bottom-6 md:right-6 ${compact ? "pr-2.5" : "pr-5"}`}>
        <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-gold text-[13px] text-cocoa">✦</span>
        <span aria-hidden className={`flex items-center gap-2 whitespace-nowrap transition-[max-width,opacity,margin] duration-200 ${compact ? "ml-0 max-w-0 opacity-0" : "ml-2 max-w-48 opacity-100"}`}>
          Gold price
          <span className="text-gold tabular-nums">{rates.perGram["22K"] ? rate(rates.perGram["22K"]) : ""}</span>
        </span>
      </button>

      <Sheet ref={sheet} title="Today's gold price" kicker={rates.source === "sample" ? "Sample rates, not live" : "Set by our team"}>
        <p className="text-[13px] text-stone">{dateText(rates.asOf)}, {time} UAE time · AED per gram</p>
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-card">
          {list.map((k) => (
            <li key={k} className="flex items-center justify-between px-4 py-3">
              <span>
                <span className="block text-[16px] font-semibold text-ink">{k}</span>
                {NOTE[k] && <span className="block text-[12px] text-stone">{NOTE[k]}</span>}
              </span>
              <span className="text-[20px] font-semibold tabular-nums text-brass-deep">{rate(rates.perGram[k])}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] leading-relaxed text-stone">
          The rate for the gold alone. A piece also has a making charge and, for jewellery, 5% VAT. Each shop&apos;s own rate may differ slightly.
        </p>
        <Link href="/gold-price" onClick={() => sheet.current?.close()}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta text-[15px] text-white transition-colors hover:bg-terracotta-deep">
          Work out a piece&apos;s price <ArrowIcon />
        </Link>
      </Sheet>
    </>
  );
}
