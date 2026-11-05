"use client";
import { useEffect, useState } from "react";
import { RequestList } from "@/components/portal/RequestList";
import { Button, Notice } from "@/components/portal/ui";
import { downloadCsv, listShops } from "@/lib/admin";
import { listPieces, listRequests, type PieceRow, type ShopRow, type VisitRequestRow } from "@/lib/portal";

export default function AdminRequests() {
  const [requests, setRequests] = useState<VisitRequestRow[] | null>(null);
  const [pieces, setPieces] = useState<PieceRow[]>([]);
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([listRequests(), listPieces(), listShops()]).then(([r, p, s]) => { setRequests(r); setPieces(p); setShops(s); }).catch((e) => setError(e.message));
  }, []);
  const shopName = (id: string) => shops.find((s) => s.id === id)?.name ?? "";
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!requests) return <p className="text-[14px] text-stone">Loading…</p>;
  return (
    <div className="space-y-4">
      <Button variant="secondary" disabled={!requests.length} onClick={() => downloadCsv("visit-requests.csv",
        ["Date", "Jeweller", "Piece", "Customer", "Phone", "Visit day", "Status", "Note"],
        requests.map((r) => [r.created_at.slice(0, 10), shopName(r.shop_id), pieces.find((p) => p.id === r.piece_id)?.code ?? "", r.customer_name, r.customer_phone, r.preferred_date, r.status, r.note]))}>
        Export CSV
      </Button>
      <RequestList requests={requests} setRequests={setRequests} pieces={pieces} shopName={shopName} />
    </div>
  );
}
