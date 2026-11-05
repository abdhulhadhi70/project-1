"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PieceList } from "@/components/portal/PieceList";
import { Notice, input } from "@/components/portal/ui";
import { listShops } from "@/lib/admin";
import { listPieces, type PieceRow, type ShopRow } from "@/lib/portal";

function All() {
  const initialShop = useSearchParams().get("shop") ?? "";
  const [shopId, setShopId] = useState(initialShop);
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [pieces, setPieces] = useState<PieceRow[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { listShops().then(setShops).catch((e) => setError(e.message)); }, []);
  useEffect(() => { setPieces(null); listPieces(shopId || undefined).then(setPieces).catch((e) => setError(e.message)); }, [shopId]);
  const name = (p: PieceRow) => shops.find((s) => s.id === p.shop_id)?.name ?? "";
  if (error) return <Notice tone="error">{error}</Notice>;
  return (
    <div className="space-y-4">
      <label className="block max-w-sm text-[13px] text-stone">Jeweller
        <select className={input} value={shopId} onChange={(e) => setShopId(e.target.value)}>
          <option value="">All jewellers</option>
          {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      {!pieces ? <p className="text-[14px] text-stone">Loading…</p> : (
        <PieceList pieces={pieces} setPieces={setPieces} editHref={(p) => `/admin/piece?id=${p.id}`} shopName={name} shopNames={!shopId}
          newHref={shopId ? `/admin/piece?shop=${shopId}` : undefined} />
      )}
      {!shopId && <p className="text-[12px] text-stone">To add a piece, choose the jeweller first.</p>}
    </div>
  );
}

export default function AdminPieces() {
  return <Suspense fallback={<p className="text-[14px] text-stone">Loading…</p>}><All /></Suspense>;
}
