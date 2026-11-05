"use client";
import { useEffect, useState } from "react";
import { usePortalShop } from "@/components/portal/PortalShell";
import { PieceList } from "@/components/portal/PieceList";
import { Notice } from "@/components/portal/ui";
import { listPieces, type PieceRow } from "@/lib/portal";

export default function Pieces() {
  const { shop } = usePortalShop();
  const [pieces, setPieces] = useState<PieceRow[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { listPieces(shop.shopId).then(setPieces).catch((e) => setError(e.message)); }, [shop.shopId]);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!pieces) return <p className="text-[14px] text-stone">Loading…</p>;
  return <PieceList pieces={pieces} setPieces={setPieces} editHref={(p) => `/dashboard/piece?id=${p.id}`} shopName={() => shop.shopName} newHref="/dashboard/piece" />;
}
