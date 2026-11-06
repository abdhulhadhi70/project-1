"use client";
// The floating "Gold price" button: one tap shows the day's rate per gram
// for each purity, from anywhere on the public site.
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Purity } from "@/data/catalogue";
import { useCatalogue } from "@/lib/catalogue-store";
import { dateText } from "@/lib/format";
import { Sheet, type SheetHandle } from "./Sheet";

// Portals and sign-in pages have their own work to do; the button stays off them.
const HIDDEN = ["/dashboard", "/admin", "/login", "/join", "/forgot-password", "/reset-password", "/account"];
const ORDER: Purity[] = ["24K", "22K", "21K", "18K"];
const rate = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const NOTE: Partial<Record<Purity, string>> = { "24K": "Coins and bars", "22K": "Most jewellery", "21K": "Gulf jewellery", "18K": "Diamond and fine pieces" };

export function GoldRateButton() {
  const pathname = usePathname();
  const sheet = useRef<SheetHandle>(null);
  const { rates } = useCatalogue();
  // Shrinks to a round icon while scrolling down so it never sits on a price;
  // opens out again on scrolling up or near the top.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 6) { setCompact(y > 240 && y > last); last = y; }
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (HIDDEN.some((p) => pathname.startsWith(p))) return null;
  const list = ORDER.filter((k) => rates.perGram[k]);
  const time = new Date(rates.asOf).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" });
  // On a piece page the WhatsApp/Call bar sits at the bottom of a phone, so the button rides above it.
  const lift = pathname.startsWith("/piece") ? "bottom-[calc(7.25rem+env(safe-area-inset-bottom))] lg:bottom-6" : "bottom-[max(1rem,env(safe-area-inset-bottom))] md:bottom-6";

  return (
    <>
      <button type="button" onClick={() => sheet.current?.open()}
        aria-label={`Gold price${rates.perGram["22K"] ? `, 22K ${rate(rates.perGram["22K"])} AED per gram` : ""}. Open today's gold rates.`}
        className={`fixed right-4 z-30 inline-flex h-12 items-center overflow-hidden rounded-full bg-cocoa pl-2.5 text-[14px] font-medium text-cream shadow-[0_14px_30px_-12px_rgb(30_20_16/0.65)] ring-1 ring-gold/40 transition-[padding,transform] duration-200 active:scale-95 md:right-6 ${compact ? "pr-2.5" : "pr-5"} ${lift}`}>
        <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-gold text-[13px] text-cocoa">✦</span>
        <span aria-hidden className={`flex items-center gap-2 whitespace-nowrap transition-[max-width,opacity,margin] duration-200 ${compact ? "ml-0 max-w-0 opacity-0" : "ml-2 max-w-48 opacity-100"}`}>
          Gold price
          <span className="text-gold tabular-nums">{rates.perGram["22K"] ? rate(rates.perGram["22K"]) : ""}</span>
        </span>
      </button>

      <Sheet ref={sheet} title="Today's gold price" kicker={rates.source === "sample" ? "Sample rates, not live" : "Set by our team"}>
        <p className="text-[13px] text-stone">
          {dateText(rates.asOf)}, {time} UAE time · AED per gram
        </p>
        <ul className="mt-4 grid gap-2.5">
          {list.map((k) => (
            <li key={k} className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3.5">
              <span>
                <span className="block text-[17px] font-semibold text-ink">{k}</span>
                {NOTE[k] && <span className="block text-[12px] text-stone">{NOTE[k]}</span>}
              </span>
              <span className="text-[22px] font-semibold tabular-nums text-brass-deep">{rate(rates.perGram[k])}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] leading-relaxed text-stone">
          The rate for the gold alone. A piece also has a making charge and, for jewellery, 5% VAT. Each shop&apos;s own rate may differ slightly.
        </p>
        <button type="button" onClick={() => sheet.current?.close()}
          className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full border border-ink text-[15px] text-ink hover:bg-limestone">
          Close
        </button>
      </Sheet>
    </>
  );
}
