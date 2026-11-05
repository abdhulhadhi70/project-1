"use client";
import { useEffect, useState } from "react";
import { usePortalShop } from "@/components/portal/PortalShell";
import { RequestList } from "@/components/portal/RequestList";
import { Notice } from "@/components/portal/ui";
import { listPieces, listRequests, type PieceRow, type VisitRequestRow } from "@/lib/portal";

export default function Requests() {
  const { shop } = usePortalShop();
  const [requests, setRequests] = useState<VisitRequestRow[] | null>(null);
  const [pieces, setPieces] = useState<PieceRow[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    listRequests(shop.shopId).then(setRequests).catch((e) => setError(e.message));
    listPieces(shop.shopId).then(setPieces).catch(() => {});
  }, [shop.shopId]);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!requests) return <p className="text-[14px] text-stone">Loading…</p>;
  return <RequestList requests={requests} setRequests={setRequests} pieces={pieces} />;
}
