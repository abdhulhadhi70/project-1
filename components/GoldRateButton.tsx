"use client";
// The gold rate in the top bar: one tap shows the day's rate per gram for
// each purity. It lives in the header rather than floating over the page,
// so it can never cover a price or a button.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import type { Purity } from "@/data/catalogue";
import { useCatalogue } from "@/lib/catalogue-store";
import { dateText } from "@/lib/format";
import { ArrowIcon } from "./Icons";
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
  if (HIDDEN.some((p) => pathname.startsWith(p))) return null;
  const list = ORDER.filter((k) => rates.perGram[k]);
  const time = new Date(rates.asOf).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" });

  return (
    <>
      <button type="button" onClick={() => sheet.current?.open()}
        aria-label={`Gold price${rates.perGram["22K"] ? `, 22K ${rate(rates.perGram["22K"])} AED per gram` : ""}. Open today's gold rates.`}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-cocoa-line px-3 text-[12.5px] text-cream-soft transition-colors hover:border-gold hover:text-cream">
        <span aria-hidden className="size-1.5 rounded-full bg-gold" />
        <span className="max-[359px]:hidden">22K</span>
        <span className="font-medium tabular-nums text-gold">{rates.perGram["22K"] ? rate(rates.perGram["22K"]) : "—"}</span>
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
        <Link href="/gold-price" onClick={() => sheet.current?.close()}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta text-[15px] text-white transition-colors hover:bg-terracotta-deep">
          Work out a piece&apos;s price <ArrowIcon />
        </Link>
      </Sheet>
    </>
  );
}
