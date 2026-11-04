"use client";
// "I'll visit to see this": the jewellery version of booking a viewing.
// The shop gets a name, a phone number and a day. Nothing else is asked for.
import { useRef, useState } from "react";
import type { Shop } from "@/data/catalogue";
import { Sheet, type SheetHandle } from "../Sheet";

const field = "mt-1.5 h-11 w-full border border-line-strong bg-chalk px-3 text-[15px] text-ink outline-none focus:border-ink";

export function VisitRequest({ shop, pieceName, pieceCode }: { shop: Shop; pieceName: string; pieceCode: string }) {
  const sheet = useRef<SheetHandle>(null);
  const [done, setDone] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <button type="button" onClick={() => { setDone(false); sheet.current?.open(); }}
        className="h-12 w-full border border-line-strong text-[14px] text-ink hover:border-ink">
        I&apos;ll visit to see this
      </button>
      <Sheet ref={sheet} title="Arrange a visit" kicker={`${pieceName} · ${shop.name}`}>
        {done ? (
          <div className="space-y-3 py-2 text-[14px] text-ink-soft">
            <p className="text-[16px] font-medium text-ink">{shop.demo ? "Not sent: this is a demonstration listing" : "Request sent"}</p>
            <p>
              {shop.demo
                ? `${shop.name} is invented for the prototype, so nobody receives this. With a real jeweller, they would get your name, number and day, and confirm the piece is put aside.`
                : `${shop.name} will call or message you to confirm. Quote reference ${pieceCode} when you arrive.`}
            </p>
            <button type="button" onClick={() => sheet.current?.close()} className="mt-2 h-11 w-full border border-ink">Close</button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            <p className="text-[13px] text-stone">The shop sees only what you enter here. No payment and no deposit: you see the piece first.</p>
            <label className="block text-[13px] text-stone">Your name<input name="name" required maxLength={100} autoComplete="name" className={field} /></label>
            <label className="block text-[13px] text-stone">Mobile number
              <input name="phone" type="tel" required inputMode="tel" autoComplete="tel" placeholder="05x xxx xxxx" pattern="^\+?[0-9 ]{7,20}$" className={field} />
            </label>
            <label className="block text-[13px] text-stone">Day you plan to visit<input name="date" type="date" min={today} className={field} /></label>
            <label className="block text-[13px] text-stone">Note (optional)<textarea name="note" rows={3} maxLength={500} className={`${field} h-auto py-2`} /></label>
            <button type="submit" className="h-12 w-full bg-ink text-[14px] font-medium text-chalk hover:bg-ink-soft">Send to {shop.name}</button>
          </form>
        )}
      </Sheet>
    </>
  );
}
