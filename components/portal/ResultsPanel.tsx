"use client";
// "My results": what customers did in the last 30 days. This is the proof
// that the listing is worth the subscription, so it is the first thing a
// jeweller sees.
import { useEffect, useState } from "react";
import { results as loadResults, type PieceRow, type Results } from "@/lib/portal";
import { Card, Notice } from "./ui";

const LABELS: [keyof Results["counts"], string][] = [
  ["piece_view", "Piece views"], ["shop_view", "Shop page views"], ["whatsapp_click", "WhatsApp taps"],
  ["call_click", "Call taps"], ["directions_click", "Directions"], ["visit_request", "Visit requests"],
];

export function ResultsPanel({ shopId, pieces, title = "Last 30 days" }: { shopId?: string; pieces?: PieceRow[]; title?: string }) {
  const [r, setR] = useState<Results | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { loadResults(shopId).then(setR).catch((e) => setError(e.message)); }, [shopId]);
  if (error) return <Notice tone="error">{error}</Notice>;
  const top = r && pieces ? [...r.byPiece.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, n]) => ({ piece: pieces.find((p) => p.id === id), n })).filter((x) => x.piece) : [];
  return (
    <Card title={title}>
      <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-6">
        {LABELS.map(([k, label]) => (
          <div key={k} className="bg-card p-3">
            <dt className="text-[12px] text-stone">{label}</dt>
            <dd className="mt-1 text-[24px] font-semibold tabular-nums">{r ? r.counts[k] : "…"}</dd>
          </div>
        ))}
      </dl>
      {pieces && (
        <div className="mt-4">
          <p className="text-[13px] font-medium">Pieces customers contacted you about most</p>
          {top.length ? (
            <ol className="mt-2 divide-y divide-line border-y border-line text-[14px]">
              {top.map(({ piece, n }) => <li key={piece!.id} className="flex justify-between py-2"><span>{piece!.name}</span><span className="tabular-nums text-stone">{n}</span></li>)}
            </ol>
          ) : <p className="mt-1 text-[13px] text-stone">Nothing yet. Taps on WhatsApp, Call, Directions and visit requests for each piece will show here.</p>}
        </div>
      )}
      <p className="mt-3 text-[12px] text-stone">Counted without collecting anything personal about customers. Demonstration shops aren&apos;t counted.</p>
    </Card>
  );
}
