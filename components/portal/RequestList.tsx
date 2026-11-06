"use client";
// Customers who asked to come and see a piece. The shop calls or messages
// them, then records what happened.
import { useState } from "react";
import { dateText } from "@/lib/format";
import { setRequestStatus, type PieceRow, type VisitRequestRow } from "@/lib/portal";
import { Empty, Notice } from "./ui";

const STATUSES: { id: VisitRequestRow["status"]; label: string }[] = [
  { id: "new", label: "New" }, { id: "contacted", label: "Contacted" }, { id: "visited", label: "Visited" }, { id: "no_show", label: "Didn't come" },
];

export function RequestList({ requests, setRequests, pieces, shopName }: {
  requests: VisitRequestRow[]; setRequests: (r: VisitRequestRow[]) => void; pieces: PieceRow[]; shopName?: (shopId: string) => string;
}) {
  const [error, setError] = useState("");
  if (!requests.length) return <Empty title="No visit requests yet.">When a customer taps “I&apos;ll visit to see this”, their name, number and day appear here.</Empty>;
  return (
    <div className="space-y-3">
      {error && <Notice tone="error">{error}</Notice>}
      <ul className="divide-y divide-line rounded-2xl border border-line bg-card px-4">
        {requests.map((r) => {
          const piece = pieces.find((p) => p.id === r.piece_id);
          const phone = r.customer_phone.replace(/[^\d+]/g, "");
          const wa = phone.replace(/^\+/, "").replace(/^0/, "971");
          return (
            <li key={r.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-[15px] text-ink">{r.customer_name} · <a href={`tel:${phone}`} className="underline decoration-line-strong underline-offset-4">{r.customer_phone}</a></p>
                <p className="text-[13px] text-stone">
                  {shopName && `${shopName(r.shop_id)} · `}{piece ? `${piece.name} (${piece.code})` : "No piece given"}
                  {" · "}{r.preferred_date ? `Plans to visit ${dateText(r.preferred_date)}` : "No day given"} · asked {dateText(r.created_at)}
                </p>
                {r.note && <p className="mt-1 text-[13px] text-ink-soft">“{r.note}”</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" className="inline-flex h-10 items-center border border-line-strong px-3 text-[13px] hover:border-ink">WhatsApp</a>
                <select aria-label={`Status for ${r.customer_name}`} value={r.status} className="h-11 rounded-xl border border-line-strong bg-card px-2.5 text-[16px] md:h-10 md:text-[13px]"
                  onChange={async (e) => {
                    const status = e.target.value as VisitRequestRow["status"];
                    setError("");
                    try { await setRequestStatus(r.id, status); setRequests(requests.map((x) => (x.id === r.id ? { ...x, status } : x))); }
                    catch (err) { setError((err as Error).message); }
                  }}>
                  {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
