"use client";
// A one-page report for a jeweller: print it, or "Save as PDF" from the print
// dialog, to send with the monthly invoice.
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ResultsPanel } from "@/components/portal/ResultsPanel";
import { Button, Notice } from "@/components/portal/ui";
import { dateText } from "@/lib/format";
import { getShop, listPieces, listRequests, type PieceRow, type ShopRow, type VisitRequestRow } from "@/lib/portal";

function Report() {
  const params = useSearchParams();
  const id = params.get("shop") ?? "";
  const days = Number(params.get("days")) || 30;
  const [shop, setShop] = useState<ShopRow | null>(null);
  const [pieces, setPieces] = useState<PieceRow[]>([]);
  const [requests, setRequests] = useState<VisitRequestRow[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([getShop(id), listPieces(id), listRequests(id)])
      .then(([s, p, r]) => { setShop(s); setPieces(p); setRequests(r); }).catch((e) => setError(e.message));
  }, [id]);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!shop) return <p className="text-[14px] text-stone">Loading…</p>;
  const since = Date.now() - days * 86400_000;
  const recent = requests.filter((r) => new Date(r.created_at).getTime() >= since);
  const listed = pieces.filter((p) => p.status === "available" || p.status === "reserved_in_store").length;
  return (
    <div className="space-y-5 print:space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] text-stone">Report · last {days} days · to {dateText(new Date().toISOString())}</p>
          <h1 className="font-serif text-[32px] leading-none">{shop.name}</h1>
        </div>
        <Button variant="secondary" onClick={() => window.print()} className="print:hidden">Print or save as PDF</Button>
      </div>
      <ResultsPanel shopId={id} pieces={pieces} title={`What customers did in the last ${days} days`} />
      <dl className="grid grid-cols-3 gap-px border border-line bg-line text-[14px]">
        <div className="bg-chalk p-3"><dt className="text-[12px] text-stone">Pieces listed</dt><dd className="text-[22px] font-semibold">{listed}</dd></div>
        <div className="bg-chalk p-3"><dt className="text-[12px] text-stone">Visit requests</dt><dd className="text-[22px] font-semibold">{recent.length}</dd></div>
        <div className="bg-chalk p-3"><dt className="text-[12px] text-stone">Of which visited</dt><dd className="text-[22px] font-semibold">{recent.filter((r) => r.status === "visited").length}</dd></div>
      </dl>
    </div>
  );
}

export default function ReportPage() {
  return <Suspense fallback={<p className="text-[14px] text-stone">Loading…</p>}><Report /></Suspense>;
}
